import os, requests, datetime, tldextract
from typing import List, Dict, Any
from .base import BaseCollector

class GithubCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = seed.get("query","")
        if "github" not in q.lower():
            return []
        token = os.getenv("GITHUB_TOKEN","")
        headers = {"Accept":"application/vnd.github+json"}
        if token: headers["Authorization"] = f"Bearer {token}"
        try:
            r = requests.get("https://api.github.com/search/repositories?q=osint", headers=headers, timeout=20)
            r.raise_for_status()
            data = r.json()
        except Exception:
            return []
        findings = []
        for item in data.get("items",[])[:5]:
            url = item.get("html_url","")
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            try: self.allow_or_raise(domain=domain)
            except Exception: continue
            findings.append({
                "seed_id": seed.get("id"),
                "asset": domain,
                "raw": {"title": item.get("full_name",""), "url": url},
                "source": {"type":"code","url": url, "domain": domain},
                "timestamps": {"observed": now_iso, "collected": now_iso},
                "quality": {"q": 0.6, "notes": "github search"}
            })
        return findings
