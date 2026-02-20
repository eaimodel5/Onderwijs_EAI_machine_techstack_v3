
import json, logging, sys, time

class JsonLineFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": int(time.time() * 1000),
            "level": record.levelname,
            "msg": record.getMessage(),
            "name": record.name,
        }
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)

def get_logger(name: str, logfile: str = None) -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        h_console = logging.StreamHandler(sys.stdout)
        h_console.setFormatter(JsonLineFormatter())
        logger.addHandler(h_console)
        if logfile:
            h_file = logging.FileHandler(logfile, encoding="utf-8")
            h_file.setFormatter(JsonLineFormatter())
            logger.addHandler(h_file)
    return logger
