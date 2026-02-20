from abc import ABC, abstractmethod
from typing import List, Dict, Any
from ..logger import LOGGER

class BaseCollector(ABC):
    def __init__(self, config, allow_domains: list, allow_orgs: list):
        self.config = config
        self.allow_domains = [d.lower() for d in allow_domains]
        self.allow_orgs = [o.lower() for o in allow_orgs]

    def is_allowed_domain(self, domain: str) -> bool:
        return (domain or "").lower() in self.allow_domains

    def is_allowed_org(self, org: str) -> bool:
        return (org or "").lower() in self.allow_orgs

    def allow_or_raise(self, domain: str = "", org: str = ""):
        if domain and not self.is_allowed_domain(domain):
            raise PermissionError(f"Domain not on allowlist: {domain}")
        if org and not self.is_allowed_org(org) and org:
            raise PermissionError(f"Organization not on allowlist: {org}")

    @abstractmethod
    def collect(self, seed: Dict[str, Any], now_iso: str) -> List[Dict[str, Any]]:
        raise NotImplementedError
