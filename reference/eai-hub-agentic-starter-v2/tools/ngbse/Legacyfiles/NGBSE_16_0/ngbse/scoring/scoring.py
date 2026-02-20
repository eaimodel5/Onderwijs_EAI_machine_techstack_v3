import math, re, datetime
from typing import List, Dict, Any
from .dynamic_parameters import DYNAMIC

def _keyword_score(text: str) -> float:
    score = 0.0
    text = (text or "").lower()
    for kw, w in DYNAMIC["keyword_weights"].items():
        if kw in text:
            score += w
    return min(1.0, score)

def _recency_score(observed_iso: str, now_iso: str) -> float:
    try:
        obs = datetime.datetime.fromisoformat(observed_iso.replace("Z",""))
        now = datetime.datetime.fromisoformat(now_iso.replace("Z",""))
        days = max(0.0, (now - obs).days)
    except Exception:
        days = 9999
    hl = float(DYNAMIC["recency_half_life_days"])
    # Exponential decay: score 1.0 at 0 days, ~0.5 at half-life
    return 0.5 ** (days/hl) if hl>0 else 0.0

def score_findings(findings: List[Dict[str,Any]], now_iso: str) -> List[Dict[str,Any]]:
    for f in findings:
        raw = f.get("raw",{})
        source = f.get("source",{})
        domain = (source.get("domain") or "").lower()
        title = (raw.get("title") or "")
        text_snippet = f"{title} {source.get('url','')}"
        M = 1.0 if source.get("type") in ("ti_post","pdf") else 0.6
        C = _keyword_score(text_snippet)
        Q = float(f.get("quality",{}).get("q",0.5)) * DYNAMIC["domain_quality"].get(domain,0.5)
        V = _recency_score(f.get("timestamps",{}).get("observed",""), now_iso)
        weights = DYNAMIC["weights"]
        e_ai_star = M*weights["M"] + C*weights["C"] + Q*weights["Q"] + V*weights["V"]
        f["score"] = {"M":M,"C":C,"Q":Q,"V":V,"e_ai_star":e_ai_star}
    return findings

def aggregate_asset_scores(findings: List[Dict[str,Any]]) -> Dict[str,Dict[str,float]]:
    by_asset = {}
    for f in findings:
        asset = f.get("asset","")
        s = f.get("score",{}).get("e_ai_star",0.0)
        if asset not in by_asset:
            by_asset[asset] = {"sum":0.0,"n":0}
        by_asset[asset]["sum"] += s
        by_asset[asset]["n"] += 1
    for a in list(by_asset.keys()):
        agg = by_asset[a]
        by_asset[a] = {"avg_e_ai_star": (agg["sum"]/max(1,agg["n"]))}
    return by_asset
