
from .base_collector import BaseCollector
from .util import coc_sha256

class CensysCollector(BaseCollector):
    def run(self, seed):
        import os, requests
        api_id = os.getenv("CENSYS_API_ID"); api_secret = os.getenv("CENSYS_API_SECRET")
        if not (api_id and api_secret): self.log.warning("CENSYS_API_ID/SECRET ontbreken"); return []
        q = seed.get("seed")
        try:
            r = self.session.post("https://search.censys.io/api/v2/hosts/search", auth=(api_id, api_secret), json={"q": q, "per_page": 50}, timeout=20)
            r.raise_for_status()
        except Exception as e:
            self.log.error("censys fout", {"error": str(e)}); return []
        out = []
        for m in r.json().get("result",{}).get("hits",[]):
            ip = m.get("ip"); ts = m.get("last_updated_at")
            out.append({"source":"censys","seed":seed,"where":ip,"url":f"https://search.censys.io/hosts/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")})
        return out
