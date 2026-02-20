
import os, requests
class BaseCollector:
    def __init__(self, cfg, log):
        self.cfg = cfg; self.log = log
        self.session = requests.Session()
        old_request = self.session.request
        def request_with_timeout(method, url, **kwargs):
            if 'timeout' not in kwargs:
                kwargs['timeout'] = 15
            return old_request(method, url, **kwargs)
        self.session.request = request_with_timeout
        self.session.headers.update({"User-Agent":"NGBSE/11.1"})
        self.api_key = None
    def collect(self, seed: dict, cfg: dict, log):
        return list(self.run(seed))
    def run(self, seed: dict):
        raise NotImplementedError
