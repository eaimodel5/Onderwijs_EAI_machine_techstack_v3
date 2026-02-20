import os, requests, tldextract, datetime
from typing import List, Dict, Any
from .base import BaseCollector

API = "https://urlscan.io/api/v1/search/"
class UrlscanCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = seed.get("query","")
        if "urlscan" not in q.lower():
            return []
        key = os.getenv("URLSCAN_API_KEY", "")
        try:
            params = {"q":"domain:*"}
            headers = {"API-Key": key} if key else {}
            r = requests.get(API, params=params, headers=headers, timeout=20)
            r.raise_for_status()
            data = r.json()
        except Exception:
            return []
        findings = []
        for item in data.get("results", [])[:10]:
            page = item.get("page",{})
            url = page.get("url","")
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            if not domain: 
                continue
            try:
                self.allow_or_raise(domain=domain)
            except Exception:
                continue
            findings.append({
                "seed_id": seed.get("id"),
                "asset": domain,
                "raw": {"title": page.get("title",""), "url": url},
                "source": {"type": "ti_post", "url": url, "domain": domain},
                "timestamps": {"observed": now_iso, "collected": now_iso},
                "quality": {"q": 0.7, "notes": "urlscan search"}
            })
        return findings
