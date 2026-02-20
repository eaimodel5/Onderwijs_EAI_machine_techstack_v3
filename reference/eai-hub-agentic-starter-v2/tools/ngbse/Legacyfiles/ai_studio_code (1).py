# setup_ngbse_alpha.py
import os
import shutil
import textwrap
from pathlib import Path

print(">>> Bouwen van NGBSE-ALPHA: De Volledige, Operationele Engine <<<")
root = Path("./NGBSE-ALPHA")
if root.exists(): shutil.rmtree(root)
print(f"Projectstructuur wordt aangemaakt in: {root.resolve()}")
for d in ["engine", "collectors", "report", "config", "data", "out", "enrich", "export", "cache"]:
    (root / d).mkdir(parents=True, exist_ok=True)
for subdir in ["engine", "collectors", "report", "enrich", "export"]:
    (root / subdir / "__init__.py").touch()

# --- CONFIGURATIE ---
(root / "config/ngbse.config.yml").write_text(textwrap.dedent('''
orchestrator:
  inter_collector_sleep_seconds: 0.2
  max_pages_per_collector: 2
  use_cache: true
  cache_dir: "cache"
  clearnet_only_mode: false # Forceer anonieme run, zelfs als sleutels bestaan
collectors:
  enabled: ["censys", "leakix", "shodan", "wayback", "urlscan", "github"]
scoring:
  quality_weights:
    shodan: 1.0; censys: 1.0; leakix: 0.9; github: 0.8; urlscan: 0.7; wayback: 0.5; default: 0.4
  eai_weights: { w1: 0.3, w2: 0.3, w3: 0.2, w4: 0.15, w5: 0.05 }
  eai_defaults: { W_V: 0.7, D_A: 0.7, D_B: 0.7, T: 0.7, A: 0.7 }
validation:
  enabled: false
  allowlist_file: "config/validation.allowlist.txt"
probability_layer: { enabled: true }
reverse_llm: { enabled: true }
exports: { csv: true, stix21: true }
'''))
(root / "data/seeds.jsonl").write_text(textwrap.dedent('''
{"seed": "blob.core.windows.net?sv=", "where": "urlscan", "why": "Azure SAS token sporen"}
{"seed": "token.actions.githubusercontent.com aud", "where": "github", "why": "OIDC trust policies"}
{"seed": "port:1883 MQTT country:NL", "where": "shodan", "why": "Open MQTT brokers in NL"}
{"seed": "allow_anonymous true", "where": "leakix", "why": "Anonieme toegang-configuraties"}
{"seed": "services.software.vendor:\\"Citrix\\" AND country:NL", "where": "censys", "why": "Citrix ADC/NetScaler aanwezigheid"}
{"seed": "*citrix.com/*/release-notes/*", "where": "wayback", "why": "Mirror-aanwezigheid van oude configs"}
'''))
(root / ".env.example").write_text("# Vul uw API-sleutels in en hernoem naar .env\nURLSCAN_API_KEY=\nGITHUB_TOKEN=\nSHODAN_API_KEY=\nCENSYS_API_ID=\nCENSYS_API_SECRET=\nLEAKIX_API_KEY=\n")
(root / "requirements.txt").write_text("requests\nPyYAML\npython-docx\npython-dotenv\nbeautifulsoup4\n")
(root / "config/validation.allowlist.txt").write_text(".example.com\nexample.com")

