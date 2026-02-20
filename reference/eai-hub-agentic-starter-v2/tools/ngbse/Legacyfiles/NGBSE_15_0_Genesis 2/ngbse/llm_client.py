import os, json, requests
from typing import Optional, Dict, Any

class LLMClient:
    """
    Eenvoudige HTTP-clients voor drie providers.
    Als geen geldige API-keys aanwezig zijn, retourneert call() None.
    """
    def __init__(self, provider_priority):
        self.providers = provider_priority

    def call(self, system_prompt: str, user_prompt: str, max_tokens=800, temperature=0.2) -> Optional[str]:
        for p in self.providers:
            fn = getattr(self, f"_call_{p}", None)
            if fn:
                out = fn(system_prompt, user_prompt, max_tokens, temperature)
                if out:
                    return out
        return None

    def _call_openai(self, system_prompt, user_prompt, max_tokens, temperature):
        api_key = os.getenv("OPENAI_API_KEY")
        model = os.getenv("OPENAI_MODEL","gpt-4o-mini")
        if not api_key:
            return None
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
            payload = {
                "model": model,
                "messages": [{"role":"system","content":system_prompt},{"role":"user","content":user_prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"]
        except Exception:
            return None

    def _call_azure_openai(self, system_prompt, user_prompt, max_tokens, temperature):
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT","gpt-4o-mini")
        if not api_key or not endpoint:
            return None
        try:
            url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-02-15-preview"
            headers = {"api-key": api_key, "Content-Type": "application/json"}
            payload = {
                "messages":[{"role":"system","content":system_prompt},{"role":"user","content":user_prompt}],
                "max_tokens": max_tokens,
                "temperature": temperature
            }
            r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
            r.raise_for_status()
            data = r.json()
            return data["choices"][0]["message"]["content"]
        except Exception:
            return None

    def _call_anthropic(self, system_prompt, user_prompt, max_tokens, temperature):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        model = os.getenv("ANTHROPIC_MODEL","claude-3-5-sonnet-20240620")
        if not api_key:
            return None
        try:
            url = "https://api.anthropic.com/v1/messages"
            headers = {"x-api-key": api_key, "anthropic-version": "2023-06-01", "Content-Type":"application/json"}
            payload = {
                "model": model,
                "max_tokens": max_tokens,
                "temperature": temperature,
                "system": system_prompt,
                "messages": [{"role":"user","content":user_prompt}]
            }
            r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
            r.raise_for_status()
            data = r.json()
            # Anthropics returns content list
            parts = data.get("content",[])
            if parts and isinstance(parts, list):
                # join text parts
                texts = [p.get("text","") for p in parts if p.get("type")=="text"]
                return "\n".join(texts) if texts else None
            return None
        except Exception:
            return None
