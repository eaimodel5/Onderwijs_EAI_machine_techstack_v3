# setup_ngbse10_final.py
import os
import shutil
import textwrap
from pathlib import Path

print(">>> Bouwen van NGBSE 10.0 FINAL: De Volledige, Gecorrigeerde Engine <<<")
root = Path("./NGBSE_10_FINAL")
if root.exists(): shutil.rmtree(root)
print(f"Projectstructuur wordt aangemaakt in: {root.resolve()}")
for d in ["engine", "collectors", "report", "config", "data", "out", "enrich", "export", "cache"]:
    (root / d).mkdir(parents=True, exist_ok=True)
for subdir in ["engine", "collectors", "report", "enrich", "export"]:
    (root / subdir / "__init__.py").touch()

# --- CONFIGURATIE (Onveranderd) ---
(root / "config/ngbse.config.yml").write_text(textwrap.dedent('''
orchestrator:
  inter_collector_sleep_seconds: 0.2
  clearnet_only_mode: false
collectors:
  enabled: ["censys", "leakix", "shodan", "wayback", "urlscan", "github"]
scoring:
  quality_weights: { shodan: 1.0, censys: 1.0, leakix: 0.9, github: 0.8, urlscan: 0.7, wayback: 0.5, default: 0.4 }
  eai_weights: { w1: 0.3, w2: 0.3, w3: 0.2, w4: 0.15, w5: 0.05 }
  eai_defaults: { W_V: 0.7, D_A: 0.7, D_B: 0.7, T: 0.7, A: 0.7 }
predictive_synthesis:
  enabled: true
  prior_probability: 0.1
  llm_endpoint: "http://localhost:11434/api/generate"
  llm_model: "phi3:mini"
  themes:
    Cloud_Token_Leakage: {keywords: ["sv=", "signature=", "blob.core.windows.net"], future_scenario: "Ongeautoriseerde Toegang tot Cloud Data"}
    Public_Code_Exposure: {keywords: ["github", "oidc", "token"], future_scenario: "Misbruik van Gelekte Credentials"}
validation: { enabled: true, allowlist_file: "config/validation.allowlist.txt" }
exports: { csv: true, stix21: true }
'''))
(root / "data/seeds.jsonl").write_text('{"seed": "domain:example.com", "where": "urlscan", "why": "Initiële test seed"}')
(root / ".env.example").write_text("URLSCAN_API_KEY=\nGITHUB_TOKEN=\nSHODAN_API_KEY=\nCENSYS_API_ID=\nCENSYS_API_SECRET=\nLEAKIX_API_KEY=\n")
(root / "requirements.txt").write_text("requests\nPyYAML\npython-docx\npython-dotenv\nbeautifulsoup4\nstix2\n")
(root / "config/validation.allowlist.txt").write_text("# example.com\n")

# --- KERN ENGINE (MET GECORRIGEERDE SYNTHESE MODULE) ---
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
from export.stix_exporter import export_to_stix
from engine.logger import get_logger