# --- KERN ENGINE ---
(root / "engine/orchestrator.py").write_text(textwrap.dedent('''
import yaml, json, time, argparse
from pathlib import Path
from dotenv import load_dotenv

from engine.registry import load_collectors
from engine.fuzzy_dedupe import dedupe
from engine.validation import validate_findings
from enrich.enrichment import run_enrichment
from engine.scoring import run_scoring
from engine.probability import evaluate as eval_probability
from engine.reverse_llm import run as reverse_llm_run
from report.make_report import build_report
from export.csv_export import write_csv
from export.stix21 import write_stix_bundle

def main():
    parser = argparse.ArgumentParser(description="NGBSE-ALPHA Engine")
    parser.add_argument("--validate", action="store_true", help="Override config and enable live validation.")
    parser.add_argument("--clearnet", action="store_true", help="Forceer een pure clearnet run zonder API-sleutels.")
    args = parser.parse_args()
    
    cfg = yaml.safe_load(Path("config/ngbse.config.yml").read_text())
    load_dotenv()
    if args.validate: cfg['validation']['enabled'] = True
    if args.clearnet: cfg['orchestrator']['clearnet_only_mode'] = True
    
    print("[1/6] Verzamelen van data...")
    collectors = load_collectors(cfg)
    seeds = [json.loads(line) for line in Path("data/seeds.jsonl").read_text().splitlines()]
    raw_findings = []
    for seed in seeds:
        if collector := collectors.get(seed['where']):
            try:
                for finding in collector.collect(seed, cfg): raw_findings.append(finding)
                time.sleep(cfg['orchestrator']['inter_collector_sleep_seconds'])
            except Exception as e:
                print(f"FATAL ERROR in collector '{seed['where']}': {e}")
    
    print(f"[2/6] Ontdubbelen van {len(raw_findings)} bevindingen...")
    unique_findings = dedupe(raw_findings)
    
    print(f"[3/6] Live validatie uitvoeren...")
    if cfg.get("validation", {}).get("enabled", False):
        allowlist = Path(cfg["validation"]["allowlist_file"]).read_text().splitlines()
        validated_findings = validate_findings(unique_findings, allowlist)
        print("--> Validatie voltooid.")
    else:
        validated_findings = unique_findings
        print("--> Validatie overgeslagen (niet ingeschakeld).")
        
    print(f"[4/6] Verrijken met strategische factoren (M, C, Q)...")
    enriched_findings = run_enrichment(validated_findings, cfg)

    print("[5/6] Toepassen van strategische E_AI* scoring...")
    scored_findings = run_scoring(enriched_findings, cfg)

    print("[6/6] Genereren van outputs en tactische analyses...")
    out_dir = Path("out"); out_dir.mkdir(exist_ok=True)
    (out_dir / "findings.jsonl").write_text("\\n".join(json.dumps(f) for f in scored_findings))
    
    if cfg.get("probability_layer", {}).get("enabled"):
        prob = eval_probability(scored_findings, cfg); (out_dir / "probability.json").write_text(json.dumps(prob, indent=2))
    if cfg.get("reverse_llm", {}).get("enabled"):
        rllm = reverse_llm_run(scored_findings, cfg); (out_dir / "reverse_llm.json").write_text(json.dumps(rllm, indent=2))
    if cfg.get("exports", {}).get("csv"): write_csv(scored_findings, str(out_dir / "findings.csv"))
    if cfg.get("exports", {}).get("stix21"): write_stix_bundle(scored_findings, str(out_dir / "findings.stix.json"))
        
    report_path = build_report(scored_findings)
    print(f"\\n>>> NGBSE-ALPHA Run Voltooid. Rapport: {report_path} <<<")

if __name__ == "__main__": main()
'''))
(root / "engine/registry.py").write_text(textwrap.dedent('''
import importlib
def load_collectors(config):
    mods = {}
    for name in config.get("collectors", {}).get("enabled", []):
        try: mods[name] = importlib.import_module(f"collectors.{name}_collector")
        except ImportError: print(f"Kon collector '{name}' niet laden.")
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
        if h not in seen: seen.add(h); out.append(f)
    return out
'''))
(root / "engine/scoring.py").write_text(textwrap.dedent('''
import math
def e_ai_star(params, weights):
    Vp = min(1.0, 0.5 * params['V'] + 0.3 * params['Q'] + 0.2 * min(1.0, params['C'] / 3.0))
    score = math.sqrt(
        weights['w1'] * (params['P'] * params['W_V']) + weights['w2'] * (params['D_A'] * params['D_B']) +
        weights['w3'] * (params['T'] * params['A']) + weights['w4'] * Vp + weights['w5'] * params['M']
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
def validate_findings(findings, allowlist):
    out=[]
    for f in findings:
        url = f.get("url")
        if not url: out.append({**f, "validated": False}); continue
        host = urlparse(url if re.match(r"^https?://", url) else "https://" + url).hostname or ""
        if not _allowed(host, allowlist): out.append({**f, "validated": False}); continue
        try:
            r = requests.head(url, timeout=7, allow_redirects=True, headers={"User-Agent":"NGBSE-ALPHA"})
            ok = 200 <= r.status_code < 400
            out.append({**f, "validated": ok, "status_code": r.status_code})
        except requests.RequestException:
            out.append({**f, "validated": False, "status_code": None})
    return out
'''))
(root / "engine/probability.py").write_text(textwrap.dedent('''
from collections import defaultdict; import math
def evaluate(findings, config):
    per=defaultdict(list); prior=float(config.get("probability_layer",{}).get("prior_probability",0.2))
    lr=float(config.get("probability_layer",{}).get("likelihood_strength",2.0))
    for f in findings: per[f['seed']['seed']].append(f)
    prior_odds=prior/(1-prior) if prior < 1 else float('inf'); out={}
    for seed, items in per.items():
        if not items: out[seed]=prior; continue
        avg_score=sum(i.get("score",0.0) for i in items) / len(items)
        corr=math.log(1+len({i['source'] for i in items}),2)
        L=1.0 + (avg_score*corr*lr)
        post_odds=prior_odds*L; post=post_odds/(1+post_odds)
        out[seed]=round(post,4)
    return {"scenario_probability": out}
'''))
(root / "engine/reverse_llm.py").write_text(textwrap.dedent('''
from collections import defaultdict
def run(findings, config):
    per=defaultdict(list)
    for f in findings: per[f['seed']['seed']].append(f)
    hy={}
    for seed, items in per.items():
        sources={i['source'].lower() for i in items}; h=[]
        if "wayback" in sources and not (sources-{"wayback"}): h.append("Mirror-only: seek live corroboration.")
        if "github" in sources and not ({"urlscan","censys","shodan"} & sources): h.append("Code-only traces: check on infrastructure scanners.")
        validated_count = sum(1 for i in items if i.get('validated'))
        if len(items) > 5 and validated_count == 0: h.append("No live validation: assets might be offline or firewalled.")
        if not h: h.append("Add a second independent source to corroborate presence.")
        hy[seed]=h
    return {"reverse_llm_hypotheses":hy}
'''))

