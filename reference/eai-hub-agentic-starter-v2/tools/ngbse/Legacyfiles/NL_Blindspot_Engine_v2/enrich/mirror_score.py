import json, time
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
FINDINGS = BASE/"data/findings.jsonl"
OUT = BASE/"data/triaged.jsonl"

def main():
    seen_live = set()
    mirrors = []
    triaged = []

    # Pass 1: aggregate
    if not FINDINGS.exists():
        print("No findings yet.")
        return
    with FINDINGS.open("r", encoding="utf-8") as f:
        for line in f:
            try:
                j = json.loads(line)
            except:
                continue
            src = j.get("source")
            page = j.get("page","")
            if src in ("urlscan","github","censys","leakix","shodan"):
                seen_live.add(j.get("query","")[:64])
            if src=="wayback":
                mirrors.append(j)

    # Pass 2: compute Mirror factor M per query (simplified heuristic)
    # If we have mirrors but no recent live presence for same "topic" -> M=1.0 else lower
    ts = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
    for m in mirrors:
        q = m.get("query","")
        M = 1.0 if q[:64] not in seen_live else 0.5
        m["mirror_factor"] = M
        m["ts_triage"] = ts
        triaged.append(m)

    # Write triaged set
    with OUT.open("w", encoding="utf-8") as g:
        for t in triaged:
            g.write(json.dumps(t, ensure_ascii=False)+"\n")
    print(f"Triaged {len(triaged)} mirror entries with M factor")

if __name__ == "__main__":
    main()
