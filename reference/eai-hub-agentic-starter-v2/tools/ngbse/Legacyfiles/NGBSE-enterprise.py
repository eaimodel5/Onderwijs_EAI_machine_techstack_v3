# setup_ngbse_enterprise.py
import os
import shutil
import textwrap
from pathlib import Path

print(">>> Bouwen van NGBSE-ENTERPRISE: De Finale, Product-waardige Engine <<<")
root = Path("./NGBSE-ENTERPRISE")
if root.exists(): shutil.rmtree(root)
print(f"Projectstructuur wordt aangemaakt in: {root.resolve()}")
for d in ["engine", "collectors", "report", "config", "data", "out", "enrich", "export", "cache", "ollama_data", "data/offline_intake"]:
    (root / d).mkdir(parents=True, exist_ok=True)
for subdir in ["engine", "collectors", "report", "enrich", "export"]:
    (root / subdir / "__init__.py").touch()

# --- CONFIGURATIE ---
(root / "config/ngbse.config.yml").write_text(textwrap.dedent('''
# NGBSE-ENTERPRISE Configuratie
orchestrator:
  inter_collector_sleep_seconds: 0.2
  clearnet_only_mode: false
collectors:
  enabled: ["censys", "leakix", "shodan", "wayback", "urlscan", "github"]
scoring:
  quality_weights:
    shodan: 1.0
    censys: 1.0
    leakix: 0.9
    github: 0.8
    urlscan: 0.7
    wayback: 0.5
    default: 0.4
  eai_weights: { w1: 0.3, w2: 0.3, w3: 0.2, w4: 0.15, w5: 0.05 }
  eai_defaults: { W_V: 0.7, D_A: 0.7, D_B: 0.7, T: 0.7, A: 0.7 }
predictive_synthesis:
  enabled: true
  prior_probability: 0.1
  time_horizon_days: 90
  themes:
    Cloud_Token_Leakage:
      keywords: ["sv=", "signature=", "blob.core.windows.net"]
      future_scenario: "Ongeautoriseerde Toegang tot Cloud Data"
    Public_Code_Exposure:
      keywords: ["github", "oidc", "sts.amazonaws.com", "token"]
      future_scenario: "Misbruik van Gelekte Credentials of Configuraties"
    Exposed_IoT_Infrastructure:
      keywords: ["mqtt", "port:1883", "anonymous"]
      future_scenario: "Verstoring van Fysieke Processen via IoT"
    Legacy_Appliance_Risk:
      keywords: ["citrix", "fortinet", "netscaler", "vpn"]
      future_scenario: "Compromise via Kwetsbare Edge Appliances"
llm_interface:
  # Provider kan zijn: "local_ollama_gpu", "local_ollama_cpu", "remote_openai"
  provider: "local_ollama_gpu"
  endpoint_local: "http://llm_server:11434/api/generate"
  model_local: "phi3:mini"
  model_remote: "gpt-4o-mini"
validation:
  enabled: true # Standaard AAN voor veiligheid
  allowlist_file: "config/validation.allowlist.txt"
exports: { csv: true, stix21: true }
'''))
(root / "data/seeds.jsonl").write_text('{"seed": "domain:example.com", "where": "urlscan", "why": "Initiële test seed"}')
(root / "data/offline_intake/example.jsonl").write_text('{"source":"manual_input","query":"example query","url":"http://example.com","timestamp":"2023-01-01T12:00:00Z","hash":"manual123"}')
(root / ".env.example").write_text("# Vul uw API-sleutels in en hernoem naar .env\nURLSCAN_API_KEY=\nGITHUB_TOKEN=\nSHODAN_API_KEY=\nCENSYS_API_ID=\nCENSYS_API_SECRET=\nLEAKIX_API_KEY=\n# Optioneel, alleen voor remote_openai LLM provider\nOPENAI_API_KEY=\n")
(root / "requirements.txt").write_text("requests\nPyYAML\npython-docx\npython-dotenv\nbeautifulsoup4\n")
(root / "config/validation.allowlist.txt").write_text("# VOEG HIER DE DOMEINEN TOE WAAROP U GEAUTORISEERD BENT VALIDATIE UIT TE VOEREN\n# BIJVOORBEELD:\n# example.com\n# .jouwbedrijf.nl\n")