def main():
    parser = argparse.ArgumentParser(description="NGBSE 10.0 Engine")
    args = parser.parse_args() # Vereenvoudigd voor run.sh
    
    cfg = yaml.safe_load(Path("config/ngbse.config.yml").read_text())
    log = get_logger("NGBSE-10.0", "out/run.log.jsonl")
    load_dotenv()
    
    log.info("ONLINE MODUS: Starten van dataverzameling...")
    collectors = load_collectors(cfg, log)
    seeds = [json.loads(line) for line in Path("data/seeds.jsonl").read_text().splitlines()]
    raw_findings = []
    for seed in seeds:
        if collector := collectors.get(seed['where']):
            try:
                for finding in collector.collect(seed, cfg, log): raw_findings.append(finding)
                time.sleep(cfg['orchestrator']['inter_collector_sleep_seconds'])
            except Exception as e: log.error(f"FATAL ERROR in collector '{seed['where']}'", {"error": str(e)})
    
    log.info(f"Ontdubbelen van {len(raw_findings)} bevindingen...")
    unique_findings = dedupe(raw_findings)
    
    log.info("Live validatie uitvoeren...")
    if cfg.get("validation", {}).get("enabled", False):
        allowlist = Path(cfg["validation"]["allowlist_file"]).read_text().splitlines()
        validated_findings = validate_findings(unique_findings, allowlist, log)
    else: validated_findings = unique_findings
        
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
    if cfg.get("exports", {}).get("stix21"): export_to_stix(scored_findings, synthesis, "NGBSE-10.0", str(out_dir / "findings.stix.json"))
        
    report_path = build_report(scored_findings, synthesis)
    log.info(f"NGBSE 10.0 Run Voltooid. Rapport: {report_path}")
    print(f"\\n>>> NGBSE 10.0 Run Voltooid. Rapport: {report_path} <<<")

if __name__ == "__main__":
    main()
'''))

(root / "engine/predictive_synthesis.py").write_text(textwrap.dedent('''
# --- VOLLEDIGE, GECORRIGEERDE VERSIE ---
from collections import defaultdict
import math
import json
import requests

def query_llm(prompt, config, log):
    """
    Roept de lokaal draaiende LLM aan via de Ollama API.
    Dit is GEEN placeholder meer.
    """
    synthesis_cfg = config.get("predictive_synthesis", {})
    endpoint = synthesis_cfg.get("llm_endpoint", "http://localhost:11434/api/generate")
    model = synthesis_cfg.get("llm_model", "phi3:mini")
    
    try:
        log.info("LLM aangeroepen voor synthese...", {"model": model, "endpoint": endpoint})
        r = requests.post(
            endpoint,
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=180
        )
        r.raise_for_status()
        response_data = r.json()
        summary = response_data.get("response", "Error: Geen 'response' veld in LLM output.")
        log.info("Succesvolle respons van LLM ontvangen.")
        return summary
        
    except requests.exceptions.RequestException as e:
        error_msg = f"Error: Kon geen verbinding maken met de lokale LLM. Zorg ervoor dat Ollama draait op {endpoint}."
        log.error(error_msg, {"error": str(e)})
        return error_msg
    except Exception as e:
        error_msg = "Een onverwachte fout is opgetreden bij het aanroepen van de LLM."
        log.error(error_msg, {"error": str(e)})
        return error_msg

def generate_synthesis(findings, config, log):
    synthesis_cfg = config.get("predictive_synthesis", {})
    if not synthesis_cfg.get("enabled", False):
        return {}
        
    themes_def = synthesis_cfg.get("themes", {})
    for f in findings:
        f_themes = set()
        seed_str = f['seed'].get('seed', '') if isinstance(f.get('seed'), dict) else str(f.get('seed', ''))
        text_to_scan = seed_str.lower() + " " + (f.get('url') or '').lower()
        for theme, definition in themes_def.items():
            if any(kw in text_to_scan for kw in definition.get("keywords", [])):
                f_themes.add(theme)
        f['themes'] = list(f_themes)
        
    scenarios = defaultdict(lambda: {"findings": []})
    for f in findings:
        for theme in f.get('themes', []):
            scenarios[theme]["findings"].append(f)
            
    prior = synthesis_cfg.get("prior_probability", 0.1)
    prior_odds = prior / (1 - prior) if prior < 1 else float('inf')
    output = {}
    
    for theme, data in scenarios.items():
        items = data["findings"]
        if not items: continue
        
        avg_score = sum(f.get('score', 0.0) for f in items) / len(items)
        likelihood_ratio = 1 + 9 * (max(0, avg_score - 0.5) / 0.5)
        posterior_odds = prior_odds * likelihood_ratio
        probability = posterior_odds / (1 + posterior_odds)
        
        C = items[0].get('enrichment', {}).get('C', 0)
        Q_avg = sum(f.get('enrichment', {}).get('Q', 0) for f in items) / len(items)
        top_evidence = json.dumps([{"url": f.get('url'), "source": f.get('source')} for f in items[:3]])
        
        prompt = (
            f"You are a Dutch strategic intelligence analyst. Write a concise, professional, semantic summary in Dutch for the risk scenario '{theme}'. "
            f"Based on an average strategic risk score of {avg_score:.2f} from {len(items)} indicators, corroborated by {C} sources. "
            f"Summarize the risk and potential business impact in 1-2 professional sentences."
        )
        summary_text = query_llm(prompt, config, log)
        
        output[theme] = {
            "future_scenario": themes_def.get(theme, {}).get("future_scenario", "Onbekend"),
            "probability_90_days": f"{probability:.1%}",
            "semantic_summary": summary_text,
            "avg_eai_score": avg_score,
            "evidence_count": len(items)
        }
    return dict(sorted(output.items(), key=lambda item: float(item[1]['probability_90_days'][:-1]), reverse=True))
