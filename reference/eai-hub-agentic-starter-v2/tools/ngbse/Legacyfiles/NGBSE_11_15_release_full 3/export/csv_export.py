
import csv
def write_csv(findings, path):
    if not findings: return
    keys = sorted({k for f in findings for k in f.keys()})
    with open(path, "w", newline="", encoding="utf-8") as h:
        w = csv.DictWriter(h, fieldnames=keys, extrasaction="ignore")
        w.writeheader(); w.writerows(findings)
