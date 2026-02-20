
import hashlib, json, time
from datetime import datetime, timezone

def sha256_bytes(b: bytes)->str:
    h=hashlib.sha256(); h.update(b); return h.hexdigest()

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def log_presence(outfile, source, query, item_id, url=None, meta=None):
    rec = {
        "ts": now_iso(),
        "source": source,
        "query": query,
        "id": item_id,
        "url": url,
        "meta": meta or {}
    }
    line = json.dumps(rec, ensure_ascii=False)
    with open(outfile, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    return rec