# --- VERRIJKING (ENRICHMENT) ---
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
(root / "enrich/cluster.py").write_text(textwrap.dedent('''
from urllib.parse import urlparse; from collections import defaultdict
def cluster_by_domain(findings):
    clusters=defaultdict(list)
    for f in findings:
        try: host = urlparse(f.get("url") or "").hostname or ""
        except: host = ""
        if host: clusters[host].append({"source": f["source"], "score": f["score"]})
    return dict(sorted(clusters.items(),key=lambda i:len(i[1]),reverse=True))
'''))
(root / "enrich/timeline.py").write_text(textwrap.dedent('''
from collections import defaultdict
def timeline_by_day(findings):
    by_day=defaultdict(int)
    for f in findings:
        if ts := f.get("ts"): by_day[str(ts)[:10]] += 1
    return dict(sorted(by_day.items()))
'''))

# --- OPERATIONELE COLLECTORS ---
(root / "collectors/util.py").write_text("import hashlib\ndef coc_sha256(material: str) -> str: return hashlib.sha256(material.encode('utf-8', 'ignore')).hexdigest()")
(root / "collectors/urlscan_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q = seed_obj.get("seed"); api_key = os.getenv("URLSCAN_API_KEY") if not cfg.get("orchestrator",{}).get("clearnet_only_mode") else None
    if not api_key: print("INFO: Urlscan draait in clearnet-modus (geen API-sleutel). Resultaten kunnen beperkt zijn."); return
    try:
        r=requests.get("https://urlscan.io/api/v1/search/", params={"q":q,"size":50}, headers={"API-Key":api_key}, timeout=20)
        r.raise_for_status()
        for i in r.json().get("results", []):
            url=i.get("page",{}).get("url"); ts=i.get("indexedAt"); rid=i.get("_id")
            yield {"source":"urlscan","seed":seed_obj,"url":url,"ts":ts,"coc_sha256":coc_sha256(f"{rid}|{url}|{ts}")}
    except Exception as e: print(f"Urlscan Fout: {e}")
'''))
(root / "collectors/github_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256; from bs4 import BeautifulSoup; from urllib.parse import quote_plus
def collect(seed_obj, cfg):
    q = seed_obj.get("seed"); token = os.getenv("GITHUB_TOKEN") if not cfg.get("orchestrator",{}).get("clearnet_only_mode") else None
    if token:
        try:
            r=requests.get("https://api.github.com/search/code", params={"q":q,"per_page":50}, headers={"Authorization":f"Bearer {token}"}, timeout=20)
            r.raise_for_status()
            for i in r.json().get("items",[]):
                url=i.get("html_url"); repo=i.get("repository",{}).get("full_name")
                yield {"source":"github","seed":seed_obj,"url":url,"ts":i.get("repository",{}).get("updated_at"),"coc_sha256":coc_sha256(f"{url}|{repo}")}
        except Exception as e: print(f"GitHub API Fout: {e}")
    else:
        print("INFO: GitHub draait in clearnet-scrape-modus (geen API-token). Resultaten zijn beperkt en minder betrouwbaar.")
        try:
            r = requests.get(f"https://github.com/search?type=code&q={quote_plus(q)}", timeout=20); r.raise_for_status()
            soup = BeautifulSoup(r.text, 'html.parser')
            for link_container in soup.select('div.search-title a'):
                url = "https://github.com" + link_container['href']
                yield {"source":"github","seed":seed_obj,"url":url,"ts":None,"coc_sha256":coc_sha256(url)}
        except Exception as e: print(f"GitHub Scrape Fout: {e}")
'''))
(root / "collectors/shodan_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); key=os.getenv("SHODAN_API_KEY")
    if not key or cfg.get("orchestrator",{}).get("clearnet_only_mode"): print("INFO: Shodan collector vereist een API-sleutel en is overgeslagen."); return
    try:
        r=requests.get("https://api.shodan.io/shodan/host/search", params={"key":key,"query":q}, timeout=20); r.raise_for_status()
        for i in r.json().get("matches",[]):
            ip=i.get("ip_str"); ts=i.get("timestamp")
            yield {"source":"shodan","seed":seed_obj,"where":ip,"url":f"https://www.shodan.io/host/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")}
    except Exception as e: print(f"Shodan Fout: {e}")
