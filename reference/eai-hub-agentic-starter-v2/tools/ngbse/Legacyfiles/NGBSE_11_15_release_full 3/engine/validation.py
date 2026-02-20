
import re, requests
from urllib.parse import urlparse

def _allowed(host: str, allowlist: list) -> bool:
    host = (host or '').lower()
    for e in [x.strip().lower() for x in allowlist if x.strip()]:
        if e.startswith('.') and host.endswith(e): return True
        if host == e: return True
    return False

def validate_findings(findings: list, allowlist: list, log):
    if not allowlist:
        log.warning("Validatie ingeschakeld, maar allowlist is leeg.")
        return [{**i, "validated": False} for i in findings]
    out = []; ok_count = 0
    for i in findings:
        u = i.get("url")
        if not u: out.append({**i, "validated": False}); continue
        h = (urlparse(u if re.match(r"^https?://", u) else "https://" + u).hostname or "")
        if not _allowed(h, allowlist): out.append({**i, "validated": False}); continue
        try:
            r = requests.head(u, timeout=7, allow_redirects=True, headers={"User-Agent":"NGBSE/11.1"})
            ok = 200 <= r.status_code < 400
        except requests.RequestException:
            ok, r = False, None
        if ok: ok_count += 1
        out.append({**i, "validated": ok, "status_code": r.status_code if r else None})
    log.info(f"{ok_count} van de relevante bevindingen succesvol gevalideerd.")
    return out
