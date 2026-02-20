from stix2 import Bundle, Sighting, Indicator, Malware, Relationship
from typing import List, Dict, Any
from datetime import datetime

def to_indicator(f) -> Indicator:
    name = f.get("raw",{}).get("title") or f.get("source",{}).get("url","")
    pattern = "[url:value = '{}']".format(f.get("source",{}).get("url","").replace("'","\\'"))
    return Indicator(name=name or "Finding", pattern=pattern, created=datetime.utcnow())

def export_stix(findings: List[Dict[str,Any]], path: str):
    indicators = [to_indicator(f) for f in findings]
    b = Bundle(objects=indicators)
    with open(path, "w", encoding="utf-8") as f:
        f.write(str(b))
