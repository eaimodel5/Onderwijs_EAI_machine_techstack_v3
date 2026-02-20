
import importlib

def load_collectors(cfg, log):
    enabled = cfg.get("collectors", {}).get("enabled", [])
    modules = {}
    for name in enabled:
        try:
            mod = importlib.import_module(f"collectors.{name}_collector")
            cls = getattr(mod, f"{name.capitalize()}Collector", None)
            if cls is None:  # fallback to generic class name mapping
                for attr in dir(mod):
                    obj = getattr(mod, attr)
                    if isinstance(obj, type) and obj.__name__.lower().startswith(name):
                        cls = obj; break
            if cls:
                modules[name] = cls(cfg, log)
        except Exception as e:
            log.error(f"Kon collector module niet laden: {name}", {"error": str(e)})
    return modules