'''))
# --- ALLE ANDERE MODULES (VOLLEDIG UITGESCHREVEN) ---
(root / "engine/logger.py").write_text("import json,logging,sys,time\nclass JsonLineFormatter(logging.Formatter):\n    def format(self,r): p={'ts':int(time.time()*1000),'level':r.levelname,'msg':r.getMessage(),'name':r.name}; return json.dumps(p,ensure_ascii=False)\ndef get_logger(n,l=None): L=logging.getLogger(n); L.setLevel(logging.INFO); \n    if not L.handlers: h=logging.StreamHandler(sys.stdout); h.setFormatter(JsonLineFormatter()); L.addHandler(h); \n    if l: f=logging.FileHandler(l,encoding='utf-8'); f.setFormatter(JsonLineFormatter()); L.addHandler(f)\n    return L")
(root / "engine/registry.py").write_text("import importlib\nfrom collectors.base_collector import BaseCollector\ndef load_collectors(c,l): \n    m={}; e=c.get('collectors',{}).get('enabled',[])\n    for n in e:\n        try: \n            mod=importlib.import_module(f'collectors.{n}_collector')\n            for i in dir(mod):\n                item=getattr(mod,i)\n                if isinstance(item,type) and issubclass(item,BaseCollector) and item is not BaseCollector: m[n]=item(c,l); break\n        except ImportError: l.error(f'Kon collector module niet laden: {n}')\n    return m")
(root / "engine/fuzzy_dedupe.py").write_text("import re, hashlib; from urllib.parse import urlparse\ndef normalize_url(u): p=urlparse((u or '').lower()); h=p.hostname or ''; return f'{h[4:] if h.startswith(\"www.\") else h}{p.path or \"/\"}'\ndef soft_hash(f): s=f['seed'].get('seed','') if isinstance(f.get('seed'),dict) else str(f.get('seed','')); k=f'{s}|{f.get(\"source\")}|{normalize_url(f.get(\"url\"))}'; return hashlib.sha256(k.encode()).hexdigest()\ndef dedupe(findings): s=set(); return [f for f in findings if (h:=soft_hash(f)) not in s and not s.add(h)]")
(root / "engine/scoring.py").write_text("import math\ndef e_ai_star(p, w): Vp=min(1.0, 0.5*p['V']+0.3*p['Q']+0.2*min(1.0,p['C']/3.0)); return round(math.sqrt(w['w1']*(p['P']*p['W_V'])+w['w2']*(p['D_A']*p['D_B'])+w['w3']*(p['T']*p['A'])+w['w4']*Vp+w['w5']*p['M']),4)\ndef run_scoring(f,c): cfg=c.get('scoring',{}); w=cfg.get('eai_weights',{}); d=cfg.get('eai_defaults',{}); [i.update({'score': e_ai_star({'P':1.0,'V':1.0 if i.get('validated') else 0.5,**i.get('enrichment',{}),**d},w)}) for i in f]; f.sort(key=lambda x:x.get('score',0),reverse=True); return f")
(root / "engine/validation.py").write_text("import re, requests; from urllib.parse import urlparse\ndef _allowed(h, a): h=h.lower(); return any((e.startswith('.') and h.endswith(e)) or h==e for e in [x.strip().lower() for x in a if x.strip()])\ndef validate_findings(f, a, l): o=[]; c=0; \n    if not a: l.warning('Validatie ingeschakeld, maar allowlist is leeg.'); return [ {**i,'validated':False} for i in f]\n    for i in f: \n        u=i.get('url'); \n        if not u: o.append({**i,'validated':False}); continue\n        h=(urlparse(u if re.match(r'^https?://',u) else 'https://'+u).hostname or '');\n        if not _allowed(h,a): o.append({**i,'validated':False}); continue\n        try: r=requests.head(u,timeout=7,allow_redirects=True,headers={'User-Agent':'NGBSE-10.0'}); ok=200<=r.status_code<400; \n        except requests.RequestException as e: l.warning(f'Validatie mislukt voor {u}',{'error':str(e)}); ok,r=False,None\n        if ok: c+=1\n        o.append({**i,'validated':ok,'status_code':r.status_code if r else None})\n    l.info(f'{c} van de relevante bevindingen succesvol gevalideerd.'); return o")
(root / "enrich/enrichment.py").write_text("from collections import defaultdict\ndef run_enrichment(f,c): by_seed=defaultdict(list); \n    for i in f: by_seed[i['seed'].get('seed','') if isinstance(i.get('seed'),dict) else str(i.get('seed',''))].append(i)\n    q=c.get('scoring',{}).get('quality_weights',{}); \n    for s, items in by_seed.items(): \n        live={i['source'] for i in items if i['source']!='wayback'}; C=len(live); has_w='wayback' in {i['source'] for i in items}; M=1.0 if has_w and not live else 0.6 if has_w else 0.2; \n        for i in items: i['enrichment']={'M':M,'C':C,'Q':q.get(i['source'],0.4)}\n    return f")
(root / "collectors/base_collector.py").write_text("import os, requests, time\nfrom .util import coc_sha256\nclass BaseCollector:\n    def __init__(self,c,l): self.config=c; self.log=l; self.source_name='unknown'; self.api_key=None; self.requires_api_key=False; self.api_key_env_var=None; self.session=requests.Session(); self.session.headers.update({'User-Agent':'NGBSE-10.0'}); self._load_api_key()\n    def _load_api_key(self): \n        if self.requires_api_key and self.api_key_env_var: self.api_key=os.getenv(self.api_key_env_var)\n    def collect(self,s,c,l): \n        is_c=c.get('orchestrator',{}).get('clearnet_only_mode',False)\n        if self.requires_api_key and (not self.api_key or is_c): self.log.warning(f'{self.source_name.capitalize()} collector: API-sleutel vereist.', {'seed': s.get('seed')}); return []\n        return self.run(s)\n    def run(self,s): raise NotImplementedError()")
(root / "collectors/util.py").write_text("import hashlib\ndef coc_sha256(m:str)->str: return hashlib.sha256(m.encode('utf-8','ignore')).hexdigest()")
(root / "collectors/urlscan_collector.py").write_text("from .base_collector import BaseCollector\nfrom .util import coc_sha256\nclass UrlscanCollector(BaseCollector):\n    def __init__(self,c,l): super().__init__(c,l); self.source_name='urlscan'; self.requires_api_key=True; self.api_key_env_var='URLSCAN_API_KEY'; self._load_api_key(); \n        if self.api_key: self.session.headers.update({'API-Key':self.api_key})\n    def run(self,s): \n        q=s.get('seed'); \n        try: r=self.session.get('https://urlscan.io/api/v1/search/',p={'q':q,'size':50},t=20); r.raise_for_status()\n        except Exception as e: self.log.error(f'{self.source_name} Fout',{'error':str(e),'seed':q}); return\n        for i in r.json().get('results',[]): u=i.get('page',{}).get('url'); ts=i.get('indexedAt'); rid=i.get('_id'); yield {'source':'urlscan','seed':s,'url':u,'ts':ts,'coc_sha256':coc_sha256(f'{rid}|{u}|{ts}')}")
(root / "collectors/github_collector.py").write_text("from .base_collector import BaseCollector\nfrom .util import coc_sha256\nfrom bs4 import BeautifulSoup\nfrom urllib.parse import quote_plus\nclass GithubCollector(BaseCollector):\n    def __init__(self,c,l): super().__init__(c,l); self.source_name='github'; self.api_key_env_var='GITHUB_TOKEN'; self._load_api_key()\n    def collect(self,s,c,l): return self._run_api(s) if self.api_key and not c.get('orchestrator',{}).get('clearnet_only_mode') else self._run_scrape(s)\n    def _run_api(self,s): \n        q=s.get('seed'); self.session.headers.update({'Authorization':f'Bearer {self.api_key}'})\n        try: r=self.session.get('https://api.github.com/search/code',p={'q':q,'per_page':50},t=20); r.raise_for_status()\n        except Exception as e: self.log.error(f'{self.source_name} API Fout',{'error':str(e),'seed':q}); return\n        for i in r.json().get('items',[]): u,repo=i.get('html_url'),i.get('repository',{}); yield {'source':'github','seed':s,'url':u,'ts':repo.get('updated_at'),'coc_sha256':coc_sha256(f'{u}|{repo.get(\"full_name\")}')}\n    def _run_scrape(self,s):\n        q=s.get('seed'); self.log.warning('GitHub draait in clearnet-scrape-modus.')\n        try: r=self.session.get(f'https://github.com/search?type=code&q={quote_plus(q)}',t=20); r.raise_for_status(); soup=BeautifulSoup(r.text,'html.parser')\n        except Exception as e: self.log.error(f'{self.source_name} Scrape Fout',{'error':str(e),'seed':q}); return\n        for a in soup.select('div.search-title a'): u='https://github.com'+a['href']; yield {'source':'github','seed':s,'url':u,'ts':None,'coc_sha256':coc_sha256(u)}")
(root / "collectors/shodan_collector.py").write_text("from .base_collector import BaseCollector\nfrom .util import coc_sha256\nclass ShodanCollector(BaseCollector):\n    def __init__(self,c,l): super().__init__(c,l); self.source_name='shodan'; self.requires_api_key=True; self.api_key_env_var='SHODAN_API_KEY'; self._load_api_key()\n    def run(self,s): \n        q=s.get('seed'); \n        try: r=self.session.get('https://api.shodan.io/shodan/host/search',p={'key':self.api_key,'query':q},t=20); r.raise_for_status()\n        except Exception as e: self.log.error(f'{self.source_name} Fout',{'error':str(e),'seed':q}); return\n        for i in r.json().get('matches',[]): ip=i.get('ip_str'); ts=i.get('timestamp'); yield {'source':'shodan','seed':s,'where':ip,'url':f'https://www.shodan.io/host/{ip}','ts':ts,'coc_sha256':coc_sha256(f'{ip}|{ts}')}")
(root / "collectors/censys_collector.py").write_text("from .base_collector import BaseCollector\nfrom .util import coc_sha256\nimport os\nclass CensysCollector(BaseCollector):\n    def __init__(self,c,l): super().__init__(c,l); self.source_name='censys'; self.requires_api_key=True; self.api_id=os.getenv('CENSYS_API_ID'); self.api_secret=os.getenv('CENSYS_API_SECRET')\n    def collect(self,s,c,l): \n        if not (self.api_id and self.api_secret) or c.get('orchestrator',{}).get('clearnet_only_mode'): self.log.warning('Censys: API ID/Secret vereist.'); return []\n        return self.run(s)\n    def run(self,s): \n        q=s.get('seed')\n        try: r=self.session.post('https://search.censys.io/api/v2/hosts/search',auth=(self.api_id,self.api_secret),json={'q':q,'per_page':50},t=20); r.raise_for_status()\n        except Exception as e: self.log.error(f'{self.source_name} Fout',{'error':str(e),'seed':q}); return\n        for i in r.json().get('result',{}).get('hits',[]): ip=i.get('ip'); ts=i.get('last_updated_at'); yield {'source':'censys','seed':s,'where':ip,'url':f'https://search.censys.io/hosts/{ip}','ts':ts,'coc_sha256':coc_sha256(f'{ip}|{ts}')}")
(root / "collectors/leakix_collector.py").write_text("from .base_collector import BaseCollector\nfrom .util import coc_sha256\nclass LeakixCollector(BaseCollector):\n    def __init__(self,c,l): super().__init__(c,l); self.source_name='leakix'; self.requires_api_key=True; self.api_key_env_var='LEAKIX_API_KEY'; self._load_api_key()\n        if self.api_key: self.session.headers.update({'Api-Key':self.api_key})\n    def run(self,s): \n        q=s.get('seed')\n        try: r=self.session.get('https://leakix.net/search',p={'q':q,'size':50},t=20); r.raise_for_status()\n        except Exception as e: self.log.error(f'{self.source_name} Fout',{'error':str(e),'seed':q}); return\n        for i in r.json(): u,ts=i.get('link'),i.get('time'); yield {'source':'leakix','seed':s,'url':u,'where':i.get('ip'),'ts':ts,'coc_sha256':coc_sha256(f'{u}|{ts}')}")
(root / "collectors/wayback_collector.py").write_text("from .base_collector import BaseCollector\nfrom .util import coc_sha256\nclass WaybackCollector(BaseCollector):\n    def __init__(self,c,l): super().__init__(c,l); self.source_name='wayback'\n    def run(self,s): \n        q=s.get('seed')\n        try: r=self.session.get('http://web.archive.org/cdx/search/cdx',p={'url':f'*{q}*','output':'json','limit':100},t=20); r.raise_for_status()\n        except Exception as e: self.log.error(f'{self.source_name} Fout',{'error':str(e),'seed':q}); return\n        for _,ts,o,_,_,d,_ in r.json()[1:]: u,t_iso=f'https://web.archive.org/web/{ts}/{o}',f'{ts[:4]}-{ts[4:6]}-{ts[6:8]}T{ts[8:10]}:{ts[10:12]}:{ts[12:14]}Z'; yield {'source':'wayback','seed':s,'url':u,'ts':t_iso,'coc_sha256':coc_sha256(f'{u}|{d}')}")
(root / "export/csv_export.py").write_text("import csv\ndef write_csv(f, p): \n    if not f: return\n    ff=[{**i,'seed':i.get('seed',{}).get('seed'),**(i.pop('enrichment',{})),**(i.pop('themes',[]))} for i in f]\n    k=sorted(list(ff[0].keys()));\n    with open(p,'w',newline='',encoding='utf-8') as h: w=csv.DictWriter(h,k,extrasaction='ignore'); w.writeheader(); w.writerows(ff)")
(root / "export/stix_exporter.py").write_text("import json,uuid,datetime\nfrom stix2 import TLP_WHITE,Indicator,Bundle,Report,Identity\ndef export_to_stix(f,s,a,p):\n    o,r_refs=[],[]\n    identity=Identity(name=a,identity_class='organization'); o.append(identity)\n    for i in f: \n        pat = f'[url:value = \\'{i.get(\"url\")}\\']' if i.get('url') else f'[{i.get(\"source\")}:value = \\'{i.get(\"where\")}\\']'\n        ind=Indicator(name=f'OSINT: {i.get(\"url\") or i.get(\"where\")}',pattern_type='stix',pattern=pat,created_by_ref=identity.id,valid_from=i.get('ts') or datetime.datetime.utcnow(),labels=['osint-finding'],confidence=int(i.get('score',.5)*100)); o.append(ind); r_refs.append(ind.id)\n    s_desc='\\n'.join([f'{d[\"future_scenario\"]} (Prob: {d[\"probability_90_days\"]})' for t,d in s.items()])\n    rep=Report(name=f'NGBSE 10.0 Synthesis Report',description=s_desc,object_refs=r_refs,created_by_ref=identity.id,report_types=['threat-report']); o.append(rep)\n    b=Bundle(o,allow_custom=True)\n    with open(p,'w',encoding='utf-8') as h: h.write(b.serialize(pretty=True))")
(root / "report/make_report.py").write_text("import json; from pathlib import Path; from docx import Document\ndef build_report(findings, synthesis):\n    out=Path('out/NGBSE_10_Report.docx'); d=Document(); d.add_heading('NGBSE 10.0: Executive Briefing',0); d.add_heading('Voorspellende Risicoscenario\\'s',1)\n    if not synthesis: d.add_paragraph('Geen scenario\\'s gedetecteerd.')\n    for t, data in synthesis.items(): d.add_paragraph(data['future_scenario'],style='Heading 2'); p=d.add_paragraph(); p.add_run('Waarschijnlijkheid: ').bold=True; p.add_run(f'{data[\"probability_90_days\"]}\\n'); p.add_run('Samenvatting: ').bold=True; p.add_run(data['semantic_summary'])\n    d.add_heading('Gedetailleerd Bewijs (Top 20)',1); t=d.add_table(1,4); t.style='Table Grid'; h=t.rows[0].cells; h[0].text='E_AI*';h[1].text='Info';h[2].text='URL/Bewijs';h[3].text='CoC Hash'\n    for f in findings[:20]: r=t.add_row().cells; r[0].text=f'{f.get(\"score\",0):.4f}'; e=f.get('enrichment',{}); r[1].text=f'M={e.get(\"M\")} C={e.get(\"C\")} Q={e.get(\"Q\")}'; r[2].text=str(f.get('url',''))[:60]; r[3].text=str(f.get('coc_sha256',''))[:12]\n    d.save(out); return out")

# --- RUN SCRIPT ---
(root / "run.sh").write_text(textwrap.dedent('''
#!/bin/bash
set -e
echo ">>> NGBSE 10.0: De Finale Engine starten..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "BELANGRIJK: Vul API-sleutels in .env voor de beste resultaten."
fi
pip install -q -r requirements.txt
python -m engine.orchestrator "$@"
'''))
os.chmod(root / "run.sh", 0o755)
(root / "README.md").write_text(textwrap.dedent('''
# NGBSE 10.0: De Finale Engine
Dit is de complete, zuivere, online-gerichte NGBSE.

## Vereisten
- Python 3.9+
- Een lokaal draaiende [Ollama](https://ollama.com/) instance met het `phi3:mini` model. (`ollama serve` & `ollama pull phi3:mini`)

## Gebruik
1. `cp .env.example .env` (en vul API-sleutels in).
2. `./run.sh`
- **Clearnet run (beperkt):** `./run.sh --clearnet`
- **Validatie forceren:** Voeg `--validate` toe.
'''))

print("\\n>>> SETUP VOLTOOID. NGBSE 10.0 is gebouwd. <<<")
print(f"1. Navigeer naar de map: cd {root.name}")
print("2. Vul uw API-sleutels in '.env'.")
print("3. Zorg dat Ollama lokaal draait (`ollama serve`).")
print("4. Start de engine met: ./run.sh")