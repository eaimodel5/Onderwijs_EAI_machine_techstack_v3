import json, sys, time, threading

class JsonLogger:
    def __init__(self, stream=sys.stdout):
        self.stream = stream
        self._lock = threading.Lock()

    def log(self, level, event, **kwargs):
        payload = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "level": level.upper(),
            "event": event,
            **kwargs
        }
        with self._lock:
            self.stream.write(json.dumps(payload, ensure_ascii=False) + "\n")
            self.stream.flush()

    def info(self, event, **kwargs): self.log("info", event, **kwargs)
    def warn(self, event, **kwargs): self.log("warn", event, **kwargs)
    def error(self, event, **kwargs): self.log("error", event, **kwargs)

LOGGER = JsonLogger()
