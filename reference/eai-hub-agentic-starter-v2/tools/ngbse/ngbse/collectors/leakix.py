import os, requests, tldextract
from typing import List, Dict, Any
from .base import BaseCollector
from ..logger import LOGGER

class LeakixCollector(BaseCollector):
    def collect(self, seed: Dict[str,Any], now_iso: str) -> List[Dict[str,Any]]:
        q = (seed.get("query") or "").strip()
        st = (seed.get("type") or "").lower()
        if st not in ("leak", "leakix"):
            return []
        key = os.getenv("LEAKIX_API_KEY","")
        headers = {"Authorization": f"Bearer {key}"} if key else {}
        findings: List[Dict[str,Any]] = []
        try:
            # Prefer search endpoint with query
            params = {"q": q or "leak", "page": 1}
            LOGGER.info("collector.leakix.request", params=params)
            r = requests.get("https://leakix.net/api/search", params=params, headers=headers, timeout=25)
            if r.ok and r.headers.get("content-type","" ).startswith("application/json"):
                data = r.json() or []
            else:
                data = []
        except Exception:
            data = []
        # Fallback to scan listing if search empty
        if not data:
            try:
                r = requests.get("https://leakix.net/api/scan?page=1", headers=headers, timeout=20)
                if r.ok and r.headers.get("content-type","" ).startswith("application/json"):
                    data = r.json() or []
            except Exception:
                data = []

        for item in (data[:10] if isinstance(data, list) else []):
            url = item.get("url") or item.get("link") or ""
            if not url:
                continue
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            try:
                self.allow_or_raise(domain=domain or "example.com")
            except Exception:
                continue
            findings.append({
                "seed_id": seed.get("id"),
                "asset": (domain or url).lower(),
                "raw": {"url": url},
                "source": {"type":"leak","url": url, "domain": domain or ""},
                "timestamps": {"observed": now_iso, "collected": now_iso},
                "quality": {"q": 0.6, "notes": "leakix search"}
            })
        LOGGER.info("collector.leakix.done", n=len(findings))
        return findings
