from typing import List, Dict, Any
from collections import Counter
from ..logger import LOGGER

def coverage_gap(findings: List[Dict[str,Any]]) -> Dict[str,Any]:
    cats = []
    for f in findings:
        t = f.get("source",{}).get("type","")
        if t == "pdf": cats.append("Archive/PDF")
        elif t == "ti_post": cats.append("TI/Blog")
        elif t == "news": cats.append("News")
        else: cats.append("Web")
    c = Counter(cats)
    total = sum(c.values()) or 1
    ratios = {k: v/total for k,v in c.items()}
    max_cat = max(ratios, key=ratios.get)
    imbalance = max(ratios.values()) - min(ratios.values()) if len(ratios)>1 else 0.0
    return {"ratios": ratios, "max_category": max_cat, "imbalance": imbalance}

def recency_gap(findings: List[Dict[str,Any]]) -> Dict[str,Any]:
    # cluster by observed day
    days = Counter([ (f.get("timestamps",{}).get("observed","") or "")[:10] for f in findings ])
    if not days: return {"spike": False, "detail": {}}
    peak_day, peak_count = max(days.items(), key=lambda kv: kv[1])
    spike = peak_count >= max(3, int(0.7*sum(days.values())))
    return {"spike": spike, "detail": dict(days)}

def confidence_gap(findings: List[Dict[str,Any]]) -> Dict[str,Any]:
    high_score_assets = []
    low_quality_assets = set()
    for f in findings:
        e = f.get("score",{}).get("e_ai_star",0.0)
        q = f.get("quality",{}).get("q",0.0)
        if e >= 0.7:
            high_score_assets.append(f.get("asset",""))
        if q < 0.5:
            low_quality_assets.add(f.get("asset",""))
    risky = sorted(set(a for a in high_score_assets if a in low_quality_assets))
    return {"risky_assets": risky, "n": len(risky)}

def synthesize_brief(findings: List[Dict[str,Any]], asset_scores: Dict[str,Dict[str,float]]) -> Dict[str,Any]:
    top_assets = sorted(asset_scores.items(), key=lambda kv: kv[1]["avg_e_ai_star"], reverse=True)[:5]
    bluf = "Belangrijkste bevindingen geconsolideerd. Zie risico’s en acties per asset."
    risks = [{"asset": a, "risk": round(v["avg_e_ai_star"],3)} for a,v in top_assets]
    actions = [
        "Valideer top-assets handmatig (sign-off vereist)",
        "Controleer coverage-imbalance en vul ontbrekende bronklassen aan",
        "Plan nieuwe run binnen 7 dagen voor trendbewaking"
    ]
    return {"BLUF": bluf, "TopRisks": risks, "Actions": actions}
