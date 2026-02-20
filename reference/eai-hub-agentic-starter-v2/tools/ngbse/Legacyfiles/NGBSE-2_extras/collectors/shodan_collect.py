
# presence-only Shodan collector
import os, json, requests, sys
from engine.util import log_presence

KEY = os.getenv("SHODAN_API_KEY", "").strip()
OUT = os.getenv("NGBSE_OUT", "findings.jsonl")

def search(query, limit=100):
    base = "https://api.shodan.io/shodan/host/search"
    params = {"key": KEY, "query": query, "minify": "true", "page": 1}
    r = requests.get(base, params=params, timeout=30)
    if r.status_code != 200:
        return []
    data = r.json().get("matches", [])
    return data[:limit]

def main():
    if not KEY:
        print("SHODAN_API_KEY not set; skipping.", file=sys.stderr)
        return
    seeds_path = os.getenv("NGBSE_SEEDS", "data/seeds.jsonl")
    with open(seeds_path, "r", encoding="utf-8") as f:
        for line in f:
            s = json.loads(line)
            if s.get("where") not in ("shodan", "*"):
                continue
            q = s["seed"]
            try:
                hits = search(q, limit=int(os.getenv("SHODAN_LIMIT","100")))
            except Exception as e:
                print(f"Shodan error: {e}", file=sys.stderr); hits=[]
            for h in hits:
                item_id = h.get("ip_str") or h.get("ip")
                url = None
                meta = {"port": h.get("port"), "org": h.get("org"), "location": h.get("location")}
                log_presence(OUT, "shodan", q, str(item_id), url, meta)

if __name__ == "__main__":
    main()
