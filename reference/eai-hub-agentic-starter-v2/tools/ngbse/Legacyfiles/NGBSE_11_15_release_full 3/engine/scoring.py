
import math

def e_ai_star(p: dict, w: dict) -> float:
    Vp = min(1.0, 0.5*p.get('V',0)+0.3*p.get('Q',0)+0.2*min(1.0,p.get('C',0)/3.0))
    return round(math.sqrt(
        w.get('w1',0.3)*(p.get('P',1.0)*p.get('W_V',0.7)) +
        w.get('w2',0.3)*(p.get('D_A',0.7)*p.get('D_B',0.7)) +
        w.get('w3',0.2)*(p.get('T',0.7)*p.get('A',0.7)) +
        w.get('w4',0.15)*Vp +
        w.get('w5',0.05)*p.get('M',0.2)
    ),4)

def run_scoring(findings: list, cfg: dict) -> list:
    weights = cfg.get('scoring',{}).get('eai_weights',{})
    defaults = cfg.get('scoring',{}).get('eai_defaults',{})
    for it in findings:
        enrich = it.get('enrichment',{})
        payload = {'P':1.0,'V':1.0 if it.get('validated') else 0.5, **enrich, **defaults}
        it['score'] = e_ai_star(payload, weights)
    findings.sort(key=lambda x: x.get('score',0), reverse=True)
    return findings