'''))
(root / "collectors/censys_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); api_id=os.getenv("CENSYS_API_ID"); api_secret=os.getenv("CENSYS_API_SECRET")
    if not (api_id and api_secret) or cfg.get("orchestrator",{}).get("clearnet_only_mode"): print("INFO: Censys collector vereist API ID/Secret en is overgeslagen."); return
    try:
        r=requests.post("https://search.censys.io/api/v2/hosts/search", auth=(api_id,api_secret), json={"q":q,"per_page":50}, timeout=20); r.raise_for_status()
        for i in r.json().get("result",{}).get("hits",[]):
            ip=i.get("ip"); ts=i.get("last_updated_at")
            yield {"source":"censys","seed":seed_obj,"where":ip,"url":f"https://search.censys.io/hosts/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")}
    except Exception as e: print(f"Censys Fout: {e}")
'''))
(root / "collectors/leakix_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); key=os.getenv("LEAKIX_API_KEY")
    if not key or cfg.get("orchestrator",{}).get("clearnet_only_mode"): print("INFO: LeakIX collector vereist een API-sleutel en is overgeslagen."); return
    try:
        r=requests.get("https://leakix.net/search", params={"q":q,"size":50}, headers={"Api-Key":key}, timeout=20); r.raise_for_status()
        for i in r.json():
            url=i.get("link") or i.get("url"); ts=i.get("time")
            yield {"source":"leakix","seed":seed_obj,"url":url,"where":i.get("ip"),"ts":ts,"coc_sha256":coc_sha256(f"{url}|{ts}")}
    except Exception as e: print(f"LeakIX Fout: {e}")
'''))
(root / "collectors/wayback_collector.py").write_text(textwrap.dedent('''
import requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q = seed_obj.get("seed")
    try:
        r=requests.get("http://web.archive.org/cdx/search/cdx", params={"url":f"*{q}*","output":"json","limit":100,"filter":"statuscode:200"}, timeout=20); r.raise_for_status()
        for row in r.json()[1:]:
            ts, orig, digest = row[1], row[2], row[5]
            url=f"https://web.archive.org/web/{ts}/{orig}"; ts_iso=f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:{ts[12:14]}Z"
            yield {"source":"wayback","seed":seed_obj,"url":url,"ts":ts_iso,"coc_sha256":coc_sha256(f"{url}|{digest}")}
    except Exception as e: print(f"Wayback Fout: {e}")
'''))

# --- EXPORTS ---
(root / "export/csv_export.py").write_text(textwrap.dedent('''
import csv, json
def write_csv(findings, path):
    if not findings: return
    # Flatten enrichment data for CSV
    flat_findings = []
    for f in findings:
        ff = dict(f); enrich = ff.pop('enrichment', {}); ff.update(enrich)
        ff['seed'] = ff.get('seed',{}).get('seed') # Un-nest seed
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
        objs.append({"type":"indicator","spec_version":"2.1","id":_id("indicator"), "pattern_type":"stix",
                     "pattern":f"[url:value = '{url}']", "name": f"OSINT Finding: {url}",
                     "created":datetime.datetime.utcnow().isoformat()+"Z",
                     "valid_from":(f.get('ts') or datetime.datetime.utcnow().isoformat()+'Z')})
    with open(path,"w") as fo: json.dump({"type":"bundle","id":_id("bundle"),"objects":objs}, fo, indent=2)
'''))

# --- RAPPORTAGE ---
(root / "report/make_report.py").write_text(textwrap.dedent('''
import json; from pathlib import Path; from docx import Document
def build_report(findings):
    out_path = Path("out/NGBSE-ALPHA_Report.docx"); doc = Document()
    doc.add_heading("NGBSE-ALPHA: Apex Engine Report", 0)
    doc.add_paragraph(f"Totaal bevindingen: {len(findings)}")
    table = doc.add_table(rows=1, cols=4); table.style = 'Table Grid'
    hdr=table.rows[0].cells; hdr[0].text="E_AI* Score"; hdr[1].text="Info (M,C,Q)"; hdr[2].text="URL / Waar"; hdr[3].text="CoC Hash"
    for f in findings[:50]:
        row=table.add_row().cells; row[0].text=f"{f.get('score',0):.4f}"
        enrich=f.get('enrichment',{}); row[1].text=f"M={enrich.get('M')} C={enrich.get('C')} Q={enrich.get('Q')}"
        row[2].text=str(f.get('url', f.get('where',''))[:80])
        row[3].text=str(f.get('coc_sha256', '')[:16])
    for n,t in [('probability.json','Bayesian Scenario Probability'),('reverse_llm.json','Reverse LLM Hypotheses')]:
        if (p := Path('out')/n).exists(): doc.add_heading(t,1); doc.add_paragraph(p.read_text(encoding='utf-8')[:2000])
    doc.save(out_path)
    return out_path
'''))

# --- RUN SCRIPT ---
(root / "run.sh").write_text(textwrap.dedent('''
#!/bin/bash
set -e
echo ">>> NGBSE-ALPHA: De Apex Engine starten..."
if [ ! -f .env ]; then cp .env.example .env; echo "BELANGRIJK: Vul API-sleutels in .env voor de beste resultaten."; fi
pip install -q -r requirements.txt
python -m engine.orchestrator "$@"
'''))
os.chmod(root / "run.sh", 0o755)
(root / "README.md").write_text("# NGBSE-ALPHA\nDe complete, operationele Apex Engine.\n\n1. `cp .env.example .env` (en vul sleutels in)\n2. `./run.sh` (gebruik `--clearnet` voor een run zonder API-sleutels)\n3. Analyseer de `.docx` en `.json` bestanden in `out/`.")

print("\\n>>> SETUP VOLTOOID. NGBSE-ALPHA is gebouwd. <<<")
print(f"1. Navigeer naar de map: cd {root}")
print("2. (Optioneel) Vul uw API-sleutels in '.env'.")
print("3. Voer een volledige run uit met: ./run.sh")
print("4. Of voer een pure clearnet-run uit met: ./run.sh --clearnet")