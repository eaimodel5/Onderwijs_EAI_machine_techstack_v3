import os, json, datetime
from typing import List, Dict, Any
from .logger import LOGGER
from .utils import load_jsonl, write_jsonl
from .dedupe import dedupe
from .validation import validate_findings
from .collectors.http_web import HttpWebCollector
from .enrich.metadata_enricher import enrich_findings
from .scoring.scoring import score_findings, aggregate_asset_scores
from .synth.reverse_llm import coverage_gap, recency_gap, confidence_gap, synthesize_brief, synthesize_brief_llm
from .synth.scenario_engine import build_scenarios
from .forecast.forecast_engine import build_forecast
from .manifest import write_manifest
from .seedgen import propose_next_seeds

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

    # Build two waves of collectors
    enabled = getattr(getattr(config, "collectors", None), "enabled", None) or getattr(config, "collectors", {}).get("enabled", [])
    baseline_collectors = []
    second_collectors = []
    # Baseline
    if ("http_web" in enabled) or (not enabled):
        baseline_collectors.append(HttpWebCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
    try:
        if "urlscan" in enabled:
            from .collectors.urlscan import UrlscanCollector
            baseline_collectors.append(UrlscanCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "github" in enabled:
            from .collectors.github import GithubCollector
            baseline_collectors.append(GithubCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "wayback" in enabled:
            from .collectors.wayback import WaybackCollector
            baseline_collectors.append(WaybackCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        # Second wave
        if "leakix" in enabled:
            from .collectors.leakix import LeakixCollector
            second_collectors.append(LeakixCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "shodan" in enabled:
            from .collectors.shodan import ShodanCollector
            second_collectors.append(ShodanCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
        if "censys" in enabled:
            from .collectors.censys import CensysCollector
            second_collectors.append(CensysCollector(config=config, allow_domains=allow_domains, allow_orgs=allow_orgs))
    except Exception as e:
        LOGGER.warn("collector.load_warning", error=str(e))

    # Wave 1: run baseline collectors on all seeds
    baseline_findings: List[Dict[str,Any]] = []
    for seed in seeds:
        for c in baseline_collectors:
            try:
                c_findings = c.collect(seed, now_iso=now_iso)
                baseline_findings.extend(c_findings)
            except PermissionError as pe:
                LOGGER.warn("allowlist.blocked", seed=seed.get("id"), error=str(pe))
            except Exception as e:
                LOGGER.error("collector.failure", seed=seed.get("id"), error=str(e))

    # validation and deduplication
    findings = dedupe(baseline_findings)
    if getattr(config, "validation_enabled", False):
        findings = validate_findings(findings, allow_domains)

    findings = enrich_findings(findings)
    findings = score_findings(findings, now_iso=now_iso)

    asset_scores = aggregate_asset_scores(findings)
    write_jsonl(os.path.join(out_dir, "findings.jsonl"), findings)

    # blindspots
    cov = coverage_gap(findings)
    rec = recency_gap(findings)
    conf = confidence_gap(findings)
    blindspots = {"coverage": cov, "recency": rec, "confidence": conf}

    # Optional Wave 2: targeted leak/infra follow-ups
    run_second_wave = os.getenv("NGBSE_SECOND_WAVE", "1") == "1"
    second_findings: List[Dict[str,Any]] = []
    next_seeds = []
    try:
        next_seeds = propose_next_seeds(findings, asset_scores, blindspots)
        with open(os.path.join(out_dir, "seeds.next.jsonl"), "w", encoding="utf-8") as h:
            for s in next_seeds:
                h.write(json.dumps(s, ensure_ascii=False) + "\n")
    except Exception as e:
        LOGGER.warn("seedgen.failed", error=str(e))

    if run_second_wave and second_collectors:
        # select only infra/leak seeds from both original and proposed
        second_seed_pool = [s for s in seeds if (s.get("type") or "").lower() in ("infra","leak")]
        second_seed_pool.extend([s for s in next_seeds if (s.get("type") or "").lower() in ("infra","leak")])
        for seed in second_seed_pool:
            for c in second_collectors:
                try:
                    c_findings = c.collect(seed, now_iso=now_iso)
                    second_findings.extend(c_findings)
                except PermissionError as pe:
                    LOGGER.warn("allowlist.blocked", seed=seed.get("id"), error=str(pe))
                except Exception as e:
                    LOGGER.error("collector.failure", seed=seed.get("id"), error=str(e))

    # Final merge and outputs
    merged = findings + second_findings
    findings = dedupe(merged)
    if getattr(config, "validation_enabled", False):
        findings = validate_findings(findings, allow_domains)
    findings = enrich_findings(findings)
    findings = score_findings(findings, now_iso=now_iso)
    asset_scores = aggregate_asset_scores(findings)
    write_jsonl(os.path.join(out_dir, "findings.jsonl"), findings)

    # STIX export
    if config.output.stix:
        from .export.stix_exporter import export_stix
        export_stix(findings, os.path.join(out_dir, "stix", "bundle.json"))

    # CSV export
    if getattr(config.output, "csv", False):
        try:
            from .export.csv_export import write_csv as write_csv_export
            write_csv_export(findings, os.path.join(out_dir, "findings.csv"))
        except Exception as e:
            LOGGER.warn("export.csv_failed", error=str(e))

    # Forecast
    # save asset scores into history with timestamp filename
    ts = datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S")
    with open(os.path.join(out_dir, "history", f"{ts}.asset_scores.json"), "w", encoding="utf-8") as f:
        json.dump(asset_scores, f, ensure_ascii=False, indent=2)
    forecast = build_forecast(out_dir)

    # Brief synthesis (baseline + optional LLM overlay)
    brief = synthesize_brief_llm(
        findings,
        asset_scores,
        mode=(os.getenv("NGBSE_REVERSE_LLM_MODE", "none").lower() or "none"),
        provider_priority=config.llm.provider_priority,
        out_dir=out_dir,
    )

    # Scenario synthesis (prompt/api modes controlled by env via provider priority)
    scenarios = build_scenarios(findings, mode=(os.getenv("NGBSE_SCENARIO_MODE", "none").lower() or "none"), provider_priority=config.llm.provider_priority)

    # Report
    if config.output.docx_report:
        from .report.docx_reporter import write_report
        write_report(os.path.join(out_dir, "reports", f"ngbse_brief_{ts}.docx"), brief, blindspots, forecast, scenarios)

    # Manifest
    write_manifest(out_dir, config.version, seeds_path, "ngbse.config.yml", os.path.join(out_dir, "findings.jsonl"))

    # Proposed next-run seeds
    try:
        next_seeds = propose_next_seeds(findings, asset_scores, blindspots)
        with open(os.path.join(out_dir, "seeds.next.jsonl"), "w", encoding="utf-8") as h:
            for s in next_seeds:
                h.write(json.dumps(s, ensure_ascii=False) + "\n")
    except Exception as e:
        LOGGER.warn("seedgen.failed", error=str(e))

    # return summary
    return {
        "n_seeds": len(seeds),
        "n_findings": len(findings),
        "assets": list(asset_scores.keys()),
        "blindspots": blindspots,
        "forecast_keys": list(forecast.keys()),
        "n_scenarios": len(scenarios or {}),
        "n_next_seeds": len(next_seeds) if 'next_seeds' in locals() else 0,
    }
