import os, json, time
import requests

class OnlineLLMClient:
    """Pluggable online LLM client.
    Providers supported via env/config:
      - OPENAI:   provider=openai, endpoint=https://api.openai.com/v1/chat/completions, model (e.g. gpt-4o-mini)
      - AZURE:    provider=azure,  endpoint=<full-url>, api_version, deployment, key
      - ANTHROPIC:provider=anthropic, endpoint=https://api.anthropic.com/v1/messages, model (e.g. claude-3-haiku)
    Required env vars (examples):
      NGBSE_LLM_PROVIDER=openai|azure|anthropic
      NGBSE_LLM_ENDPOINT=<https endpoint>
      NGBSE_LLM_MODEL=<model or deployment name>
      NGBSE_LLM_KEY=<api key or bearer token>
      # Optional:
      NGBSE_LLM_API_VERSION=<for Azure>
      NGBSE_LLM_TIMEOUT=30
    """
    def __init__(self, provider=None, endpoint=None, model=None, key=None, api_version=None, timeout=None):
        self.provider = provider or os.getenv("NGBSE_LLM_PROVIDER", "").lower()
        self.endpoint = endpoint or os.getenv("NGBSE_LLM_ENDPOINT", "")
        self.model = model or os.getenv("NGBSE_LLM_MODEL", "")
        self.key = key or os.getenv("NGBSE_LLM_KEY", "")
        self.api_version = api_version or os.getenv("NGBSE_LLM_API_VERSION", "")
        self.timeout = int(timeout or os.getenv("NGBSE_LLM_TIMEOUT", "30"))

    def chat(self, system_prompt: str, user_prompt: str) -> str:
        if not (self.provider and self.endpoint and self.model and self.key):
            raise RuntimeError("OnlineLLMClient not configured. Set NGBSE_LLM_PROVIDER/ENDPOINT/MODEL/KEY.")

        if self.provider == "openai":
            headers = {"Authorization": f"Bearer {self.key}"}
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.2,
            }
            r = requests.post(self.endpoint, headers=headers, json=payload, timeout=self.timeout)
            r.raise_for_status()
            data = r.json()
            return data.get("choices",[{}])[0].get("message",{}).get("content","").strip()

        if self.provider == "azure":
            headers = {"api-key": self.key, "Content-Type":"application/json"}
            payload = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                "temperature": 0.2,
            }
            url = self.endpoint
            if self.api_version:
                sep = "&" if "?" in url else "?"
                url = f"{url}{sep}api-version={self.api_version}"
            r = requests.post(url, headers=headers, json=payload, timeout=self.timeout)
            r.raise_for_status()
            data = r.json()
            # Azure OpenAI response shape similar to OpenAI
            return data.get("choices",[{}])[0].get("message",{}).get("content","").strip()

        if self.provider == "anthropic":
            headers = {
                "x-api-key": self.key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            }
            payload = {
                "model": self.model,
                "max_tokens": 800,
                "system": system_prompt,
                "messages": [{"role":"user","content": user_prompt}],
                "temperature": 0.2,
            }
            r = requests.post(self.endpoint, headers=headers, json=payload, timeout=self.timeout)
            r.raise_for_status()
            data = r.json()
            # Anthropic returns a 'content' list of blocks
            blocks = data.get("content", [])
            text = ""
            for b in blocks:
                if isinstance(b, dict) and b.get("type") == "text":
                    text += b.get("text","")
            return text.strip()

        raise RuntimeError(f"Unsupported provider: {self.provider}")
