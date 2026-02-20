
import argparse, csv, datetime
from ngbse_scoring import e_ai_score, detect_blindspots
from probability_engine import scenario_probability

def run(evidence_file, out_file):
    findings = []
    with open(evidence_file) as f:
        reader = csv.DictReader(f)
        for row in reader:
            P, W_V, D_A, D_B, T, A, V = [float(row[x]) for x in ["P","W_V","D_A","D_B","T","A","V"]]
            M = float(row.get("M",0.0))
            score = e_ai_score(P,W_V,D_A,D_B,T,A,V,M)
            issues = detect_blindspots(P,W_V,D_A,D_B,T,A,V)
            prob = scenario_probability(score, days_old=0)
            findings.append({"id": row["id"], "score": score, "issues": issues, "probability": prob})
    with open(out_file,"w") as f:
        for fnd in findings:
            f.write(f"Scenario {fnd['id']} | E_AI*: {fnd['score']} | Prob: {fnd['probability']}
")
            if fnd['issues']:
                f.write("Blindspots: " + "; ".join(fnd['issues']) + "\n")
            f.write("\n")

if __name__=="__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--out", default="report.md")
    args = parser.parse_args()
    run(args.evidence, args.out)
