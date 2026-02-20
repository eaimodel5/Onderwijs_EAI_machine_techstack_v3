import json, math
from .llm_client import OnlineLLMClient

SYSTEM_PROMPT = "You are a security analyst LLM. Produce concise risk synthesis in Dutch."

def _estimate_probability(avg_score: float, evidence_count: int, prior=0.10) -> float:
    # simple odds lifting based on average score
    lr = 1 + 9 * max(0.0, (avg_score-0.5)/0.5)
    odds = prior/(1-prior) * lr * max(1.0, min(5.0, evidence_count/3.0))
    return odds/(1+odds)

def generate_synthesis(findings: list, cfg: dict, log) -> dict:
    if not findings: return {}
    # Group by coarse themes
    themes = {
        "Public_Code_Exposure": ["github","oidc","token","secret"],
        "Exposed_Databases": ["clickhouse","mongodb","elasticsearch","rds","postgres","open database"],
        "Malicious_Infra_Proxies": ["residential proxy","c2","command-and-control"],
        "Public_Artifacts_Scans": ["urlscan","scan result","scan detail"],
    }
    groups = {k: [] for k in themes}
    for f in findings:
        text = (f.get("url","") + " " + f.get("where","")).lower()
        for theme, kws in themes.items():
            if any(k in text for k in kws):
                groups[theme].append(f); break

    client = OnlineLLMClient(
        provider=(cfg.get("llm",{}) or {}).get("provider"),
        endpoint=(cfg.get("llm",{}) or {}).get("endpoint"),
        model=(cfg.get("llm",{}) or {}).get("model"),
        key=(cfg.get("llm",{}) or {}).get("key"),
        api_version=(cfg.get("llm",{}) or {}).get("api_version"),
        timeout=(cfg.get("llm",{}) or {}).get("timeout"),
    )

    out = {}
    for theme, items in groups.items():
        if not items: continue
        avg = sum(i.get("score",0) for i in items)/len(items)
        prob = _estimate_probability(avg, len(items))
        user_prompt = json.dumps({
            "theme": theme,
            "avg_score": avg,
            "evidence_count": len(items),
            "examples": [{"url": x.get("url"), "where": x.get("where")} for x in items[:5]],
            "instruction": "Maak een beknopte, feitelijke NL-samenvatting (3 zinnen) en noem geen bedrijfsgeheimen."
        }, ensure_ascii=False)
        summary = client.chat(SYSTEM_PROMPT, user_prompt)
        out[theme] = {
            "future_scenario": theme.replace("_"," "),
            "probability_90_days": f"{prob*100:.1f}%",
            "semantic_summary": summary.strip() if isinstance(summary, str) else "",
            "avg_eai_score": round(avg,3),
            "evidence_count": len(items),
        }
    return out
