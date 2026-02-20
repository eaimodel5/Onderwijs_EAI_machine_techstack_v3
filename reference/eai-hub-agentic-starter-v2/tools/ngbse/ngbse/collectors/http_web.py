import re, requests, datetime, urllib.parse
from bs4 import BeautifulSoup
from typing import List, Dict, Any
from .base import BaseCollector
from ..logger import LOGGER

META_DATE_FIELDS = [
    ("meta", {"property": "article:published_time"}),
    ("meta", {"name": "date"}),
    ("meta", {"itemprop": "datePublished"}),
    ("time", {}),
]

def parse_published(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag_name, attrs in META_DATE_FIELDS:
        for node in soup.find_all(tag_name, attrs=attrs):
            content = node.get("content") or node.get_text(strip=True)
            if content and re.search(r"\d{4}-\d{2}-\d{2}", content):
                m = re.search(r"\d{4}-\d{2}-\d{2}(?:\w|T| )?\d{0,2}:?\d{0,2}:?\d{0,2}?", content)
                return m.group(0) if m else ""
    m = re.search(r"(20\d{2}-\d{2}-\d{2})", html)
    return m.group(1) if m else ""

class HttpWebCollector(BaseCollector):
    def collect(self, seed: Dict[str, Any], now_iso: str) -> List[Dict[str, Any]]:
        import os
        q = seed.get("query","")
        st = (seed.get("type") or "web").lower()
        findings: List[Dict[str,Any]] = []

        # Offline synthesis path is disabled; always run online fetch when URLs are present in the query
        if False:
            urls = re.findall(r"https?://[^\s\"'>]+", q)
            sites = [m.group(1) for m in re.finditer(r"\bsite:([A-Za-z0-9\.\-\_]+)", q)]
            synthesized = [f"https://{s.split('/')[0]}" for s in sites if s]
            if not urls and not synthesized:
                synth_map = {
                    "infra": "https://shodan.io",
                    "archive": "https://web.archive.org",
                    "code": "https://github.com",
                    "leak": "https://leakix.net",
                    "ti_post": "https://urlscan.io",
                    "news": "https://industrialcyber.co",
                    "pdf": "https://example.com/report.pdf",
                    "web": "https://example.com"
                }
                synthesized = [synth_map.get(st, "https://example.com")]
            urls = urls + synthesized
            for url in urls:
                host = urllib.parse.urlparse(url).netloc.split('@')[-1].split(':')[0]
                parts = host.split('.')
                domain = '.'.join(parts[-2:]) if len(parts)>=2 else host
                self.allow_or_raise(domain=domain)
                findings.append({
                    "seed_id": seed.get("id"),
                    "asset": domain.lower(),
                    "raw": {"url": url, "status": 0, "title": ""},
                    "source": {"type": st, "url": url, "domain": domain},
                    "timestamps": {"observed": now_iso, "collected": now_iso},
                    "quality": {"q": 0.4, "notes": "offline synthesized"}
                })
            return findings

        # Online path
        urls = re.findall(r"https?://[^\s\"'>]+", q)
        for url in urls:
            host = urllib.parse.urlparse(url).netloc.split('@')[-1].split(':')[0]
            parts = host.split('.')
            domain = '.'.join(parts[-2:]) if len(parts)>=2 else host
            self.allow_or_raise(domain=domain)
            try:
                r = requests.get(url, timeout=15, headers={"User-Agent":"NGBSE/17.1 (+legit osint)"})
                text = r.text[:500000]
                published = parse_published(text)
                title = ""
                try:
                    soup = BeautifulSoup(text, "html.parser")
                    if soup.title and soup.title.string:
                        title = soup.title.string.strip()
                except Exception:
                    pass
                findings.append({
                    "seed_id": seed.get("id"),
                    "asset": domain.lower(),
                    "raw": {"url": url, "status": r.status_code, "title": title},
                    "source": {"type": st, "url": url, "domain": domain},
                    "timestamps": {"observed": published or now_iso, "collected": now_iso},
                    "quality": {"q": 0.6 if r.status_code==200 else 0.3, "notes": "HTTP fetch"}
                })
                LOGGER.info("collector.http", seed=seed.get("id"), url=url, status=r.status_code)
            except Exception as e:
                LOGGER.warn("collector.http_error", seed=seed.get("id"), url=url, error=str(e))
        return findings
