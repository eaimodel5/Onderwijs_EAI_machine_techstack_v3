from .base_collector import BaseCollector
from engine.logger import get_logger

class LeakixCollector(BaseCollector):
    def __init__(self, cfg, log):
        super().__init__(cfg, log)
        self.source_name = "leakix"
        self.api_key_env_var = "LEAKIX_API_KEY"
        # Optional API key; if present, add header
        self.api_key = None
        try:
            import os
            self.api_key = os.getenv(self.api_key_env_var)
            if self.api_key:
                self.session.headers.update({"Api-Key": self.api_key})
        except Exception:
            pass

    def run(self, seed: dict):
        """Yield LeakIX search results as findings.
        Uses public search endpoint; if API key is provided via env, request is authenticated.
        """
        q = seed.get("seed") or seed.get("q") or ""
        if not q:
            return
        try:
            r = self.session.get(
                "https://leakix.net/search",
                params={"q": q, "size": 50},
                timeout=20
            )
            r.raise_for_status()
            # The endpoint may return HTML. We emit a generic finding referencing the search URL.
            url = r.url
            yield {
                "source": self.source_name,
                "url": str(url),
                "where": f"LeakIX search results for '{q}'",
            }
        except Exception as e:
            if self.log:
                self.log.error("leakix_error", {"error": str(e), "seed": q})
            return
