
import yaml, json, time, argparse
from pathlib import Path
from dotenv import load_dotenv
from engine.registry import load_collectors
from engine.fuzzy_dedupe import dedupe
from engine.validation import validate_findings
from enrich.enrichment import run_enrichment
from engine.scoring import run_scoring
from engine.predictive_synthesis import generate_synthesis
from engine.reverse_llm import analyze_blindspots
from report.make_report import build_report
from export.csv_export import write_csv
from export.stix_exporter import export_to_stix
from engine.logger import get_logger
from engine.version import __version__

def main():
    parser = argparse.ArgumentParser(description="NGBSE 11.1 Engine")
    args = parser.parse_args()
    cfg = yaml.safe_load(Path("config/ngbse.config.yml").read_text())
    log = get_logger("NGBSE-11.0", "out/run.log.jsonl")
    load_dotenv()
    # Load collectors
    collectors = load_collectors(cfg, log)
    # Load seeds
    seeds = [json.loads(line) for line in Path("data/seeds.jsonl").read_text().splitlines() if line.strip()]
    raw_findings = []
    for seed in seeds:
        name = seed.get("where")
        col = collectors.get(name)
        if not col: 
            log.error("Collector niet beschikbaar", {"collector": name}); 
            continue
        try:
            recs = col.collect(seed, cfg, log)
            raw_findings.extend(recs)
            time.sleep(cfg['orchestrator']['inter_collector_sleep_seconds'])
        except Exception as e:
            log.error("Collector crash", {"collector": name, "error": str(e)})
    # Dedupe
    unique = dedupe(raw_findings)
    # Validate
    if cfg.get("validation",{}).get("enabled", False):
        allowlist = Path(cfg["validation"]["allowlist_file"]).read_text().splitlines()
        validated = validate_findings(unique, allowlist, log)
    else:
        validated = unique
    # Enrich + Score
    enriched = run_enrichment(validated, cfg)
    scored = run_scoring(enriched, cfg)
    # Synthesis
    synth = generate_synthesis(scored, cfg, log)
    blindspots = analyze_blindspots(scored, synth)
    # Persist
    out_dir = Path("out"); out_dir.mkdir(exist_ok=True)
    (out_dir / "findings.jsonl").write_text("\n".join(json.dumps(f) for f in scored), encoding="utf-8")
    (out_dir / "blindspots.json").write_text(json.dumps(blindspots, indent=2, ensure_ascii=False), encoding="utf-8")
    (out_dir / "synthesis_report.json").write_text(json.dumps(synth, indent=2, ensure_ascii=False), encoding="utf-8")
    # Exports
    write_csv(scored, str(out_dir / "findings.csv"))
    export_to_stix(scored, synth, "NGBSE 11.1", str(out_dir / "findings.stix.json"))
    # Report
    report_path = build_report(scored, synth, blindspots)
    log.info(f"NGBSE 11.1 Run Voltooid. Rapport: {report_path}")
    print(f">>> NGBSE 11.1 Run Voltooid. Rapport: {report_path}")

if __name__ == "__main__": main()
