# NGBSE 17.1 Genesis
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

# Optional: install as package for console entry point
RUN pip install --no-cache-dir .

# Default runtime
CMD ["ngbse", "--config", "ngbse.config.yml", "--seeds", "seeds.jsonl", "--out", "out"]
