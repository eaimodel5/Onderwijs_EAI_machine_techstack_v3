
from collections import defaultdict
def run_enrichment(findings: list, cfg: dict) -> list:
    by_seed = defaultdict(list)
    for i in findings:
        key = i.get('seed',{}).get('seed','') if isinstance(i.get('seed'),dict) else str(i.get('seed',''))
        by_seed[key].append(i)
    qw = cfg.get('scoring',{}).get('quality_weights',{})
    for s, items in by_seed.items():
        live = {i['source'] for i in items if i['source'] != 'wayback'}
        C = len(live)
        has_w = 'wayback' in {i['source'] for i in items}
        M = 1.0 if has_w and not live else 0.6 if has_w else 0.2
        for i in items:
            i['enrichment'] = {'M': M, 'C': C, 'Q': qw.get(i['source'], qw.get('default',0.4))}
    return findings
