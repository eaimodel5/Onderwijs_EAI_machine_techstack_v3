import re
from urllib.parse import urlparse
from typing import List, Dict, Any
import requests


def _allowed(host: str, allowlist: List[str]) -> bool:
    host = (host or "").lower()
    for entry in [x.strip().lower() for x in allowlist if x and x.strip()]:
        if entry.startswith(".") and host.endswith(entry):
            return True
        if host == entry:
            return True
    return False


def validate_findings(findings: List[Dict[str, Any]], allowlist: List[str], user_agent: str = "NGBSE/17.1") -> List[Dict[str, Any]]:
    if not allowlist:
        return [{**f, "validated": False} for f in findings]
    out: List[Dict[str, Any]] = []
    for f in findings:
        url = f.get("source", {}).get("url") or f.get("raw", {}).get("url")
        if not url:
            out.append({**f, "validated": False})
            continue
        hostname = (urlparse(url if re.match(r"^https?://", url) else "https://" + url).hostname or "")
        if not _allowed(hostname, allowlist):
            out.append({**f, "validated": False})
            continue
        try:
            r = requests.head(url, timeout=7, allow_redirects=True, headers={"User-Agent": user_agent})
            ok = 200 <= r.status_code < 400
            out.append({**f, "validated": ok, "status_code": r.status_code})
        except requests.RequestException:
            out.append({**f, "validated": False, "status_code": None})
    return out


