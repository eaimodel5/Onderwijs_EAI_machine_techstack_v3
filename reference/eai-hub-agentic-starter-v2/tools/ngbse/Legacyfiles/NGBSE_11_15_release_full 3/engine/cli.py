import sys
import argparse
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

def main():
    parser = argparse.ArgumentParser(prog="ngbse", description="Run NGBSE 11.15 (online-only).")
    parser.add_argument("--config", default="config/ngbse.config.yml", help="Path to config YAML")
    parser.add_argument("--seeds", default="data/seeds.jsonl", help="Path to seeds JSONL")
    args, extra = parser.parse_known_args()
    # Hand off to orchestrator; it will parse argv (includes our args)
    from engine import orchestrator
    # Ensure the arguments are visible to orchestrator
    sys.argv = [sys.argv[0], "--config", args.config, "--seeds", args.seeds] + list(extra)
    orchestrator.main()

if __name__ == "__main__":
    main()
