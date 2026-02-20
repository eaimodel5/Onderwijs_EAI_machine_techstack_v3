
# presence-only LeakIX collector
import os, json, requests, sys
from engine.util import log_presence

API = os.getenv("LEAKIX_API_KEY", "").strip()
OUT = os.getenv("NGBSE_OUT", "findings.jsonl")

def search(query, limit=50):
    base = "https://leakix.net/api/search"
    headers = {"Accept": "application/json"}
    if API:
        headers["Authorization"] = f"Bearer {API}"
    params = {"q": query, "size": min(limit, 100)}
    r = requests.get(base, params=params, headers=headers, timeout=30)
    if r.status_code != 200:
        return []
    return r.json()

def main():
    seeds_path = os.getenv("NGBSE_SEEDS", "data/seeds.jsonl")
    with open(seeds_path, "r", encoding="utf-8") as f:
        for line in f:
            s = json.loads(line)
            if s.get("where") not in ("leakix", "*"):
                continue
            q = s["seed"]
            try:
                hits = search(q, limit=int(os.getenv("LEAKIX_LIMIT","50")))
            except Exception as e:
                print(f"LeakIX error: {e}", file=sys.stderr); hits=[]
            for h in hits:
                item_id = h.get("id") or h.get("host")
                url = h.get("link") or h.get("url") or None
                meta = {"title": h.get("title"), "port": h.get("port"), "protocol": h.get("protocol")}
                log_presence(OUT, "leakix", q, str(item_id), url, meta)

if __name__ == "__main__":
    main()
