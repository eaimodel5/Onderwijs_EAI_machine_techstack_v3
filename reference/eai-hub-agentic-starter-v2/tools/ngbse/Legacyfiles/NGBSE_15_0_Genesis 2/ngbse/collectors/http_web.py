import re, requests, datetime, tldextract
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
    # try common meta tags
    for tag_name, attrs in META_DATE_FIELDS:
        for node in soup.find_all(tag_name, attrs=attrs):
            content = node.get("content") or node.get_text(strip=True)
            if content and re.search(r"\d{4}-\d{2}-\d{2}", content):
                return re.search(r"\d{4}-\d{2}-\d{2}(\w|T| )?\d{0,2}:\d{0,2}:\d{0,2}?", content).group(0) if re.search(r"\d{4}-\d{2}-\d{2}", content) else ""
    # fallback: first date-like string
    m = re.search(r"(20\d{2}-\d{2}-\d{2})", html)
    return m.group(1) if m else ""

class HttpWebCollector(BaseCollector):
    """
    Haalt content op als de seed.query een expliciete URL bevat.
    Respecteert allowlist op basis van het effectieve registratiedomein.
    """
    def collect(self, seed: Dict[str, Any], now_iso: str) -> List[Dict[str, Any]]:
        q = seed.get("query","")
        urls = re.findall(r"https?://[^\s\"'>]+", q)
        findings = []
        for url in urls:
            ext = tldextract.extract(url)
            domain = ".".join([p for p in [ext.domain, ext.suffix] if p])
            self.allow_or_raise(domain=domain)

            try:
                r = requests.get(url, timeout=15, headers={"User-Agent":"NGBSE/15.0 (+legit osint)"})
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
                    "source": {"type": seed.get("type","web"), "url": url, "domain": domain},
                    "timestamps": {"observed": published or now_iso, "collected": now_iso},
                    "quality": {"q": 0.6 if r.status_code==200 else 0.3, "notes": "HTTP fetch"}
                })
                LOGGER.info("collector.http", seed=seed.get("id"), url=url, status=r.status_code)
            except Exception as e:
                LOGGER.warn("collector.http_error", seed=seed.get("id"), url=url, error=str(e))
        return findings