# --- DOCKER SETUP ---
(root / "Dockerfile").write_text(textwrap.dedent('''
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENTRYPOINT ["./run.sh"]
'''))
(root / "docker-compose.yml").write_text(textwrap.dedent('''
version: '3.8'
services:
  ngbse_app:
    build: .
    container_name: ngbse_app
    volumes:
      - ./out:/app/out
      - ./data:/app/data
      - ./.env:/app/.env
    depends_on:
      - llm_server
    networks:
      - ngbse_net
  llm_server:
    image: ollama/ollama
    container_name: llm_server
    # De GPU sectie is nu conditioneel. Als de host geen NVIDIA GPU heeft,
    # kan Ollama nog steeds op de CPU draaien (zij het veel langzamer).
    # De gebruiker moet de provider in de config aanpassen naar "local_ollama_cpu".
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - ./ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    networks:
      - ngbse_net
networks:
  ngbse_net:
'''))

# --- KERN ENGINE (VOLLEDIG) ---
(root / "engine/orchestrator.py").write_text(textwrap.dedent('''
import yaml, json, time, argparse
from pathlib import Path
from dotenv import load_dotenv

from engine.registry import load_collectors
from engine.fuzzy_dedupe import dedupe
from engine.validation import validate_findings
from engine.ingest import ingest_from_directory
from enrich.enrichment import run_enrichment
from engine.scoring import run_scoring
from engine.predictive_synthesis import generate_synthesis
from report.make_report import build_report
from export.csv_export import write_csv
from export.stix21 import write_stix_bundle
from engine.logger import get_logger

def main():
    parser = argparse.ArgumentParser(description="NGBSE-ENTERPRISE Engine")
    parser.add_argument("--validate", action="store_true", help="Forceer live validatie (vereist correcte allowlist).")
    parser.add_argument("--no-validate", action="store_true", help="Forceer uitschakelen van live validatie.")
    parser.add_argument("--clearnet", action="store_true", help="Forceer een pure clearnet run zonder API-sleutels.")
    parser.add_argument("--offline", type=str, help="Voer een offline analyse uit op data in de opgegeven map.")
    args = parser.parse_args()
    
    cfg = yaml.safe_load(Path("config/ngbse.config.yml").read_text())
    log = get_logger("NGBSE-ENTERPRISE", "out/run.log.jsonl")
    load_dotenv()
    
    if args.validate: cfg['validation']['enabled'] = True
    if args.no_validate: cfg['validation']['enabled'] = False
    if args.clearnet: cfg['orchestrator']['clearnet_only_mode'] = True
    
    raw_findings = []
    if args.offline:
        log.info(f"OFFLINE MODUS: Starten van data-import uit '{args.offline}'...")
        raw_findings = ingest_from_directory(Path(args.offline), cfg, log)
    else:
        log.info("ONLINE MODUS: Starten van dataverzameling...")
        collectors = load_collectors(cfg, log)
        seeds = [json.loads(line) for line in Path("data/seeds.jsonl").read_text().splitlines()]
        for seed in seeds:
            if collector := collectors.get(seed['where']):
                try:
                    for finding in collector.collect(seed, cfg, log): raw_findings.append(finding)
                    time.sleep(cfg['orchestrator']['inter_collector_sleep_seconds'])
                except Exception as e:
                    log.error(f"FATAL ERROR in collector '{seed['where']}'", {"error": str(e)})
    
    log.info(f"Ontdubbelen van {len(raw_findings)} bevindingen...")
    unique_findings = dedupe(raw_findings)
    
    log.info("Live validatie uitvoeren...")
    if cfg.get("validation", {}).get("enabled", False):
        allowlist = Path(cfg["validation"]["allowlist_file"]).read_text().splitlines()
        if not allowlist:
            log.warning("Validatie is ingeschakeld, maar de allowlist is leeg. Geen enkele vondst zal worden gevalideerd.")
        validated_findings = validate_findings(unique_findings, allowlist, log)
        log.info("Validatie voltooid.")
    else:
        validated_findings = unique_findings
        log.info("Validatie overgeslagen (niet ingeschakeld).")
        
    log.info("Verrijken met strategische factoren (M, C, Q)...")
    enriched_findings = run_enrichment(validated_findings, cfg)

    log.info("Toepassen van strategische E_AI* scoring...")
    scored_findings = run_scoring(enriched_findings, cfg)
    
    log.info("Genereren van voorspellende synthese met lokale LLM...")
    synthesis = generate_synthesis(scored_findings, cfg, log)

    out_dir = Path("out"); out_dir.mkdir(exist_ok=True)
    (out_dir / "findings.jsonl").write_text("\\n".join(json.dumps(f) for f in scored_findings))
    (out_dir / "synthesis_report.json").write_text(json.dumps(synthesis, indent=2, ensure_ascii=False))
        
    if cfg.get("exports", {}).get("csv"): write_csv(scored_findings, str(out_dir / "findings.csv"))
    if cfg.get("exports", {}).get("stix21"): write_stix_bundle(scored_findings, str(out_dir / "findings.stix.json"))
        
    report_path = build_report(scored_findings, synthesis)
    log.info(f"NGBSE-ENTERPRISE Run Voltooid. Rapport: {report_path}")
    print(f"\\n>>> NGBSE-ENTERPRISE Run Voltooid. Rapport: {report_path} <<<")

if __name__ == "__main__": main()
'''))
(root / "engine/ingest.py").write_text(textwrap.dedent('''
import json
from pathlib import Path

def ingest_from_directory(ingest_dir, config, log):
    findings = []
    for file_path in ingest_dir.glob("*.jsonl"):
        with file_path.open('r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    data = json.loads(line)
                    findings.append({
                        "source": data.get("source", "offline_ingest"),
                        "seed": {"seed": data.get("query", "local_data"), "where": "local"},
                        "url": data.get("url", data.get("link")), "ts": data.get("timestamp", data.get("ts")),
                        "where": data.get("ip_str", data.get("host")), "snippet": data.get("data", data.get("banner")),
                        "coc_sha256": data.get("hash", "n/a")
                    })
                except json.JSONDecodeError:
                    log.warning(f"Kon JSON niet parsen in {file_path} op regel {line_num}")
                    continue
    log.info(f"{len(findings)} records geïmporteerd uit {ingest_dir}")
    return findings
'''))
(root / "engine/llm_interface.py").write_text(textwrap.dedent('''
import requests
import os

def query_llm(prompt, config, log):
    llm_cfg = config.get("llm_interface", {})
    provider = llm_cfg.get("provider", "local_ollama_gpu")
    
    if provider in ["local_ollama_gpu", "local_ollama_cpu"]:
        endpoint = llm_cfg.get("endpoint_local", "http://llm_server:11434/api/generate")
        model = llm_cfg.get("model_local", "phi3:mini")
        if provider == "local_ollama_cpu":
            log.warning("LLM draait op CPU. Dit kan zeer traag zijn.")
        try:
            r = requests.post(endpoint, json={"model": model, "prompt": prompt, "stream": False}, timeout=300)
            r.raise_for_status()
            return r.json().get("response", "Error: No response from local LLM.")
        except requests.RequestException as e:
            log.error(f"Kon geen verbinding maken met lokale Ollama instance op {endpoint}", {"error": str(e)})
            return f"Error connecting to local Ollama: {e}"
            
    elif provider == "remote_openai":
        log.warning("Gebruik van externe OpenAI API. Data wordt gedeeld.")
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            return "Error: OPENAI_API_KEY niet gevonden in .env voor remote provider."
        try:
            # Implementatie voor OpenAI API call
            return "OpenAI provider is geconfigureerd maar nog niet geïmplementeerd."
        except Exception as e:
            log.error("Fout bij aanroepen OpenAI API", {"error": str(e)})
            return f"Error with OpenAI API: {e}"
            
    return "Error: Onbekende LLM provider gespecificeerd in config."
'''))
(root / "engine/predictive_synthesis.py").write_text(textwrap.dedent('''
from collections import defaultdict
import math
import json
from engine.llm_interface import query_llm

def generate_synthesis(findings, config, log):
    synthesis_cfg = config.get("predictive_synthesis", {})
    if not synthesis_cfg.get("enabled", False):
        return {}
        
    themes_def = synthesis_cfg.get("themes", {})
    for f in findings:
        f_themes = set()
        text_to_scan = f['seed']['seed'].lower() + " " + (f.get('url') or '').lower()
        for theme, definition in themes_def.items():
            if any(kw in text_to_scan for kw in definition.get("keywords", [])):
                f_themes.add(theme)
        f['themes'] = list(f_themes)
        
    scenarios = defaultdict(lambda: {"findings": []})
    for f in findings:
        for theme in f.get('themes', []):
            scenarios[theme]["findings"].append(f)
            
    prior = synthesis_cfg.get("prior_probability", 0.1)
    prior_odds = prior / (1 - prior)
    output = {}
    
    for theme, data in scenarios.items():
        findings_in_theme = data["findings"]
        if not findings_in_theme: continue
        
        avg_score = sum(f.get('score', 0.0) for f in findings_in_theme) / len(findings_in_theme)
        likelihood_ratio = 1 + 9 * (max(0, avg_score - 0.5) / 0.5)
        posterior_odds = prior_odds * likelihood_ratio
        probability = posterior_odds / (1 + posterior_odds)
        
        C = findings_in_theme[0].get('enrichment', {}).get('C', 0)
        Q_avg = sum(f.get('enrichment', {}).get('Q', 0) for f in findings_in_theme) / len(findings_in_theme)
        top_evidence = json.dumps([{"url": f.get('url'), "source": f.get('source')} for f in findings_in_theme[:3]])
        
        prompt = (
            f"You are a Dutch strategic intelligence analyst. Write a concise, professional, semantic summary in Dutch for the following risk scenario. "
            f"Scenario Theme: '{theme}'. "
            f"Supporting evidence shows an average strategic risk score (E_AI*) of {avg_score:.2f}, corroborated by {C} sources. "
            f"Top evidence snippets: {top_evidence}. "
            f"Based on this, summarize the risk in 1-2 sentences, concluding with a clear statement of the potential business impact."
        )
        summary_text = query_llm(prompt, config, log)
        
        output[theme] = {
            "future_scenario": themes_def.get(theme, {}).get("future_scenario", "Onbekend"),
            "probability_90_days": f"{probability:.1%}",
            "semantic_summary": summary_text,
            "avg_eai_score": avg_score,
            "evidence_count": len(findings_in_theme)
        }
        
    return dict(sorted(output.items(), key=lambda item: float(item[1]['probability_90_days'][:-1]), reverse=True))
'''))
(root / "engine/registry.py").write_text(textwrap.dedent('''
import importlib
def load_collectors(config, log):
    mods = {}
    for name in config.get("collectors", {}).get("enabled", []):
        try:
            mods[name] = importlib.import_module(f"collectors.{name}_collector")
        except ImportError:
            log.error(f"Kon collector '{name}' niet laden.")
    return mods
'''))
(root / "engine/fuzzy_dedupe.py").write_text(textwrap.dedent('''
import re, hashlib
from urllib.parse import urlparse
def normalize_url(u):
    if not u or not isinstance(u, str): return ""
    p = urlparse(u.lower()); host = p.hostname or ""; host = host[4:] if host.startswith("www.") else host
    return f"{host}{p.path or '/'}"
def soft_hash(f):
    key = f"{f['seed'].get('seed', '')}|{f['source']}|{normalize_url(f.get('url'))}"
    return hashlib.sha256(key.encode()).hexdigest()
def dedupe(findings):
    seen=set(); out=[]
    for f in findings:
        h = soft_hash(f)
        if h not in seen:
            seen.add(h)
            out.append(f)
    return out
'''))
(root / "engine/scoring.py").write_text(textwrap.dedent('''
import math
def e_ai_star(params, weights):
    Vp = min(1.0, 0.5 * params['V'] + 0.3 * params['Q'] + 0.2 * min(1.0, params['C'] / 3.0))
    score = math.sqrt(
        weights['w1'] * (params['P'] * params['W_V']) +
        weights['w2'] * (params['D_A'] * params['D_B']) +
        weights['w3'] * (params['T'] * params['A']) +
        weights['w4'] * Vp +
        weights['w5'] * params['M']
    )
    return round(score, 4)
def run_scoring(findings, config):
    cfg = config.get('scoring', {})
    weights = cfg.get('eai_weights', {})
    defaults = cfg.get('eai_defaults', {})
    for f in findings:
        enrich = f.get('enrichment', {})
        params = {
            'P': 1.0, 'V': 1.0 if f.get('validated') else 0.5,
            'Q': enrich.get('Q', 0.4), 'C': enrich.get('C', 1), 'M': enrich.get('M', 0.2), **defaults
        }
        f['score'] = e_ai_star(params, weights)
    findings.sort(key=lambda x: x.get('score', 0), reverse=True)
    return findings
'''))
(root / "engine/validation.py").write_text(textwrap.dedent('''
import re, requests
from urllib.parse import urlparse
def _allowed(host, allowlist):
    host=host.lower()
    for e in [x.strip().lower() for x in allowlist if x.strip()]:
        if e.startswith(".") and host.endswith(e): return True
        if host==e: return True
    return False
def validate_findings(findings, allowlist, log):
    out=[]
    validated_count = 0
    for f in findings:
        url = f.get("url")
        if not url:
            out.append({**f, "validated": False})
            continue
        host = urlparse(url if re.match(r"^https?://", url) else "https://" + url).hostname or ""
        if not allowlist or not _allowed(host, allowlist):
            out.append({**f, "validated": False})
            continue
        try:
            r = requests.head(url, timeout=7, allow_redirects=True, headers={"User-Agent":"NGBSE-ENTERPRISE"})
            ok = 200 <= r.status_code < 400
            if ok: validated_count += 1
            out.append({**f, "validated": ok, "status_code": r.status_code})
        except requests.RequestException as e:
            log.warning(f"Validatie mislukt voor {url}", {"error": str(e)})
            out.append({**f, "validated": False, "status_code": None})
    log.info(f"{validated_count} van de {len(findings)} bevindingen succesvol gevalideerd.")
    return out
'''))
(root / "engine/logger.py").write_text(textwrap.dedent('''
import json, logging, sys, time
class JsonLineFormatter(logging.Formatter):
    def format(self, record):
        payload = {"ts": int(time.time()*1000), "level": record.levelname, "msg": record.getMessage(), "name": record.name}
        if hasattr(record, 'args') and isinstance(record.args, dict): payload.update(record.args)
        return json.dumps(payload, ensure_ascii=False)
def get_logger(name, logfile=None):
    logger = logging.getLogger(name); logger.setLevel(logging.INFO)
    if not logger.handlers:
        h = logging.StreamHandler(sys.stdout); h.setFormatter(JsonLineFormatter()); logger.addHandler(h)
        if logfile:
            fh = logging.FileHandler(logfile, encoding="utf-8"); fh.setFormatter(JsonLineFormatter()); logger.addHandler(fh)
    return logger
'''))

