from urllib.parse import urlparse
import hashlib
from typing import List, Dict, Any


def normalize_url(url: str) -> str:
    parsed = urlparse((url or "").lower())
    host = parsed.hostname or ""
    if host.startswith("www."):
        host = host[4:]
    return f"{host}{parsed.path or '/'}"


def soft_hash(finding: Dict[str, Any]) -> str:
    seed = str(finding.get("seed_id", ""))
    source_type = finding.get("source", {}).get("type", "")
    url = finding.get("source", {}).get("url", "")
    key = f"{seed}|{source_type}|{normalize_url(url)}"
    return hashlib.sha256(key.encode("utf-8", "ignore")).hexdigest()


def dedupe(findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    result: List[Dict[str, Any]] = []
    for f in findings:
        h = soft_hash(f)
        if h in seen:
            continue
        seen.add(h)
        result.append(f)
    return result


