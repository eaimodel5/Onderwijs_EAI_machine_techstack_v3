#!/usr/bin/env python3
import sys, json, uuid, os, re, argparse, datetime

def infer_type(q: str) -> str:
    ql = q.lower()
    if "filetype:pdf" in ql or ql.endswith(".pdf"):
        return "pdf"
    if "site:" in ql or ql.startswith("http"):
        return "news"
    return "web"

def main():
    ap = argparse.ArgumentParser(description="Migrate arbitrary seed inputs to NGBSE 16.0 seeds.jsonl format")
    ap.add_argument("input", help="Input .txt/.json/.jsonl (list of queries or objects)")
    ap.add_argument("output", help="Output seeds.jsonl")
    ap.add_argument("--priority", type=float, default=0.7, help="Default priority if not set (0.1..1.0)")
    ap.add_argument("--time-window-days", type=int, default=60, help="Default time window days")
    args = ap.parse_args()

    rows = []
    with open(args.input, "r", encoding="utf-8") as f:
        data = f.read().strip()

    def push(query, pr=None, tw=None):
        rid = "S-" + uuid.uuid4().hex[:8].upper()
        rows.append({
            "id": rid,
            "query": query.strip(),
            "type": infer_type(query),
            "priority": float(pr if pr is not None else args.priority),
            "time_window_days": int(tw if tw is not None else args.time_window_days)
        })

    # Try to parse JSON first
    try:
        obj = json.loads(data)
        if isinstance(obj, list):
            for item in obj:
                if isinstance(item, str):
                    push(item)
                elif isinstance(item, dict):
                    push(item.get("query",""), item.get("priority"), item.get("time_window_days"))
        elif isinstance(obj, dict):
            # single object with "queries" list or one query
            if "queries" in obj and isinstance(obj["queries"], list):
                for q in obj["queries"]:
                    if isinstance(q, str):
                        push(q)
            elif "query" in obj:
                push(obj["query"], obj.get("priority"), obj.get("time_window_days"))
        else:
            raise ValueError
    except Exception:
        # treat as newline-delimited queries
        for line in data.splitlines():
            line=line.strip()
            if not line: continue
            push(line)

    with open(args.output, "w", encoding="utf-8") as out:
        for r in rows:
            out.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"Wrote {len(rows)} seeds -> {args.output}")

if __name__ == "__main__":
    main()
