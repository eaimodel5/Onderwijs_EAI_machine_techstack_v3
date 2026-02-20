from .llm_client import OnlineLLMClient
SYSTEM = "You are a security QA LLM. Generate Dutch blindspots: short, actionable, no secrets."

def analyze_blindspots(findings: list, cfg: dict, log) -> list:
    if not findings:
        return []
    client = OnlineLLMClient(
        provider=(cfg.get("llm",{}) or {}).get("provider"),
        endpoint=(cfg.get("llm",{}) or {}).get("endpoint"),
        model=(cfg.get("llm",{}) or {}).get("model"),
        key=(cfg.get("llm",{}) or {}).get("key"),
        api_version=(cfg.get("llm",{}) or {}).get("api_version"),
        timeout=(cfg.get("llm",{}) or {}).get("timeout"),
    )
    try:
        prompt = "Genereer puntsgewijze blindspots (max 8) op basis van de volgende context:\n"
        for f in findings[:30]:
            prompt += f"- {f.get('source','')} :: {f.get('url','')}\n"
        txt = client.chat(SYSTEM, prompt)
        lines = [l.strip('- ').strip() for l in (txt or '').splitlines() if l.strip()]
        out = []
        for l in lines[:8]:
            if len(l) > 280:
                l = l[:277] + '...'
            out.append(l)
        return out
    except Exception as e:
        if log:
            log.error("reverse_llm_failed", {"error": str(e)})
        return []
