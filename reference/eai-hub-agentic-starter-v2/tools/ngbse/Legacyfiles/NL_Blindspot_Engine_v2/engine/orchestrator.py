import os, json, time, hashlib
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / "data"
OUT  = DATA / "findings.jsonl"
LOG  = DATA / "run.log"

def sha256_text(txt:str)->str:
    import hashlib
    h=hashlib.sha256()
    h.update(txt.encode("utf-8",errors="ignore"))
    return h.hexdigest()

def append_log(line:str):
    LOG.parent.mkdir(parents=True, exist_ok=True)
    with LOG.open("a", encoding="utf-8") as f:
        f.write(f"{time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())} | {line}\n")

def write_finding(obj:dict):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("a", encoding="utf-8") as f:
        f.write(json.dumps(obj, ensure_ascii=False) + "\n")

def load_seeds():
    seeds = []
    with (DATA/"seeds.jsonl").open("r", encoding="utf-8") as f:
        for line in f:
            try:
                seeds.append(json.loads(line))
            except:
                pass
    seeds.sort(key=lambda x: x.get("priority",0), reverse=True)
    return seeds

def main():
    seeds = load_seeds()
    append_log(f"Loaded {len(seeds)} seeds")
    # Dispatch seeds to collectors by 'where'
    from collectors.urlscan_collect import collect as urlscan_collect
    from collectors.wayback_collect import collect as wayback_collect
    from collectors.github_collect import collect as github_collect
    # Optional collectors only if keys exist
    try:
        from collectors.censys_collect import collect as censys_collect
    except Exception:
        censys_collect=None
    try:
        from collectors.leakix_collect import collect as leakix_collect
    except Exception:
        leakix_collect=None

    for s in seeds:
        where = s.get("where")
        if where=="urlscan":
            urlscan_collect(s, write_finding, append_log)
        elif where=="wayback":
            wayback_collect(s, write_finding, append_log)
        elif where=="github":
            github_collect(s, write_finding, append_log)
        elif where=="censys" and censys_collect:
            censys_collect(s, write_finding, append_log)
        elif where=="leakix" and leakix_collect:
            leakix_collect(s, write_finding, append_log)
        elif where=="shodan":
            # We only log that shodan should be queried; actual querying requires API access & rate limits.
            append_log(f"SHODAN seed queued (manual/API run): {s['seed']}")
        elif where=="web":
            append_log(f"WEB seed queued (manual review): {s['seed']}")
        else:
            append_log(f"Unknown or unavailable collector: {where}")

    append_log("Dispatch complete")

if __name__ == "__main__":
    main()