# --- VERRIJKING ---
(root / "enrich/enrichment.py").write_text(textwrap.dedent('''
from collections import defaultdict
def run_enrichment(findings, config):
    by_seed = defaultdict(list)
    for f in findings: by_seed[f['seed']['seed']].append(f)
    q_weights = config.get('scoring', {}).get('quality_weights', {})
    for seed_str, items in by_seed.items():
        live_sources = {i['source'] for i in items if i['source'] != 'wayback'}
        C = len(live_sources)
        has_wayback = 'wayback' in {i['source'] for i in items}
        M = 1.0 if has_wayback and not live_sources else (0.6 if has_wayback else 0.2)
        for item in items:
            Q = q_weights.get(item['source'], q_weights.get('default', 0.4))
            item['enrichment'] = {'M': M, 'C': C, 'Q': Q}
    return findings
'''))

# --- OPERATIONELE COLLECTORS ---
(root / "collectors/util.py").write_text("import hashlib\ndef coc_sha256(material: str) -> str: return hashlib.sha256(material.encode('utf-8', 'ignore')).hexdigest()")
(root / "collectors/urlscan_collector.py").write_text(textwrap.dedent('''
import os, requests, time; from .util import coc_sha256
def collect(seed_obj, cfg, log):
    q = seed_obj.get("seed"); api_key = os.getenv("URLSCAN_API_KEY") if not cfg.get("orchestrator",{}).get("clearnet_only_mode") else None
    if not api_key: log.warning("Urlscan collector overgeslagen (API-sleutel vereist)."); return
    retries = 3; backoff = 2
    for i in range(retries):
        try:
            r=requests.get("https://urlscan.io/api/v1/search/", params={"q":q,"size":50}, headers={"API-Key":api_key}, timeout=20)
            r.raise_for_status()
            for item in r.json().get("results", []):
                url=item.get("page",{}).get("url"); ts=item.get("indexedAt"); rid=item.get("_id")
                yield {"source":"urlscan","seed":seed_obj,"url":url,"ts":ts,"coc_sha256":coc_sha256(f"{rid}|{url}|{ts}")}
            return
        except requests.RequestException as e:
            log.warning(f"Urlscan Fout (poging {i+1}/{retries})", {"error": str(e)}); time.sleep(backoff**i)
'''))
(root / "collectors/github_collector.py").write_text(textwrap.dedent('''
import os, requests, time; from .util import coc_sha256; from bs4 import BeautifulSoup; from urllib.parse import quote_plus
def collect(seed_obj, cfg, log):
    q = seed_obj.get("seed"); token = os.getenv("GITHUB_TOKEN") if not cfg.get("orchestrator",{}).get("clearnet_only_mode") else None
    if token:
        try:
            r=requests.get("https://api.github.com/search/code", params={"q":q,"per_page":50}, headers={"Authorization":f"Bearer {token}"}, timeout=20)
            r.raise_for_status()
            for i in r.json().get("items",[]):
                url=i.get("html_url"); repo=i.get("repository",{}).get("full_name")
                yield {"source":"github","seed":seed_obj,"url":url,"ts":i.get("repository",{}).get("updated_at"),"coc_sha256":coc_sha256(f"{url}|{repo}")}
        except Exception as e: log.error("GitHub API Fout", {"error": str(e)})
    else:
        log.warning("GitHub draait in clearnet-scrape-modus.")
        try:
            r = requests.get(f"https://github.com/search?type=code&q={quote_plus(q)}", timeout=20); r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            for link in soup.select('div.search-title a'):
                url = "https://github.com" + link['href']
                yield {"source":"github","seed":seed_obj,"url":url,"ts":None,"coc_sha256":coc_sha256(url)}
        except Exception as e: log.error("GitHub Scrape Fout", {"error": str(e)})
'''))
(root / "collectors/shodan_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg, log):
    q=seed_obj.get("seed"); key=os.getenv("SHODAN_API_KEY")
    if not key or cfg.get("orchestrator",{}).get("clearnet_only_mode"): log.warning("Shodan collector vereist een API-sleutel."); return
    try:
        r=requests.get("https://api.shodan.io/shodan/host/search", params={"key":key,"query":q}, timeout=20); r.raise_for_status()
        for i in r.json().get("matches",[]):
            ip=i.get("ip_str"); ts=i.get("timestamp")
            yield {"source":"shodan","seed":seed_obj,"where":ip,"url":f"https://www.shodan.io/host/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")}
    except Exception as e: log.error("Shodan Fout", {"error": str(e)})
