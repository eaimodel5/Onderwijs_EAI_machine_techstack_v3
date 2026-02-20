# setup_ngbse6_apex.py
import os
import shutil
import textwrap
from pathlib import Path

print(">>> Bouwen van NGBSE 6.0: Apex Engine (Operationeel) <<<")
root = Path("./NGBSE-6.0-APEX")
if root.exists(): shutil.rmtree(root)
print(f"Projectstructuur wordt aangemaakt in: {root.resolve()}")
for d in ["engine", "collectors", "report", "config", "data", "out", "enrich", "export", "cache"]:
    (root / d).mkdir(parents=True, exist_ok=True)
for subdir in ["engine", "collectors", "report", "enrich", "export"]:
    (root / subdir / "__init__.py").touch()

# --- CONFIGURATIE ---
(root / "config/ngbse.config.yml").write_text(textwrap.dedent('''
collectors:
  enabled: ["censys", "leakix", "shodan", "wayback", "urlscan", "github"]
orchestrator:
  inter_collector_sleep_seconds: 0.2
  max_pages_per_collector: 2
  use_cache: true
  cache_dir: "cache"
  cache_ttl_seconds: 3600
scoring:
  quality_weights:
    shodan: 1.0; censys: 1.0; leakix: 0.9; github: 0.8; urlscan: 0.7; wayback: 0.5; default: 0.4
  eai_weights: { w1: 0.3, w2: 0.3, w3: 0.2, w4: 0.15, w5: 0.05 }
  eai_defaults: { W_V: 0.7, D_A: 0.7, D_B: 0.7, T: 0.7, A: 0.7 }
validation:
  enabled: false # Standaard uit, kan aangezet worden via CLI of in deze file
  allowlist_file: "config/validation.allowlist.txt"
probability_layer:
  enabled: true
  prior_probability: 0.2
  likelihood_strength: 2.0
reverse_llm:
  enabled: true
exports:
  csv: true
  stix21: true
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
(root / "requirements.txt").write_text("requests\nPyYAML\npython-docx\npython-dotenv\n")
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
    parser = argparse.ArgumentParser(description="NGBSE 6.0: Apex Engine")
    parser.add_argument("--validate", action="store_true", help="Override config and enable live validation.")
    args = parser.parse_args()
    
    cfg = yaml.safe_load(Path("config/ngbse.config.yml").read_text())
    load_dotenv()
    if args.validate: cfg['validation']['enabled'] = True
    
    print("[1/6] Verzamelen van data (incl. CoC Hashing)...")
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
    
    print(f"[2/6] Ontdubbelen van {len(raw_findings)} ruwe bevindingen...")
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
    findings_path = out_dir / "findings.jsonl"
    findings_path.write_text("\\n".join(json.dumps(f) for f in scored_findings))
    
    if cfg.get("probability_layer", {}).get("enabled"):
        prob = eval_probability(scored_findings, cfg); (out_dir / "probability.json").write_text(json.dumps(prob, indent=2))
    if cfg.get("reverse_llm", {}).get("enabled"):
        rllm = reverse_llm_run(scored_findings, cfg); (out_dir / "reverse_llm.json").write_text(json.dumps(rllm, indent=2))
    if cfg.get("exports", {}).get("csv"): write_csv(scored_findings, str(out_dir / "findings.csv"))
    if cfg.get("exports", {}).get("stix21"): write_stix_bundle(scored_findings, str(out_dir / "findings.stix.json"))
        
    report_path = build_report(scored_findings)
    print(f"\\n>>> NGBSE 6.0 Run Voltooid. Apex Rapport opgeslagen in: {report_path} <<<")

if __name__ == "__main__": main()
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
            r = requests.head(url, timeout=7, allow_redirects=True, headers={"User-Agent":"NGBSE/6.0"})
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
# ... Andere engine/enrich/export modules ...
(root / "engine/registry.py").write_text("import importlib\ndef load_collectors(c): return {n: importlib.import_module(f'collectors.{n}_collector') for n in c.get('collectors',{}).get('enabled',[])}")
(root / "engine/fuzzy_dedupe.py").write_text("import re, hashlib; from urllib.parse import urlparse\ndef normalize_url(u): p=urlparse((u or '').lower()); h=p.hostname or ''; return f'{h[4:] if h.startswith(\"www.\") else h}{p.path or \"/\"}'\ndef soft_hash(f): return hashlib.sha256(f'{f[\"seed\"].get(\"seed\")}|{f[\"source\"]}|{normalize_url(f.get(\"url\"))}'.encode()).hexdigest()\ndef dedupe(findings): seen=set(); return [f for f in findings if (h:=soft_hash(f)) not in seen and not seen.add(h)]")
(root / "enrich/enrichment.py").write_text("from collections import defaultdict\ndef run_enrichment(f,c): by_seed=defaultdict(list); [by_seed[i['seed']['seed']].append(i) for i in f]; q=c.get('scoring',{}).get('quality_weights',{}); [ [ (item.update({'enrichment':{'M':1.0 if 'wayback' in {x['source'] for x in items} and not {x['source'] for x in items if x['source']!='wayback'} else 0.6 if 'wayback' in {x['source'] for x in items} else 0.2, 'C':len({x['source'] for x in items if x['source']!='wayback'}), 'Q':q.get(item['source'],0.4)}})) for item in items] for _,items in by_seed.items()]; return f")
(root / "enrich/cluster.py").write_text("from urllib.parse import urlparse; from collections import defaultdict\ndef cluster_by_domain(f): c=defaultdict(list); [c[(urlparse(i.get('url') or '').hostname or '')].append({'s':i['source'],'sc':i['score']}) for i in f if (urlparse(i.get('url') or '').hostname)]; return dict(sorted(c.items(),key=lambda i:len(i[1]),reverse=True))")
(root / "enrich/timeline.py").write_text("from collections import defaultdict\ndef timeline_by_day(f): b=defaultdict(int); [b[str(i.get('ts'))[:10]]+_ for i in f if i.get('ts')]; return dict(sorted(b.items()))")
(root / "export/csv_export.py").write_text("import csv\ndef write_csv(f, p): \n    if not f: return\n    k=sorted(list(f[0].keys()))\n    with open(p,'w',newline='',encoding='utf-8') as h: w=csv.DictWriter(h,k); w.writeheader(); w.writerows(f)")
(root / "export/stix21.py").write_text("import json,uuid,datetime\ndef _id(t): return f'{t}--{uuid.uuid4()}'\ndef write_stix_bundle(f, p):\n    o=[{'type':'indicator','spec_version':'2.1','id':_id('indicator'),'pattern_type':'stix','pattern':f'[url:value = \\'{u}\\']','name':f'OSINT: {u}','created':datetime.datetime.utcnow().isoformat()+'Z','valid_from':(i.get('ts') or datetime.datetime.utcnow().isoformat()+'Z')} for i in f[:200] if (u:=i.get('url'))]\n    with open(p,'w') as h: json.dump({'type':'bundle','id':_id('bundle'),'objects':o},h,indent=2)")
(root / "report/make_report.py").write_text("import json; from pathlib import Path; from docx import Document\ndef build_report(f):\n    p=Path('out/NGBSE-6.0_Apex_Report.docx'); d=Document(); d.add_heading('NGBSE 6.0: Apex Report',0); d.add_paragraph(f'Totaal bevindingen: {len(f)}'); t=d.add_table(1,4); h=t.rows[0].cells; h[0].text='E_AI*'; h[1].text='Info'; h[2].text='URL'; h[3].text='CoC Hash'\n    for i in f[:30]: r=t.add_row().cells; r[0].text=f'{i.get(\"score\",0):.4f}'; e=i.get('enrichment',{}); r[1].text=f'M={e.get(\"M\")} C={e.get(\"C\")} Q={e.get(\"Q\")}'; r[2].text=str(i.get('url',''))[:80]; r[3].text=str(i.get('coc_sha256',''))[:16]\n    for n,t in [('probability.json','Scenario Probability'),('reverse_llm.json','Blindspot Hypotheses')]: \n        if (ph:=Path('out')/n).exists(): d.add_heading(t,1); d.add_paragraph(ph.read_text()[:1000])\n    d.save(p); return p")
(root / "README.md").write_text("# NGBSE 6.0: Apex Engine\nDe operationele fusie van tactische en strategische OSINT-analyse.\n\n1. `cp .env.example .env` (en vul sleutels in)\n2. `./run.sh`\n3. Analyseer de `.docx` en `.json` bestanden in `out/`.")
(root / "run.sh").write_text("#!/bin/bash\nset -e\necho '>>> NGBSE 6.0: Apex Engine starten...'\nif [ ! -f .env ]; then cp .env.example .env; echo 'BELANGRIJK: Vul API-sleutels in .env'; fi\npip install -q -r requirements.txt\npython -m engine.orchestrator \"$@\"\n")
os.chmod(root / "run.sh", 0o755)

# --- OPERATIONELE COLLECTORS ---
(root / "collectors/util.py").write_text("import hashlib\ndef coc_sha256(material: str) -> str: return hashlib.sha256(material.encode('utf-8', 'ignore')).hexdigest()")
(root / "collectors/urlscan_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); api_key=os.getenv("URLSCAN_API_KEY"); h={"API-Key":api_key} if api_key else {}
    try:
        r=requests.get("https://urlscan.io/api/v1/search/", params={"q":q,"size":50}, headers=h, timeout=20)
        r.raise_for_status()
        for i in r.json().get("results",[]):
            url=i.get("page",{}).get("url"); ts=i.get("indexedAt"); rid=i.get("_id")
            yield {"source":"urlscan","seed":seed_obj,"url":url,"ts":ts,"coc_sha256":coc_sha256(f"{rid}|{url}|{ts}")}
    except Exception as e: print(f"URLScan Fout: {e}")
'''))
(root / "collectors/github_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); token=os.getenv("GITHUB_TOKEN"); h={"Accept":"application/vnd.github+json"}
    if token: h["Authorization"]=f"Bearer {token}"
    try:
        r=requests.get("https://api.github.com/search/code", params={"q":q,"per_page":50}, headers=h, timeout=20)
        r.raise_for_status()
        for i in r.json().get("items",[]):
            url=i.get("html_url"); repo=i.get("repository",{}).get("full_name"); path=i.get("path")
            yield {"source":"github","seed":seed_obj,"url":url,"where":f"{repo}/{path}","ts":i.get("repository",{}).get("updated_at"),"coc_sha256":coc_sha256(f"{url}|{repo}")}
    except Exception as e: print(f"GitHub Fout: {e}")
'''))
(root / "collectors/shodan_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); key=os.getenv("SHODAN_API_KEY")
    if not key: return
    try:
        r=requests.get("https://api.shodan.io/shodan/host/search", params={"key":key,"query":q}, timeout=20)
        r.raise_for_status()
        for i in r.json().get("matches",[]):
            ip=i.get("ip_str"); ts=i.get("timestamp")
            yield {"source":"shodan","seed":seed_obj,"where":ip,"url":f"https://www.shodan.io/host/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")}
    except Exception as e: print(f"Shodan Fout: {e}")
'''))
(root / "collectors/censys_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); api_id=os.getenv("CENSYS_API_ID"); api_secret=os.getenv("CENSYS_API_SECRET")
    if not (api_id and api_secret): return
    auth=(api_id, api_secret)
    try:
        r=requests.post("https://search.censys.io/api/v2/hosts/search", auth=auth, json={"q":q,"per_page":50}, timeout=20)
        r.raise_for_status()
        for i in r.json().get("result",{}).get("hits",[]):
            ip=i.get("ip"); ts=i.get("last_updated_at")
            yield {"source":"censys","seed":seed_obj,"where":ip,"url":f"https://search.censys.io/hosts/{ip}","ts":ts,"coc_sha256":coc_sha256(f"{ip}|{ts}")}
    except Exception as e: print(f"Censys Fout: {e}")
'''))
(root / "collectors/leakix_collector.py").write_text(textwrap.dedent('''
import os, requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed"); key=os.getenv("LEAKIX_API_KEY"); h={"Api-Key":key} if key else {}
    try:
        r=requests.get("https://leakix.net/search", params={"q":q,"size":50}, headers=h, timeout=20)
        r.raise_for_status()
        for i in r.json():
            url=i.get("link") or i.get("url"); ts=i.get("time")
            yield {"source":"leakix","seed":seed_obj,"url":url,"where":i.get("ip"),"ts":ts,"coc_sha256":coc_sha256(f"{url}|{ts}")}
    except Exception as e: print(f"LeakIX Fout: {e}")
'''))
(root / "collectors/wayback_collector.py").write_text(textwrap.dedent('''
import requests; from .util import coc_sha256
def collect(seed_obj, cfg):
    q=seed_obj.get("seed")
    try:
        r=requests.get("http://web.archive.org/cdx/search/cdx", params={"url":f"*{q}*","output":"json","limit":50,"filter":"statuscode:200"}, timeout=20)
        r.raise_for_status()
        for row in r.json()[1:]:
            ts, orig, digest = row[1], row[2], row[5]
            url=f"https://web.archive.org/web/{ts}/{orig}"
            ts_iso=f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:{ts[12:14]}Z"
            yield {"source":"wayback","seed":seed_obj,"url":url,"ts":ts_iso,"coc_sha256":coc_sha256(f"{url}|{digest}")}
    except Exception as e: print(f"Wayback Fout: {e}")
'''))

print("\\n>>> SETUP VOLTOOID. NGBSE 6.0 'Apex Engine' is operationeel. <<<")
print(f"1. Navigeer naar de map: cd {root}")
print("2. Vul uw API-sleutels in het '.env' bestand.")
print("3. Voer de engine uit met: ./run.sh")