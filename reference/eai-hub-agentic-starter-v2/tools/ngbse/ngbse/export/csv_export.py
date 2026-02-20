import csv
from typing import List, Dict, Any


def write_csv(findings: List[Dict[str, Any]], path: str) -> None:
    if not findings:
        return
    flattened: List[Dict[str, Any]] = []
    for f in findings:
        row = dict(f)
        # Flatten nested structures we commonly use
        source = row.pop("source", {}) or {}
        raw = row.pop("raw", {}) or {}
        score = row.get("score", {}) or {}
        enrich = row.get("enrich", {}) or {}
        row.update({
            "source_type": source.get("type"),
            "source_url": source.get("url"),
            "source_domain": source.get("domain"),
            "raw_title": raw.get("title"),
            "score_e_ai_star": score.get("e_ai_star"),
            "enrich_has_title": enrich.get("has_title"),
            "enrich_asset_len": enrich.get("asset_len"),
        })
        flattened.append(row)
    keys = sorted({k for item in flattened for k in item.keys()})
    with open(path, "w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=keys, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(flattened)


