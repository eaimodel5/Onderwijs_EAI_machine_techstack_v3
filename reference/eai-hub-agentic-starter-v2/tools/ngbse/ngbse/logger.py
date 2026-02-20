import json, sys, time, threading

class JsonLogger:
    def __init__(self, stream=sys.stdout):
        self.stream = stream
        self._file = None
        self._lock = threading.Lock()

    def set_file(self, path: str):
        with self._lock:
            try:
                if self._file:
                    try:
                        self._file.flush()
                        self._file.close()
                    except Exception:
                        pass
                self._file = open(path, "a", encoding="utf-8")
            except Exception:
                self._file = None

    def log(self, level, event, **kwargs):
        payload = {
            "ts": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "level": level.upper(),
            "event": event,
            **kwargs
        }
        line = json.dumps(payload, ensure_ascii=False) + "\n"
        with self._lock:
            try:
                self.stream.write(line)
                self.stream.flush()
            except Exception:
                pass
            if self._file:
                try:
                    self._file.write(line)
                    self._file.flush()
                except Exception:
                    pass

    def info(self, event, **kwargs): self.log("info", event, **kwargs)
    def warn(self, event, **kwargs): self.log("warn", event, **kwargs)
    def error(self, event, **kwargs): self.log("error", event, **kwargs)

LOGGER = JsonLogger()
