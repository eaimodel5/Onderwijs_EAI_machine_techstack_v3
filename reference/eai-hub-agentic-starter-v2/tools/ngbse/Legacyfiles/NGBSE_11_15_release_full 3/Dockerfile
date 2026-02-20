# NGBSE 11.15 Online-only — Minimal Runtime Image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Install package in editable mode (ensures CLI is available)
COPY . /app
RUN pip install --no-cache-dir -e .

# Default environment (override in runtime)
ENV NGBSE_LLM_PROVIDER=openai
ENV NGBSE_LLM_ENDPOINT=https://api.openai.com/v1/chat/completions
ENV NGBSE_LLM_MODEL=gpt-4o-mini
# Provide your secret at runtime:
# docker run -e NGBSE_LLM_KEY=sk-...

# Default command; override with your own volumes/paths if needed
CMD ["ngbse", "--config", "config/ngbse.config.yml"]
