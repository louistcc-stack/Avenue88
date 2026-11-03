#!/usr/bin/env python3
"""Add lat/lng to data/launches.json from Singapore OneMap.

Uses the public search API. Never writes a coordinate OneMap did not return.
Projects that do not match are flagged and left without lat/lng.
Projects already geocoded for the same address are left as they are.
"""
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "launches.json"
API = "https://www.onemap.gov.sg/api/common/elastic/search"
STOP = {
    "the", "at", "and", "of", "road", "rd", "street", "st", "avenue", "ave",
    "drive", "dr", "lane", "ln", "singapore", "along", "with", "for",
}
SG_LAT = (1.15, 1.48)
SG_LNG = (103.6, 104.1)


def tokens(text):
    return [t for t in re.findall(r"[a-z0-9]+", (text or "").lower()) if t not in STOP and (len(t) >= 3 or t.isdigit())]


def clean_address(address):
    text = (address or "").replace("\n", " ")
    text = re.sub(r"\bS\s*\(\d{6}\)", " ", text, flags=re.I)
    text = re.sub(r"\([^)]*\)", " ", text)
    text = re.sub(r"[–—].*", " ", text)
    text = re.sub(r"(?i)\bsingapore\b", " ", text)
    text = re.sub(r"(?i)^along\s+", "", text)
    return re.sub(r"\s+", " ", text).strip(" ,")


def queries(address, name):
    raw = clean_address(address)
    out = []

    def add(q):
        q = re.sub(r"\s+", " ", q or "").strip(" ,")
        if len(q) >= 3 and q.lower() not in {x.lower() for x in out}:
            out.append(q)

    parts = [p.strip(" ,") for p in re.split(r"[,/]", raw) if p.strip(" ,")]
    roadish = [p for p in parts if re.search(r"[A-Za-z]{3,}", p)]
    road = max(roadish, key=lambda part: len(re.findall(r"[A-Za-z]", part))) if roadish else raw
    road_only = re.sub(r"^(?:\d+[A-Za-z]?\s*(?:to\s+)?)+", "", road, flags=re.I).strip()
    num = next((re.match(r"^(\d+[A-Za-z]?)", p).group(1) for p in parts if re.match(r"^\d", p)), None)
    if num and road_only:
        add(f"{num} {road_only}")
    add(road)
    add(road_only)
    add(raw)
    add(name)
    return out


def in_singapore(lat, lng):
    return SG_LAT[0] <= lat <= SG_LAT[1] and SG_LNG[0] <= lng <= SG_LNG[1]


GENERIC = {"grand", "residences", "residence", "central", "close", "house", "villas", "gls", "one", "the"}


def phrase(text):
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", (text or "").lower())).strip()


def search(query):
    url = API + "?" + urllib.parse.urlencode({
        "searchVal": query,
        "returnGeom": "Y",
        "getAddrDetails": "Y",
        "pageNum": "1",
    })
    req = urllib.request.Request(url, headers={"User-Agent": "Avenue88-geocoder/1.0"})
    with urllib.request.urlopen(req, timeout=25) as res:
        return json.loads(res.read().decode("utf-8"))


def clear_point(project):
    project.pop("lat", None)
    project.pop("lng", None)


def score(result, query, name):
    try:
        lat = float(result["LATITUDE"])
        lng = float(result["LONGITUDE"])
    except (KeyError, TypeError, ValueError):
        return -1
    if not in_singapore(lat, lng):
        return -1
    q = phrase(query)
    road = phrase(result.get("ROAD_NAME"))
    search = phrase(result.get("SEARCHVAL"))
    building = phrase(result.get("BUILDING"))
    points = 0
    blk = phrase(result.get("BLK_NO"))
    qnum = re.match(r"^(\d+[a-z]?)", q or "")
    if qnum and blk and qnum.group(1) == blk:
        points += 6
    named = [t for t in tokens(name) if t not in GENERIC and len(t) >= 4]
    blob = " ".join((search, building, phrase(result.get("ADDRESS"))))
    hits = [t for t in named if t in blob]
    if len(hits) >= 2:
        points += 5
    if q and (search == q or road == q):
        points += 8
    elif q and len(q) >= 5 and (search.startswith(q) or building.startswith(q)):
        points += 5
    return points


def geocode_project(project):
    address = (project.get("address") or "").strip()
    name = project.get("name") or ""
    if not address:
        clear_point(project)
        project["geocode_status"] = "flagged"
        project["geocode_query"] = ""
        project["geocode_note"] = "No address"
        project.pop("geocode_match", None)
        project["geocode_address"] = ""
        return "flagged"
    last_query = ""
    saw_response = False
    best = None
    best_score = 3
    for query in queries(address, name):
        last_query = query
        try:
            payload = search(query)
        except Exception as exc:
            return ("error", str(exc))
        saw_response = True
        time.sleep(0.2)
        for result in payload.get("results") or []:
            points = score(result, query, name)
            if points > best_score:
                best_score = points
                best = (query, result)
        if best_score >= 6:
            break
    if best:
        query, result = best
        project["lat"] = round(float(result["LATITUDE"]), 6)
        project["lng"] = round(float(result["LONGITUDE"]), 6)
        project["geocode_status"] = "ok"
        project["geocode_query"] = query
        project["geocode_match"] = result.get("ADDRESS") or result.get("SEARCHVAL") or ""
        project["geocode_address"] = address
        project.pop("geocode_note", None)
        return "ok"
    if not saw_response:
        return ("error", "no response")
    clear_point(project)
    project["geocode_status"] = "flagged"
    project["geocode_query"] = last_query
    project["geocode_note"] = "No OneMap match"
    project.pop("geocode_match", None)
    project["geocode_address"] = address
    return "flagged"


def needs_geocode(project):
    if project.get("geocode_status") == "ok" and project.get("geocode_address") == (project.get("address") or "").strip():
        if isinstance(project.get("lat"), (int, float)) and isinstance(project.get("lng"), (int, float)):
            return False
    if project.get("geocode_status") == "flagged" and project.get("geocode_address") == (project.get("address") or "").strip():
        return False
    return True


def main():
    data = json.loads(DATA.read_text())
    projects = data.get("projects") or []
    counts = {"ok": 0, "flagged": 0, "skipped": 0, "error": 0}
    flagged = []
    errors = []
    changed = False
    for project in projects:
        if not needs_geocode(project):
            counts["skipped"] += 1
            if project.get("geocode_status") == "flagged":
                flagged.append(project.get("name") or project.get("id"))
            continue
        result = geocode_project(project)
        changed = True
        if result == "ok":
            counts["ok"] += 1
        elif result == "flagged":
            counts["flagged"] += 1
            flagged.append(project.get("name") or project.get("id"))
        else:
            counts["error"] += 1
            errors.append(f"{project.get('name')}: {result[1]}")
    if changed:
        DATA.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    ok_total = sum(1 for p in projects if p.get("geocode_status") == "ok")
    flagged_total = sum(1 for p in projects if p.get("geocode_status") == "flagged")
    print(f"geocoded {ok_total}  flagged {flagged_total}  skipped {counts['skipped']}  new_ok {counts['ok']}  errors {counts['error']}")
    if flagged:
        print("flagged:")
        for name in flagged:
            print(" -", name)
    if errors:
        print("errors:", file=sys.stderr)
        for line in errors:
            print(" -", line, file=sys.stderr)
        if counts["ok"] == 0 and counts["flagged"] == 0:
            sys.exit(1)


if __name__ == "__main__":
    main()
