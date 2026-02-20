import os, requests, tldextract
from typing import List, Dict, Any
from .base import BaseCollector
from ..logger import LOGGER

class ShodanCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = seed.get("query","")
        st = (seed.get("type") or "").lower()
        if st not in ("infra", "shodan"):
            return []
        key = os.getenv("SHODAN_API_KEY","")
        if not key: 
            return []
        try:
            query = q or "ssl"
            params = {"key": key, "query": query}
            LOGGER.info("collector.shodan.request", params=params)
            r = requests.get("https://api.shodan.io/shodan/host/search", params=params, timeout=20)
            r.raise_for_status()
            data = r.json()
        except Exception:
            return []
        findings = []
        for m in data.get("matches",[])[:5]:
            host = m.get("ip_str","")
            domain = (m.get("ssl",{}).get("cert",{}).get("subject",{}).get("CN","") or "").lower()
            if domain:
                ext = tldextract.extract(domain)
                domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            try: self.allow_or_raise(domain=domain or "example.com")
            except Exception: continue
            findings.append({
                "seed_id": seed.get("id"),
                "asset": domain or host,
                "raw": {"ip": host, "port": m.get("port")},
                "source": {"type":"infra","url": f"shodan://{host}", "domain": domain or ""},
                "timestamps": {"observed": now_iso, "collected": now_iso},
                "quality": {"q": 0.7, "notes": "shodan search (summary)"} 
            })
        LOGGER.info("collector.shodan.done", n=len(findings))
        return findings
