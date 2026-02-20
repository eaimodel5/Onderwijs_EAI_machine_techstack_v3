
from urllib.parse import urlparse
import hashlib

def normalize_url(u: str) -> str:
    p = urlparse((u or '').lower())
    host = (p.hostname or '')
    if host.startswith('www.'): host = host[4:]
    return f"{host}{p.path or '/'}"

def soft_hash(f: dict) -> str:
    seed = f.get('seed',{}).get('seed','') if isinstance(f.get('seed'),dict) else str(f.get('seed',''))
    k = f"{seed}|{f.get('source')}|{normalize_url(f.get('url'))}"
    return hashlib.sha256(k.encode()).hexdigest()

def dedupe(findings: list) -> list:
    seen = set(); out = []
    for it in findings:
        h = soft_hash(it)
        if h in seen: continue
        seen.add(h); out.append(it)
    return out
