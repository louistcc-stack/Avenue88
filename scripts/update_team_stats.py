#!/usr/bin/env python3
"""Build data/stats.json of Avenue 88 agents' CEA transaction records (data.gov.sg)."""
import json, time, urllib.request, urllib.parse, collections, datetime, sys, os
RES = "d_ee7e46d3c57f7865790704632b0aef71"  # CEA Salesperson's Property Transaction Records (residential)
AGENTS = {  # name -> CEA reg no; set include False to report but exclude from team total
  "Louis Tay": ("R000567G", True), "Jackie Mang": ("R008878E", True),
  "Benny Poh": ("R008885H", True), "Chantel Teo": ("R013641J", True),
  "Phoebe Goh": ("R051932H", True), "Brent Wang": ("R057382I", True),
  "Jason Ang": ("R008889J", True),
}
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "stats.json")
def fetch(reg):
    out, off = [], 0
    while True:
        q = urllib.parse.urlencode({"resource_id": RES, "limit": 1000, "offset": off,
                                    "filters": json.dumps({"salesperson_reg_num": reg})})
        for a in range(5):
            try:
                r = json.load(urllib.request.urlopen("https://data.gov.sg/api/action/datastore_search?" + q, timeout=60))["result"]; break
            except Exception as e:
                time.sleep(10 * (a + 1))
        else: sys.exit("fetch failed " + reg)
        out += r["records"]; off += 1000
        if off >= r["total"]: return out
        time.sleep(2)
def ym(s): return datetime.datetime.strptime(s.title(), "%b-%Y")
def month_floor(dt): return datetime.datetime(dt.year, dt.month, 1)
def add_months(dt, n):
    m = dt.year * 12 + (dt.month - 1) + n
    return datetime.datetime(m // 12, m % 12 + 1, 1)
# Last 12 calendar months, including the month the script runs.
WIN_END = month_floor(datetime.datetime.now(datetime.timezone.utc))
WIN_START = add_months(WIN_END, -11)
def focus_of(recs):
    C = collections.Counter
    towns = C(r["town"] for r in recs if r.get("town") not in ("-", "", None))
    dists = C(r["district"] for r in recs if r.get("district") not in ("-", "", None))
    town, dist = towns.most_common(1), dists.most_common(1)
    # The single town or district value with the most records. Equal counts prefer the town.
    if town and (not dist or town[0][1] >= dist[0][1]):
        return {"kind": "town", "name": town[0][0], "count": town[0][1]}
    if dist:
        return {"kind": "district", "name": dist[0][0], "count": dist[0][1]}
    return None
def summ(recs):
    C = collections.Counter
    ds = [ym(r["transaction_date"]) for r in recs]
    return {"total": len(recs),
      "since_2017": sum(d.year >= 2017 for d in ds),
      "last_12_months": sum(WIN_START <= d <= WIN_END for d in ds),
      "last_12_months_from": WIN_START.strftime("%Y-%m"),
      "last_12_months_to": WIN_END.strftime("%Y-%m"),
      "focus": focus_of(recs),
      "by_property_type": dict(C(r["property_type"] for r in recs).most_common()),
      "by_transaction_type": dict(C(r["transaction_type"] for r in recs).most_common()),
      "top_towns": dict(C(r["town"] for r in recs if r["town"] not in ("-", "")).most_common(6)),
      "top_districts": dict(C(r["district"] for r in recs if r["district"] not in ("-", "")).most_common(6)),
      "first": min(ds).strftime("%Y-%m") if ds else None, "last": max(ds).strftime("%Y-%m") if ds else None}
res, team = {}, []
for n, (reg, inc) in AGENTS.items():
    recs = fetch(reg); s = summ(recs); s.update(reg_no=reg, included_in_team=inc); res[n] = s
    if inc: team += recs
    time.sleep(3)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump({"last_updated": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
      "source": "CEA via data.gov.sg dataset " + RES, "agents": res,
      "team": dict(summ(team), included=[n for n, (_, i) in AGENTS.items() if i],
        note="Simple sum; two team agents on the same deal would be counted twice (records carry no deal ID).")},
      f, indent=1)
print(json.dumps({n: (v["total"], v["since_2017"], v["last_12_months"], v.get("focus")) for n, v in res.items()}))
print("wrote", OUT)
