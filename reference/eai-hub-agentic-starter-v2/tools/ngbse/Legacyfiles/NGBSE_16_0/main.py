import argparse, os
from ngbse.config import load_config
from ngbse.pipeline import run_pipeline

def parse_args():
    ap = argparse.ArgumentParser(description="NGBSE 16.0 Genesis")
    ap.add_argument("--config", required=True, help="Path to ngbse.config.yml")
    ap.add_argument("--seeds", required=True, help="Path to seeds.jsonl")
    ap.add_argument("--out", required=True, help="Output directory")
    return ap.parse_args()

def main():
    args = parse_args()
    cfg = load_config(args.config)
    summary = run_pipeline(cfg, args.seeds, args.out)
    print(summary)

if __name__ == "__main__":
    main()
