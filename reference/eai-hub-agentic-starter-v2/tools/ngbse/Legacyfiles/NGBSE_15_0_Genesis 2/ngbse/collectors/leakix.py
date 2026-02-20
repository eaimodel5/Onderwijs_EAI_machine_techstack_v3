import os, requests, tldextract
from typing import List, Dict, Any
from .base import BaseCollector

class LeakixCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = seed.get("query","")
        if "leakix" not in q.lower():
            return []
        key = os.getenv("LEAKIX_API_KEY","")
        headers = {"Authorization": f"Bearer {key}"} if key else {}
        try:
            r = requests.get("https://leakix.net/api/scan?page=1", headers=headers, timeout=20)
            r.raise_for_status()
            data = r.json() if r.headers.get("content-type","").startswith("application/json") else []
        except Exception:
            return []
        findings = []
        for item in data[:5]:
            url = item.get("url","")
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            try: self.allow_or_raise(domain=domain or "example.com")
            except Exception: continue
            findings.append({
                "seed_id": seed.get("id"),
                "asset": domain or url,
                "raw": {"url": url},
                "source": {"type":"leak","url": url, "domain": domain or ""},
                "timestamps": {"observed": now_iso, "collected": now_iso},
                "quality": {"q": 0.6, "notes": "leakix (summary)"} 
            })
        return findings
