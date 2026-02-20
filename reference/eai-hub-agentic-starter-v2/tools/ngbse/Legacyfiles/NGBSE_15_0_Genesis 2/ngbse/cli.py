import argparse
from .config import load_config
from .pipeline import run_pipeline

def build_parser():
    ap = argparse.ArgumentParser(prog="ngbse", description="NGBSE 15.0 Genesis")
    ap.add_argument("--config", default="ngbse.config.yml", help="Path to config (default: ngbse.config.yml)")
    ap.add_argument("--seeds", default="seeds.jsonl", help="Path to seeds (default: seeds.jsonl)")
    ap.add_argument("--out", default="out", help="Output directory (default: out)")
    return ap

def main(argv=None):
    args = build_parser().parse_args(argv)
    cfg = load_config(args.config)
    summary = run_pipeline(cfg, args.seeds, args.out)
    print(summary)
