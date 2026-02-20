import argparse, os
from ngbse.config import load_config
from ngbse.pipeline import run_pipeline

def parse_args():
    ap = argparse.ArgumentParser(description="NGBSE 17.1 Genesis")
    ap.add_argument("--config", required=True, help="Path to ngbse.config.yml")
    ap.add_argument("--seeds", required=True, help="Path to seeds.jsonl")
    ap.add_argument("--out", required=True, help="Output directory")
    return ap.parse_args()

def main():
    args = parse_args()
    cfg = load_config(args.config)
    # enable file logging
    try:
        from ngbse.logger import LOGGER
        import os
        os.makedirs(args.out, exist_ok=True)
        LOGGER.set_file(os.path.join(args.out, "run.log.jsonl"))
    except Exception:
        pass
    summary = run_pipeline(cfg, args.seeds, args.out)
    print(summary)

if __name__ == "__main__":
    main()
