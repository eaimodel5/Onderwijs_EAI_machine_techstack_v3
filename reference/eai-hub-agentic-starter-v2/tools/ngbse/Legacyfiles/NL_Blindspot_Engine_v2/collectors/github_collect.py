import os, time, requests

TOKEN = os.getenv("GITHUB_TOKEN","")
UA  = os.getenv("USER_AGENT","NL-Blindspot-Engine/2.0")
API = "https://api.github.com/search/code"

def gh_search(q, per_page=30):
    hdrs = {"Accept":"application/vnd.github.text-match+json", "User-Agent":UA}
    if TOKEN:
        hdrs["Authorization"] = f"Bearer {TOKEN}"
    r = requests.get(API, headers=hdrs, params={"q": q, "per_page": per_page}, timeout=20)
    if r.status_code!=200:
        return {"items":[]}
    return r.json()

def collect(seed, write_finding, append_log):
    q = seed.get("seed","")
    try:
        data = gh_search(q, per_page=30)
        now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        for item in data.get("items", []):
            repo = item.get("repository",{}).get("full_name")
            path = item.get("path")
            url  = item.get("html_url")
            write_finding({
                "source":"github",
                "query": q,
                "repo": repo,
                "path": path,
                "page": url,
                "ts": now,
                "presence_only": True
            })
        append_log(f"github ok: {q} -> {len(data.get('items',[]))} items")
    except Exception as e:
        append_log(f"github exception for {q}: {e}")
