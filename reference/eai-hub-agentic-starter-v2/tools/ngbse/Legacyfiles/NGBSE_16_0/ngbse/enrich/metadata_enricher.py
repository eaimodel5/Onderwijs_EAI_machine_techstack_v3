from typing import List, Dict, Any
from ..logger import LOGGER

def enrich_findings(findings: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
    """
    Voegt eenvoudige metadata toe (bijv. asset_len, title presence).
    """
    for f in findings:
        raw = f.get("raw",{})
        title = (raw.get("title") or "").strip()
        f.setdefault("enrich", {})
        f["enrich"]["has_title"] = bool(title)
        f["enrich"]["asset_len"] = len(f.get("asset",""))
        f["enrich"]["source_type"] = f.get("source",{}).get("type","")
    LOGGER.info("enrich.done", n=len(findings))
    return findings
