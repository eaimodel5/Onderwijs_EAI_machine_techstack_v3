import yaml
from pydantic import BaseModel, Field
from typing import List

class LLMConfig(BaseModel):
    provider_priority: List[str] = Field(default_factory=lambda: ["openai", "azure_openai", "anthropic"])
    max_input_tokens: int = 12000
    max_output_tokens: int = 1500
    temperature: float = 0.2

class AllowList(BaseModel):
    domains: List[str] = Field(default_factory=list)
    organizations: List[str] = Field(default_factory=list)

class OutputConfig(BaseModel):
    stix: bool = True
    docx_report: bool = True
    save_history: bool = True

class AppConfig(BaseModel):
    version: str = "15.0-genesis"
    allowlist: AllowList = AllowList()
    llm: LLMConfig = LLMConfig()
    output: OutputConfig = OutputConfig()

def load_config(path: str) -> AppConfig:
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return AppConfig(**data)
