# setup_babyphoenix.py
import os
import shutil
import textwrap
from pathlib import Path

print(">>> Bouwen van BabyPhoenix: De Pure, Online Intelligence Engine <<<")
root = Path("./BabyPhoenix")
if root.exists(): shutil.rmtree(root)
print(f"Projectstructuur wordt aangemaakt in: {root.resolve()}")
for d in ["engine", "collectors", "report", "config", "data", "out", "enrich", "export", "cache"]:
    (root / d).mkdir(parents=True, exist_ok=True)
for subdir in ["engine", "collectors", "report", "enrich", "export"]:
    (root / subdir / "__init__.py").touch()

# --- CONFIGURATIE ---
(root / "config/ngbse.config.yml").write_text(textwrap.dedent('''
# BabyPhoenix Configuratie
orchestrator:
  inter_collector_sleep_seconds: 0.2
  clearnet_only_mode: false # True forceert een run zonder API sleutels
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
validation:
  enabled: true
  allowlist_file: "config/validation.allowlist.txt"
exports: { csv: true, stix21: true }
'''))
(root / "data/seeds.jsonl").write_text(textwrap.dedent('''
{"seed": "blob.core.windows.net?sv=", "where": "urlscan", "why": "Azure SAS token sporen"}
{"seed": "token.actions.githubusercontent.com aud", "where": "github", "why": "OIDC trust policies"}
{"seed": "port:1883 MQTT country:NL", "where": "shodan", "why": "Open MQTT brokers in NL"}
{"seed": "services.software.vendor:\\"Citrix\\" AND country:NL", "where": "censys", "why": "Citrix ADC/NetScaler aanwezigheid"}
'''))
(root / ".env.example").write_text("# Vul uw API-sleutels in en hernoem naar .env\nURLSCAN_API_KEY=\nGITHUB_TOKEN=\nSHODAN_API_KEY=\nCENSYS_API_ID=\nCENSYS_API_SECRET=\nLEAKIX_API_KEY=\n")
(root / "requirements.txt").write_text("requests\nPyYAML\npython-docx\npython-dotenv\nbeautifulsoup4\n")
(root / "config/validation.allowlist.txt").write_text("# VOEG HIER DE DOMEINEN TOE WAAROP U GEAUTORISEERD BENT VALIDATIE UIT TE VOEREN\n# example.com\n")

