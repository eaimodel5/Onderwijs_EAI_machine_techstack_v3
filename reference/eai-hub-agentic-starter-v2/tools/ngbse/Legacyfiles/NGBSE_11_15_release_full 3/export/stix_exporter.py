
from stix2 import TLP_WHITE,Indicator,Bundle,Report,Identity
import datetime
def export_to_stix(findings, synthesis, author_name, out_path):
    objs, refs = [], []
    identity = Identity(name=author_name, identity_class="organization")
    objs.append(identity)
    for f in findings:
        url = f.get("url") or f.get("where","")
        pattern = f"[url:value = '{url}']" if url else "[artifact:payload_bin = '']"
        ind = Indicator(name=f"OSINT: {url}", pattern_type="stix", pattern=pattern,
                        valid_from=f.get("ts") or datetime.datetime.utcnow(),
                        created_by_ref=identity.id, labels=["osint-finding"],
                        confidence=int(f.get("score",.5)*100))
        objs.append(ind); refs.append(ind.id)
    desc = "\n".join([f"{v['future_scenario']} (Prob: {v['probability_90_days']})" for k,v in (synthesis or {}).items()])
    rep = Report(name="NGBSE 11.1 Synthesis", description=desc, object_refs=refs, created_by_ref=identity.id, report_types=["threat-report"])
    objs.append(rep)
    b = Bundle(objs, allow_custom=True)
    with open(out_path, "w", encoding="utf-8") as h:
        h.write(b.serialize(pretty=True))
