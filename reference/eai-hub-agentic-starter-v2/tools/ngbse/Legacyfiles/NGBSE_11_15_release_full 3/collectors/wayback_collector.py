
from .base_collector import BaseCollector
from .util import coc_sha256

class WaybackCollector(BaseCollector):
    def run(self, seed):
        import requests
        q = seed.get("seed")
        try:
            r = self.session.get("http://web.archive.org/cdx/search/cdx", params={"url": f"*{q}*", "output":"json", "limit":100, "filter":"statuscode:200"}, timeout=20)
            r.raise_for_status()
        except Exception as e:
            self.log.error("wayback fout", {"error": str(e)}); return []
        out = []
        rows = r.json()
        for row in rows[1:]:
            ts, orig = row[1], row[2]
            t_iso = f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:{ts[12:14]}Z"
            u = f"https://web.archive.org/web/{ts}/{orig}"
            out.append({"source":"wayback","seed":seed,"url":u,"ts":t_iso,"coc_sha256":coc_sha256(f"{u}|{ts}")})
        return out
