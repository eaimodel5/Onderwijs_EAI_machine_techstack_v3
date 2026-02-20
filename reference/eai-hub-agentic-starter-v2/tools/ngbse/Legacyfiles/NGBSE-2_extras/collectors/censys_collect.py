
# presence-only Censys Search v2 collector
import os, json, requests, sys, time
from urllib.parse import quote_plus
from engine.util import log_presence

API = os.getenv("CENSYS_API_KEY", "").strip()
OUT = os.getenv("NGBSE_OUT", "findings.jsonl")

def search(query, limit=25):
    url = "https://search.censys.io/api/v2/search"
    headers = {"Accept": "application/json", "Authorization": f"Bearer {API}"} if API else {"Accept": "application/json"}
    # default index: hosts; you can switch via env
    index = os.getenv("CENSYS_INDEX", "hosts")
    payload = {"q": query, "per_page": min(limit, 50)}
    r = requests.post(f"{url}/{index}", json=payload, headers=headers, timeout=30)
    if r.status_code != 200:
        return []
    data = r.json().get("result", {}).get("hits", [])
    return data

def main():
    if not API:
        print("CENSYS_API_KEY not set; skipping.", file=sys.stderr)
        return
    seeds_path = os.getenv("NGBSE_SEEDS", "data/seeds.jsonl")
    with open(seeds_path, "r", encoding="utf-8") as f:
        for line in f:
            s = json.loads(line)
            if s.get("where") not in ("censys", "*"): 
                continue
            q = s["seed"]
            hits = search(q, limit=int(os.getenv("CENSYS_LIMIT", "25")))
            for h in hits:
                item_id = h.get("ip") or h.get("service_id") or h.get("id")
                meta = {"asn": h.get("autonomous_system",{}).get("asn"), "location": h.get("location",{}), "services": h.get("services")}
                log_presence(OUT, "censys", q, str(item_id), None, meta)

if __name__ == "__main__":
    main()
