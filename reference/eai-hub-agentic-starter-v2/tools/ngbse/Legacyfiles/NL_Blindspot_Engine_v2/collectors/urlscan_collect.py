import os, requests, time, json
from urllib.parse import quote
from dotenv import load_dotenv
load_dotenv()

API = "https://urlscan.io/api/v1/search/?q="
KEY = os.getenv("URLSCAN_API_KEY","")
UA  = os.getenv("USER_AGENT","NL-Blindspot-Engine/2.0")

def collect(seed, write_finding, append_log):
    q = seed.get("seed","")
    hdrs = {"User-Agent":UA, "Accept":"application/json"}
    if KEY:
        hdrs["API-Key"]=KEY
    try:
        r = requests.get(API + quote(q), headers=hdrs, timeout=20)
        if r.status_code!=200:
            append_log(f"urlscan error {r.status_code} for {q}")
            return
        data = r.json().get("results", [])
        now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        for item in data[:50]:  # limit to 50 to be polite
            out = {
                "source":"urlscan",
                "query": q,
                "page": item.get("page",{}).get("url"),
                "task": item.get("task",{}),
                "indexedAt": item.get("indexedAt"),
                "sha256": item.get("_id"),  # urlscan result id as stable handle
                "ts": now,
                "presence_only": True
            }
            write_finding(out)
        append_log(f"urlscan ok: {q} -> {len(data)} results (capped)")
    except Exception as e:
        append_log(f"urlscan exception for {q}: {e}")
