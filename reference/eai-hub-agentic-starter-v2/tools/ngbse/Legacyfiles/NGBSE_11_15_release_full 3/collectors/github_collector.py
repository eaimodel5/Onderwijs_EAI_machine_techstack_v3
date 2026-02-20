
from .base_collector import BaseCollector
from .util import coc_sha256

class GithubCollector(BaseCollector):
    def run(self, seed):
        import os, requests
        q = seed.get("seed")
        s = self.session
        tok = os.getenv("GITHUB_TOKEN")
        if tok: s.headers.update({"Authorization": f"Bearer {tok}"})
        try:
            r = s.get("https://api.github.com/search/code", params={"q": q, "per_page": 50}, timeout=20)
            r.raise_for_status()
        except Exception as e:
            self.log.error("github fout", {"error": str(e)}); return []
        out = []
        for item in r.json().get("items", []):
            repo = item.get("repository", {})
            u = item.get("html_url"); ts = repo.get("updated_at")
            out.append({"source":"github","seed":seed,"url":u,"ts":ts,"coc_sha256":coc_sha256(f"{u}|{ts}")})
        return out
