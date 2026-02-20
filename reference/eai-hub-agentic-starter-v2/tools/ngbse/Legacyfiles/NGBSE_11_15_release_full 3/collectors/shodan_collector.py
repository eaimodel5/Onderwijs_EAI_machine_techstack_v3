
from .base_collector import BaseCollector
from .util import coc_sha256

class ShodanCollector(BaseCollector):
    def run(self, seed):
        import os, requests
        q = seed.get("seed"); key = os.getenv("SHODAN_API_KEY")
        if not key: self.log.warning("SHODAN_API_KEY ontbreekt"); return []
        try:
            r = self.session.get("https://api.shodan.io/shodan/host/search", params={"key": key, "query": q}, timeout=20)
            r.raise_for_status()
        except Exception as e:
            self.log.error("shodan fout", {"error": str(e)}); return []
        out = []
        for m in r.json().get("matches", []):
            ip = m.get("ip_str"); ts = m.get("timestamp")
            out.append({"source":"shodan","seed":seed,"where":ip,"url":f"https://www.shodan.io/host/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")})
        return out
