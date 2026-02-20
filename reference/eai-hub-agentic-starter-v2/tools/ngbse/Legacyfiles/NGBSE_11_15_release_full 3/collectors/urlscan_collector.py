
from .base_collector import BaseCollector
from .util import coc_sha256

class UrlscanCollector(BaseCollector):
    def run(self, seed):
        import os, requests
        q = seed.get("seed")
        s = self.session
        api_key = os.getenv("URLSCAN_API_KEY")
        if api_key: s.headers.update({"API-Key": api_key})
        try:
            r = s.get("https://urlscan.io/api/v1/search/", params={"q": q, "size": 50}, timeout=20)
            r.raise_for_status()
        except Exception as e:
            self.log.error("urlscan fout", {"error": str(e)}); return []
        out = []
        for m in r.json().get("results", []):
            page = m.get("page", {})
            u = page.get("url"); ts = m.get("task",{}).get("time")
            out.append({"source":"urlscan","seed":seed,"url":u,"ts":ts,"coc_sha256":coc_sha256(f"{u}|{ts}")})
        return out
