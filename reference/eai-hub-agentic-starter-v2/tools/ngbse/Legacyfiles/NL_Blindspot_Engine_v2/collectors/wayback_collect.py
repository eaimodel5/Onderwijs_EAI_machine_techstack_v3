import requests, time, json
from urllib.parse import urlencode

CDX = "https://web.archive.org/cdx/search/cdx"

def collect(seed, write_finding, append_log):
    # We expect a general-purpose seed; for reproducibility, we query generic Citrix/Forti docs
    params = {
        "url": "*citrix.com/*/release-notes/*",
        "output": "json",
        "limit": "50",
        "filter": "statuscode:200"
    }
    try:
        r = requests.get(CDX, params=params, timeout=20)
        if r.status_code!=200:
            append_log(f"wayback cdx error {r.status_code}")
            return
        j = r.json()
        now = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
        for row in j[1:]:  # first row is header
            url = f"https://web.archive.org/web/{row[1]}/{row[2]}"
            write_finding({
                "source":"wayback",
                "query": params["url"],
                "page": url,
                "ts": now,
                "presence_only": True
            })
        append_log(f"wayback ok: {len(j)-1} mirrors")
    except Exception as e:
        append_log(f"wayback exception: {e}")
