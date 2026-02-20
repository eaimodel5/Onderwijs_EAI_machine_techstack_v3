import json, time
from .utils import sha256_file

def write_manifest(out_dir: str, version: str, seeds_path: str, config_path: str, findings_path: str):
    manifest = {
        "ngbse_version": version,
        "start_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "end_time": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "hashes": {
            "seeds.jsonl": sha256_file(seeds_path),
            "ngbse.config.yml": sha256_file(config_path),
            "findings.jsonl": sha256_file(findings_path) if findings_path else ""
        }
    }
    with open(f"{out_dir}/MANIFEST.json", "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