'''))
(root / "collectors/censys_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg, log):
    q=seed_obj.get("seed"); api_id=os.getenv("CENSYS_API_ID"); api_secret=os.getenv("CENSYS_API_SECRET")
    if not (api_id and api_secret) or cfg.get("orchestrator",{}).get("clearnet_only_mode"): log.warning("Censys collector vereist API ID/Secret."); return
    try:
        r=requests.post("https://search.censys.io/api/v2/hosts/search", auth=(api_id,api_secret), json={"q":q,"per_page":50}, timeout=20); r.raise_for_status()
        for i in r.json().get("result",{}).get("hits",[]):
            ip=i.get("ip"); ts=i.get("last_updated_at")
            yield {"source":"censys","seed":seed_obj,"where":ip,"url":f"https://search.censys.io/hosts/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")}
    except Exception as e: log.error("Censys Fout", {"error": str(e)})
'''))
(root / "collectors/leakix_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg, log):
    q=seed_obj.get("seed"); key=os.getenv("LEAKIX_API_KEY")
    if not key or cfg.get("orchestrator",{}).get("clearnet_only_mode"): log.warning("LeakIX collector vereist een API-sleutel."); return
    try:
        r=requests.get("https://leakix.net/search", params={"q":q,"size":50}, headers={"Api-Key":key}, timeout=20); r.raise_for_status()
        for i in r.json():
            url=i.get("link") or i.get("url"); ts=i.get("time")
            yield {"source":"leakix","seed":seed_obj,"url":url,"where":i.get("ip"),"ts":ts,"coc_sha256":coc_sha256(f"{url}|{ts}")}
    except Exception as e: log.error("LeakIX Fout", {"error": str(e)})
'''))
(root / "collectors/wayback_collector.py").write_text(textwrap.dedent('''
import requests; from .util import coc_sha256
def collect(seed_obj, cfg, log):
    q = seed_obj.get("seed")
    try:
        r=requests.get("http://web.archive.org/cdx/search/cdx", params={"url":f"*{q}*","output":"json","limit":100,"filter":"statuscode:200"}, timeout=20); r.raise_for_status()
        for row in r.json()[1:]:
            ts, orig, digest = row[1], row[2], row[5]
            url=f"https://web.archive.org/web/{ts}/{orig}"; ts_iso=f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:{ts[12:14]}Z"
            yield {"source":"wayback","seed":seed_obj,"url":url,"ts":ts_iso,"coc_sha256":coc_sha256(f"{url}|{digest}")}
    except Exception as e: log.error("Wayback Fout", {"error": str(e)})
'''))

# --- EXPORTS ---
(root / "export/csv_export.py").write_text(textwrap.dedent('''
import csv, json
def write_csv(findings, path):
    if not findings: return
    flat_findings = []
    for f in findings:
        ff = dict(f); enrich = ff.pop('enrichment', {}); ff.update(enrich); ff.pop('themes', None)
        ff['seed'] = ff.get('seed',{}).get('seed')
        flat_findings.append(ff)
    keys = sorted(list(flat_findings[0].keys()))
    with open(path, 'w', newline='', encoding='utf-8') as h:
        w = csv.DictWriter(h, fieldnames=keys, extrasaction='ignore'); w.writeheader(); w.writerows(flat_findings)
'''))
(root / "export/stix21.py").write_text(textwrap.dedent('''
import json, uuid, datetime
def _id(tp): return f"{tp}--{uuid.uuid4()}"
def write_stix_bundle(findings, path):
    objs=[]
    for f in findings[:200]:
        if not (url := f.get("url")): continue
        objs.append({
            "type":"indicator", "spec_version":"2.1", "id":_id("indicator"),
            "pattern_type":"stix", "pattern":f"[url:value = '{url}']",
            "name": f"OSINT Finding: {url}",
            "created":datetime.datetime.utcnow().isoformat()+"Z",
            "valid_from":(f.get('ts') or datetime.datetime.utcnow().isoformat()+'Z')
        })
    with open(path,"w") as fo:
        json.dump({"type":"bundle","id":_id("bundle"),"objects":objs}, fo, indent=2)
'''))

# --- RAPPORTAGE ---
(root / "report/make_report.py").write_text(textwrap.dedent('''
import json; from pathlib import Path; from docx import Document
def build_report(findings, synthesis):
    out_path = Path("out/NGBSE-ENTERPRISE_Report.docx"); doc = Document()
    doc.add_heading("NGBSE-ENTERPRISE: Executive Briefing", 0)
    doc.add_heading("Voorspellende Risicoscenario's (90 dagen)", 1)
    if not synthesis: doc.add_paragraph("Geen risicoscenario's gedetecteerd.")
    for theme, data in synthesis.items():
        doc.add_paragraph(data['future_scenario'], style='Heading 2')
        p=doc.add_paragraph(); p.add_run('Waarschijnlijkheid: ').bold=True; p.add_run(f'{data["probability_90_days"]}\\n')
        p.add_run('Samenvatting: ').bold=True; p.add_run(data['semantic_summary'])
    doc.add_heading('Gedetailleerd Bewijs (Top 20)', 1)
    table = doc.add_table(1, 4); table.style = 'Table Grid'; hdr=table.rows[0].cells; hdr[0].text='E_AI*'; hdr[1].text='Info'; hdr[2].text='URL/Bewijs'; hdr[3].text='CoC Hash'
    for f in findings[:20]:
        r=table.add_row().cells; r[0].text=f'{f.get("score",0):.4f}'; e=f.get('enrichment',{}); r[1].text=f'M={e.get("M")} C={e.get("C")} Q={e.get("Q")}'; r[2].text=str(f.get('url',''))[:60]; r[3].text=str(f.get('coc_sha256',''))[:12]
    doc.save(out_path); return out_path
'''))

# --- RUN SCRIPT ---
(root / "run.sh").write_text(textwrap.dedent('''
#!/bin/bash
set -e
echo ">>> NGBSE-ENTERPRISE: De Autonome Intelligence Appliance starten..."
if [ "$(docker ps -a -q -f name=ngbse_app)" ]; then docker stop ngbse_app && docker rm ngbse_app; fi
if [ "$(docker ps -a -q -f name=llm_server)" ]; then docker stop llm_server && docker rm llm_server; fi
if [ ! -f .env ]; then cp .env.example .env; echo "BELANGRIJK: Vul API-sleutels in .env."; fi
docker-compose up --build -d
echo "Wachten tot de lokale LLM-server (Ollama) is opgestart..."
until $(curl --silent --output /dev/null --fail http://localhost:11434/api/tags); do printf '.'; sleep 2; done
echo -e "\\nLLM-server is online."
echo "Downloaden van het LLM-model (phi3:mini)..."
docker exec -it llm_server ollama pull phi3:mini
echo "LLM-model gedownload."
echo "Starten van de NGBSE-analyse..."
if [[ "$1" == "--offline" ]]; then
    docker exec -it ngbse_app python -m engine.orchestrator --offline "$2"
else
    docker exec -it ngbse_app python -m engine.orchestrator "$@"
fi
echo "\\n>>> NGBSE-ENTERPRISE run voltooid. Bekijk de 'out' map voor de resultaten. <<<"
'''))
os.chmod(root / "run.sh", 0o755)
(root / "README.md").write_text(textwrap.dedent('''
# NGBSE-ENTERPRISE
De finale, complete, autonome intelligence appliance, inclusief lokale LLM en professionele features.

## Hardware Vereisten
- Een PC/server met een NVIDIA GPU.
- Docker en de NVIDIA Container Toolkit geïnstalleerd.

## Eerste Keer Setup
`./run.sh`

## Gebruik
- **Online run (aanbevolen):** `./run.sh`
- **Clearnet run (beperkt):** `./run.sh --clearnet`
- **Offline run (van USB):** Plaats data in `data/offline_intake/` en draai `./run.sh --offline data/offline_intake`
- **Validatie forceren:** Voeg `--validate` toe aan elk commando (vereist een correcte `allowlist`).
'''))

print("\\n>>> SETUP VOLTOOID. NGBSE-ENTERPRISE is gebouwd. <<<")
print(f"1. Navigeer naar de map: cd {root}")
print("2. (Optioneel) Vul uw API-sleutels in '.env'.")
print("3. Start de appliance met: ./run.sh")