import os, requests, tldextract
from typing import List, Dict, Any
from .base import BaseCollector

class CensysCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = seed.get("query","")
        st = (seed.get("type") or "").lower()
        if st not in ("infra", "censys"):
            return []
        aid = os.getenv("CENSYS_API_ID","")
        sec = os.getenv("CENSYS_API_SECRET","")
        if not aid or not sec:
            return []
        try:
            r = requests.post("https://search.censys.io/api/v2/hosts/search",
                              auth=(aid, sec),
                              json={"q":"services.service_name:HTTPS", "per_page":5},
                              timeout=20)
            r.raise_for_status()
            data = r.json()
        except Exception:
            return []
        findings = []
        for h in data.get("result",{}).get("hits",[]):
            url = f"https://{h.get('ip','')}"
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            try: self.allow_or_raise(domain=domain or "example.com")
            except Exception: continue
            findings.append({
                "seed_id": seed.get("id"),
                "asset": domain or h.get("ip",""),
                "raw": {"ip": h.get("ip",""), "location": h.get("location",{})},
                "source": {"type": "infra", "url": url, "domain": domain or ""},
                "timestamps": {"observed": now_iso, "collected": now_iso},
                "quality": {"q": 0.65, "notes": "censys search (summary)"} 
            })
        return findings
