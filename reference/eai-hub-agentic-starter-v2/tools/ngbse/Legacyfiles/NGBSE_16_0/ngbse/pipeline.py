import os, json, datetime
from typing import List, Dict, Any
from .logger import LOGGER
from .utils import load_jsonl, write_jsonl
from .collectors.http_web import HttpWebCollector
from .enrich.metadata_enricher import enrich_findings
from .scoring.scoring import score_findings, aggregate_asset_scores
from .synth.reverse_llm import coverage_gap, recency_gap, confidence_gap, synthesize_brief
from .export.stix_exporter import export_stix
from .forecast.forecast_engine import build_forecast
from .manifest import write_manifest

def run_pipeline(config, seeds_path: str, out_dir: str):
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(os.path.join(out_dir, "stix"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "reports"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "history"), exist_ok=True)

    seeds = load_jsonl(seeds_path)
    seeds = sorted(seeds, key=lambda s: float(s.get("priority",0.5)), reverse=True)
    allow_domains = config.allowlist.domains
    allow_orgs = config.allowlist.organizations
    now_iso = datetime.datetime.utcnow().isoformat()+"Z"

    collectors = []
    enabled = getattr(getattr(config, "collectors", None), "enabled", None) or getattr(config, "collectors", {}).get("enabled", [])
    # Always include http_web unless explicitly removed
    if ("http_web" in enabled) or (not enabled):
        collectors.append(HttpWebCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
    try:
        if "urlscan" in enabled:
            from .collectors.urlscan import UrlscanCollector
            collectors.append(UrlscanCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "github" in enabled:
            from .collectors.github import GithubCollector
            collectors.append(GithubCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "shodan" in enabled:
            from .collectors.shodan import ShodanCollector
            collectors.append(ShodanCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "censys" in enabled:
            from .collectors.censys import CensysCollector
            collectors.append(CensysCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "leakix" in enabled:
            from .collectors.leakix import LeakixCollector
            collectors.append(LeakixCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "wayback" in enabled:
            from .collectors.wayback import WaybackCollector
            collectors.append(WaybackCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
    except Exception as e:
        LOGGER.warn("collector.load_warning", error=str(e))

    all_findings: List[Dict[str,Any]] = []
    for seed in seeds:
        for c in collectors:
            try:
                c_findings = c.collect(seed, now_iso=now_iso)
                all_findings.extend(c_findings)
            except PermissionError as pe:
                LOGGER.warn("allowlist.blocked", seed=seed.get("id"), error=str(pe))
            except Exception as e:
                LOGGER.error("collector.failure", seed=seed.get("id"), error=str(e))

    # validation/dedup (simple URL-based)
    dedup = {}
    for f in all_findings:
        url = f.get("source",{}).get("url","")
        dedup[url] = f
    findings = list(dedup.values())

    findings = enrich_findings(findings)
    findings = score_findings(findings, now_iso=now_iso)

    asset_scores = aggregate_asset_scores(findings)
    write_jsonl(os.path.join(out_dir, "findings.jsonl"), findings)

    # blindspots
    cov = coverage_gap(findings)
    rec = recency_gap(findings)
    conf = confidence_gap(findings)
    blindspots = {"coverage": cov, "recency": rec, "confidence": conf}

    # STIX export
    if config.output.stix:
        export_stix(findings, os.path.join(out_dir, "stix", "bundle.json"))

    # Forecast
    # save asset scores into history with timestamp filename
    ts = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    with open(os.path.join(out_dir, "history", f"{ts}.asset_scores.json"), "w", encoding="utf-8") as f:
        json.dump(asset_scores, f, ensure_ascii=False, indent=2)
    forecast = build_forecast(out_dir)

    # Brief synthesis (LLM-free baseline)
    brief = synthesize_brief(findings, asset_scores)

    # Report
    if config.output.docx_report:
        from .report.docx_reporter import write_report
        write_report(os.path.join(out_dir, "reports", f"ngbse_brief_{ts}.docx"), brief, blindspots, forecast)

    # Manifest
    write_manifest(out_dir, config.version, seeds_path, "ngbse.config.yml", os.path.join(out_dir, "findings.jsonl"))

    # return summary
    return {
        "n_seeds": len(seeds),
        "n_findings": len(findings),
        "assets": list(asset_scores.keys()),
        "blindspots": blindspots,
        "forecast_keys": list(forecast.keys())
    }
