import requests, tldextract, datetime
from typing import List, Dict, Any
from .base import BaseCollector

CDX = "http://web.archive.org/cdx/search/cdx"
class WaybackCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = seed.get("query","")
        st = (seed.get("type") or "").lower()
        if st not in ("archive", "wayback", "pdf"):
            return []
        urls = [u for u in q.split() if u.startswith("http")]
        findings = []
        for url in urls:
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            try: self.allow_or_raise(domain=domain)
            except Exception: continue
            try:
                r = requests.get(CDX, params={"url": url, "output":"json", "limit":"3", "filter":"statuscode:200"}, timeout=20)
                rows = r.json()[1:] if r.ok else []
            except Exception:
                rows = []
            for row in rows:
                ts = row[1]
                ts_iso = f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}T00:00:00Z"
                findings.append({
                    "seed_id": seed.get("id"),
                    "asset": domain,
                    "raw": {"archived": row[2] if len(row)>2 else url},
                    "source": {"type":"archive", "url": url, "domain": domain},
                    "timestamps": {"observed": ts_iso, "collected": now_iso},
                    "quality": {"q": 0.55, "notes": "wayback snapshots"} 
                })
        return findings