# --- KERN ENGINE (VOLLEDIG) ---
(root / "engine/orchestrator.py").write_text(textwrap.dedent('''
import yaml, json, time, argparse
from pathlib import Path
from dotenv import load_dotenv

from engine.registry import load_collectors
from engine.fuzzy_dedupe import dedupe
from engine.validation import validate_findings
from enrich.enrichment import run_enrichment
from engine.scoring import run_scoring
from engine.predictive_synthesis import generate_synthesis
from report.make_report import build_report
from export.csv_export import write_csv
from export.stix21 import write_stix_bundle
from engine.logger import get_logger

def main():
    parser = argparse.ArgumentParser(description="BabyPhoenix Engine")
    parser.add_argument("--validate", action="store_true", help="Forceer live validatie.")
    parser.add_argument("--no-validate", action="store_true", help="Forceer uitschakelen van live validatie.")
    parser.add_argument("--clearnet", action="store_true", help="Forceer een pure clearnet run zonder API-sleutels.")
    args = parser.parse_args()
    
    cfg = yaml.safe_load(Path("config/ngbse.config.yml").read_text())
    log = get_logger("BabyPhoenix", "out/run.log.jsonl")
    load_dotenv()
    
    if args.validate: cfg['validation']['enabled'] = True
    if args.no_validate: cfg['validation']['enabled'] = False
    if args.clearnet: cfg['orchestrator']['clearnet_only_mode'] = True
    
    log.info("ONLINE MODUS: Starten van dataverzameling...")
    collectors = load_collectors(cfg, log)
    seeds = [json.loads(line) for line in Path("data/seeds.jsonl").read_text().splitlines()]
    raw_findings = []
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
        validated_findings = validate_findings(unique_findings, allowlist, log)
    else:
        validated_findings = unique_findings
        
    log.info("Verrijken met strategische factoren (M, C, Q)...")
    enriched_findings = run_enrichment(validated_findings, cfg)

    log.info("Toepassen van strategische E_AI* scoring...")
    scored_findings = run_scoring(enriched_findings, cfg)
    
    log.info("Genereren van voorspellende synthese...")
    synthesis = generate_synthesis(scored_findings, cfg, log)

    out_dir = Path("out"); out_dir.mkdir(exist_ok=True)
    (out_dir / "findings.jsonl").write_text("\\n".join(json.dumps(f) for f in scored_findings))
    (out_dir / "synthesis_report.json").write_text(json.dumps(synthesis, indent=2, ensure_ascii=False))
        
    if cfg.get("exports", {}).get("csv"): write_csv(scored_findings, str(out_dir / "findings.csv"))
    if cfg.get("exports", {}).get("stix21"): write_stix_bundle(scored_findings, str(out_dir / "findings.stix.json"))
        
    report_path = build_report(scored_findings, synthesis)
    log.info(f"BabyPhoenix Run Voltooid. Rapport: {report_path}")
    print(f"\\n>>> BabyPhoenix Run Voltooid. Rapport: {report_path} <<<")

if __name__ == "__main__": main()
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
    if not allowlist:
        log.warning("Validatie ingeschakeld, maar allowlist is leeg. Geen validatie uitgevoerd.")
        return findings
    for f in findings:
        url = f.get("url")
        if not url:
            out.append({**f, "validated": False})
            continue
        host = urlparse(url if re.match(r"^https?://", url) else "https://" + url).hostname or ""
        if not _allowed(host, allowlist):
            out.append({**f, "validated": False})
            continue
        try:
            r = requests.head(url, timeout=7, allow_redirects=True, headers={"User-Agent":"BabyPhoenix"})
            ok = 200 <= r.status_code < 400
            if ok: validated_count += 1
            out.append({**f, "validated": ok, "status_code": r.status_code})
        except requests.RequestException as e:
            log.warning(f"Validatie mislukt voor {url}", {"error": str(e)})
            out.append({**f, "validated": False, "status_code": None})
    log.info(f"{validated_count} van de {len(findings)} relevante bevindingen succesvol gevalideerd.")
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
(root / "engine/predictive_synthesis.py").write_text(textwrap.dedent('''
from collections import defaultdict
import math
import json
# In een echte implementatie zou hier de LLM interface worden geimporteerd
# from engine.llm_interface import query_llm

def generate_synthesis(findings, config, log):
    synthesis_cfg = config.get("predictive_synthesis", {})
    if not synthesis_cfg.get("enabled", False): return {}
        
    themes_def = synthesis_cfg.get("themes", {})
    for f in findings:
        f_themes = set()
        text_to_scan = f['seed']['seed'].lower() + " " + (f.get('url') or '').lower()
        for theme, definition in themes_def.items():
            if any(kw in text_to_scan for kw in definition.get("keywords", [])): f_themes.add(theme)
        f['themes'] = list(f_themes)
        
    scenarios = defaultdict(lambda: {"findings": []})
    for f in findings:
        for theme in f.get('themes', []): scenarios[theme]["findings"].append(f)
            
    prior = synthesis_cfg.get("prior_probability", 0.1); prior_odds = prior / (1 - prior)
    output = {}
    
    for theme, data in scenarios.items():
        items = data["findings"]
        if not items: continue
        
        avg_score = sum(f.get('score', 0.0) for f in items) / len(items)
        likelihood_ratio = 1 + 9 * (max(0, avg_score - 0.5) / 0.5)
        posterior_odds = prior_odds * likelihood_ratio; probability = posterior_odds / (1 + posterior_odds)
        
        C = items[0].get('enrichment', {}).get('C', 0)
        Q_avg = sum(f.get('enrichment', {}).get('Q', 0) for f in items) / len(items)
        
        # Omdat we geen echte LLM call kunnen maken, genereren we een template-gebaseerde samenvatting
        summary_text = (
            f"Significant bewijs ({len(items)} indicatoren) gevonden voor '{theme}', "
            f"gecorroboreerd door {C} bronnen. Gemiddelde E_AI* score van {avg_score:.4f} duidt op een verhoogd risico. "
            f"De impact is primair gerelateerd aan {themes_def.get(theme, {}).get('future_scenario')}."
        )
        
        output[theme] = {
            "future_scenario": themes_def.get(theme, {}).get("future_scenario", "Onbekend"),
            "probability_90_days": f"{probability:.1%}", "semantic_summary": summary_text,
            "avg_eai_score": avg_score, "evidence_count": len(items)
        }
    return dict(sorted(output.items(), key=lambda item: float(item[1]['probability_90_days'][:-1]), reverse=True))
'''))

# --- VERRIJKING & EXPORTS & RAPPORTAGE (VOLLEDIG) ---
(root / "enrich/enrichment.py").write_text("from collections import defaultdict\ndef run_enrichment(f,c): by_seed=defaultdict(list); [by_seed[i['seed']['seed']].append(i) for i in f]; q=c.get('scoring',{}).get('quality_weights',{}); \n    for s, items in by_seed.items(): \n        live={i['source'] for i in items if i['source']!='wayback'}; C=len(live); has_w='wayback' in {i['source'] for i in items}; M=1.0 if has_w and not live else 0.6 if has_w else 0.2; \n        for i in items: i['enrichment']={'M':M,'C':C,'Q':q.get(i['source'],0.4)}\n    return f")
(root / "export/csv_export.py").write_text("import csv, json\ndef write_csv(f, p): \n    if not f: return\n    ff=[{**i,'seed':i.get('seed',{}).get('seed'),**(i.pop('enrichment',{})),**(i.pop('themes',[]))} for i in f]\n    k=sorted(list(ff[0].keys()));\n    with open(p,'w',newline='',encoding='utf-8') as h: w=csv.DictWriter(h,k,extrasaction='ignore'); w.writeheader(); w.writerows(ff)")
(root / "export/stix21.py").write_text("import json,uuid,datetime\ndef _id(t): return f'{t}--{uuid.uuid4()}'\ndef write_stix_bundle(f, p):\n    o=[{'type':'indicator','spec_version':'2.1','id':_id('indicator'),'pattern_type':'stix','pattern':f'[url:value = \\'{u}\\']','name':f'OSINT: {u}','created':(n:=datetime.datetime.utcnow().isoformat()+'Z'),'valid_from':(i.get('ts') or n)} for i in f[:200] if (u:=i.get('url'))]\n    with open(p,'w') as h: json.dump({'type':'bundle','id':_id('bundle'),'objects':o},h,indent=2)")
(root / "report/make_report.py").write_text("import json; from pathlib import Path; from docx import Document\ndef build_report(findings, synthesis):\n    out=Path('out/BabyPhoenix_Report.docx'); d=Document(); d.add_heading('BabyPhoenix: Executive Briefing',0); d.add_heading('Voorspellende Risicoscenario\\'s',1)\n    if not synthesis: d.add_paragraph('Geen scenario\\'s gedetecteerd.')\n    for t, data in synthesis.items(): d.add_paragraph(data['future_scenario'],style='Heading 2'); p=d.add_paragraph(); p.add_run('Waarschijnlijkheid: ').bold=True; p.add_run(f'{data[\"probability_90_days\"]}\\n'); p.add_run('Samenvatting: ').bold=True; p.add_run(data['semantic_summary'])\n    d.add_heading('Gedetailleerd Bewijs (Top 20)',1); t=d.add_table(1,4); t.style='Table Grid'; h=t.rows[0].cells; h[0].text='E_AI*';h[1].text='Info';h[2].text='URL/Bewijs';h[3].text='CoC Hash'\n    for f in findings[:20]: r=t.add_row().cells; r[0].text=f'{f.get(\"score\",0):.4f}'; e=f.get('enrichment',{}); r[1].text=f'M={e.get(\"M\")} C={e.get(\"C\")} Q={e.get(\"Q\")}'; r[2].text=str(f.get('url',''))[:60]; r[3].text=str(f.get('coc_sha256',''))[:12]\n    d.save(out); return out")

# --- OPERATIONELE COLLECTORS (VOLLEDIG) ---
(root / "collectors/util.py").write_text("import hashlib\ndef coc_sha256(m:str)->str: return hashlib.sha256(m.encode('utf-8','ignore')).hexdigest()")
(root / "collectors/urlscan_collector.py").write_text("import os, requests, time; from .util import coc_sha256\ndef collect(s, c, l): q=s.get('seed'); k=os.getenv('URLSCAN_API_KEY') if not c.get('orchestrator',{}).get('clearnet_only_mode') else None; \n    if not k: l.warning('Urlscan collector overgeslagen: API-sleutel vereist.'); return\n    r, b = 3, 2\n    for i in range(r):\n        try: req=requests.get('https://urlscan.io/api/v1/search/',params={'q':q,'size':50},headers={'API-Key':k},timeout=20); req.raise_for_status(); \n        except requests.RequestException as e: l.warning(f'Urlscan Fout (poging {i+1}/{r})',{'error':str(e)}); time.sleep(b**i); continue\n        for item in req.json().get('results',[]): yield {'source':'urlscan','seed':s,'url':(u:=item.get('page',{}).get('url')),'ts':(ts:=item.get('indexedAt')),'coc_sha256':coc_sha256(f'{(rid:=item.get(\"_id\"))}|{u}|{ts}')}\n        return")
(root / "collectors/github_collector.py").write_text("import os, requests; from .util import coc_sha256; from bs4 import BeautifulSoup; from urllib.parse import quote_plus\ndef collect(s, c, l):\n    q=s.get('seed'); t=os.getenv('GITHUB_TOKEN') if not c.get('orchestrator',{}).get('clearnet_only_mode') else None\n    if t:\n        try: r=requests.get('https://api.github.com/search/code',params={'q':q,'per_page':50},headers={'Authorization':f'Bearer {t}'},timeout=20); r.raise_for_status();\n        except Exception as e: l.error('GitHub API Fout',{'error':str(e)}); return\n        for i in r.json().get('items',[]): yield {'source':'github','seed':s,'url':(u:=i.get('html_url')),'ts':(repo:=i.get('repository',{})).get('updated_at'),'coc_sha256':coc_sha256(f'{u}|{repo.get(\"full_name\")}')}\n    else:\n        l.warning('GitHub draait in clearnet-scrape-modus.')\n        try: r=requests.get(f'https://github.com/search?type=code&q={quote_plus(q)}',timeout=20); r.raise_for_status(); soup=BeautifulSoup(r.text,'html.parser');\n        except Exception as e: l.error('GitHub Scrape Fout',{'error':str(e)}); return\n        for a in soup.select('div.search-title a'): yield {'source':'github','seed':s,'url':(u:='https://github.com'+a['href']),'ts':None,'coc_sha256':coc_sha256(u)}")
(root / "collectors/shodan_collector.py").write_text("import os, requests; from .util import coc_sha256\ndef collect(s, c, l): q=s.get('seed'); k=os.getenv('SHODAN_API_KEY');\n    if not k or c.get('orchestrator',{}).get('clearnet_only_mode'): l.warning('Shodan collector: API-sleutel vereist.'); return\n    try: r=requests.get('https://api.shodan.io/shodan/host/search', p={'key':k,'query':q},timeout=20); r.raise_for_status()\n    except Exception as e: l.error('Shodan Fout',{'error':str(e)}); return\n    for i in r.json().get('matches',[]): ip=i.get('ip_str'); ts=i.get('timestamp'); yield {'source':'shodan','seed':s,'where':ip,'url':f'https://www.shodan.io/host/{ip}','ts':ts,'coc_sha256':coc_sha256(f'{ip}|{ts}')}")
(root / "collectors/censys_collector.py").write_text("import os, requests; from .util import coc_sha256\ndef collect(s, c, l): q=s.get('seed'); i,p=os.getenv('CENSYS_API_ID'),os.getenv('CENSYS_API_SECRET');\n    if not (i and p) or c.get('orchestrator',{}).get('clearnet_only_mode'): l.warning('Censys collector: API ID/Secret vereist.'); return\n    try: r=requests.post('https://search.censys.io/api/v2/hosts/search',auth=(i,p),json={'q':q,'per_page':50},timeout=20); r.raise_for_status()\n    except Exception as e: l.error('Censys Fout',{'error':str(e)}); return\n    for h in r.json().get('result',{}).get('hits',[]): ip=h.get('ip'); ts=h.get('last_updated_at'); yield {'source':'censys','seed':s,'where':ip,'url':f'https://search.censys.io/hosts/{ip}','ts':ts,'coc_sha256':coc_sha256(f'{ip}|{ts}')}")
(root / "collectors/leakix_collector.py").write_text("import os, requests; from .util import coc_sha256\ndef collect(s, c, l): q=s.get('seed'); k=os.getenv('LEAKIX_API_KEY');\n    if not k or c.get('orchestrator',{}).get('clearnet_only_mode'): l.warning('LeakIX collector: API-sleutel vereist.'); return\n    try: r=requests.get('https://leakix.net/search', p={'q':q,'size':50},h={'Api-Key':k} if k else {},timeout=20); r.raise_for_status()\n    except Exception as e: l.error('LeakIX Fout',{'error':str(e)}); return\n    for i in r.json(): u=i.get('link'); ts=i.get('time'); yield {'source':'leakix','seed':s,'url':u,'where':i.get('ip'),'ts':ts,'coc_sha256':coc_sha256(f'{u}|{ts}')}")
(root / "collectors/wayback_collector.py").write_text("import requests; from .util import coc_sha256\ndef collect(s, c, l):\n    q = s.get('seed');\n    try: r=requests.get('http://web.archive.org/cdx/search/cdx',params={'url':f'*{q}*','output':'json','limit':100},timeout=20); r.raise_for_status()\n    except Exception as e: l.error('Wayback Fout',{'error':str(e)}); return\n    for _,ts,o,_,_,d,_ in r.json()[1:]: u=f'https://web.archive.org/web/{ts}/{o}'; t_iso=f'{ts[:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:{ts[12:14]}Z'; yield {'source':'wayback','seed':s,'url':u,'ts':t_iso,'coc_sha256':coc_sha256(f'{u}|{d}')}")

# --- RUN SCRIPT ---
(root / "run.sh").write_text(textwrap.dedent('''
#!/bin/bash
set -e
echo ">>> BabyPhoenix: De Pure Online Intelligence Engine starten..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "BELANGRIJK: Vul API-sleutels in .env voor de beste resultaten."
fi
pip install -q -r requirements.txt
python -m engine.orchestrator "$@"
'''))
os.chmod(root / "run.sh", 0o755)
(root / "README.md").write_text(textwrap.dedent('''
# BabyPhoenix: Pure Online Intelligence Engine
Dit is een complete, operationele OSINT-engine gericht op een pure online workflow.

## Eerste Keer Setup
`./run.sh`

## Gebruik
- **Online run (aanbevolen):** `./run.sh`
- **Clearnet run (beperkt):** `./run.sh --clearnet`
- **Validatie forceren:** Voeg `--validate` toe (vereist een correcte `allowlist`).
'''))

print("\\n>>> SETUP VOLTOOID. BabyPhoenix is gebouwd. <<<")
print(f"1. Navigeer naar de map: cd {root}")
print("2. (Optioneel) Vul uw API-sleutels in '.env'.")
print("3. Start de engine met: ./run.sh")