#!/usr/bin/env python3
"""Write data/podcasts.json from the Avenue 88 YouTube playlist feeds."""
import html, json, os, sys, time, urllib.request, xml.etree.ElementTree as ET
ATOM = "{http://www.w3.org/2005/Atom}"
YT = "{http://www.youtube.com/xml/schemas/2015}"
MEDIA = "{http://search.yahoo.com/mrss/}"
SHOWS = [
    ("takeaway", "Takeaway with Avenue 88", "PLaptE4pMNjjjzHJsFYTlHRhFCVHI_QMnJ"),
    ("realtalk", "The Real Talk", "PLaptE4pMNjjhWlZ83ZJvsoJhajMvITqGi"),
]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "podcasts.json")
def fetch(playlist):
    url = "https://www.youtube.com/feeds/videos.xml?playlist_id=" + playlist
    req = urllib.request.Request(url, headers={"User-Agent": "Avenue88-podcasts/1.0"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception:
            time.sleep(5 * (attempt + 1))
    sys.exit("fetch failed " + playlist)
def text(el, tag):
    found = el.find(tag)
    return html.unescape((found.text or "").strip()) if found is not None else ""
def episodes(show, playlist):
    root = ET.fromstring(fetch(playlist))
    out = []
    for entry in root.findall(ATOM + "entry"):
        vid = text(entry, YT + "videoId") or text(entry, ATOM + "id").rsplit(":", 1)[-1]
        if not vid:
            continue
        title = text(entry, ATOM + "title")
        group = entry.find(MEDIA + "group")
        if not title and group is not None:
            title = text(group, MEDIA + "title")
        published = text(entry, ATOM + "published")
        date = published[:10] if len(published) >= 10 and published[4] == "-" else ""
        thumb = ""
        if group is not None:
            for node in group.findall(MEDIA + "thumbnail"):
                thumb = node.attrib.get("url") or thumb
                if "hqdefault" in thumb:
                    break
        if not thumb:
            thumb = "https://i.ytimg.com/vi/" + vid + "/hqdefault.jpg"
        out.append({"id": vid, "title": title, "date": date, "show": show, "thumbnail": thumb})
    return out
def same(a, b):
    keys = ("id", "title", "date", "show", "thumbnail")
    return [{k: x.get(k) for k in keys} for x in a] == [{k: x.get(k) for k in keys} for x in b]
eps = []
for show, _name, playlist in SHOWS:
    eps += episodes(show, playlist)
    time.sleep(1)
eps.sort(key=lambda e: (e["date"], e["id"]), reverse=True)
payload = {
    "source": "YouTube playlist RSS feeds",
    "shows": [{"id": i, "name": n, "playlist": p} for i, n, p in SHOWS],
    "episodes": eps,
}
prev = None
if os.path.exists(OUT):
    try:
        prev = json.load(open(OUT))
    except Exception:
        prev = None
if prev and same(prev.get("episodes") or [], eps) and prev.get("shows") == payload["shows"]:
    print("unchanged", len(eps))
    sys.exit(0)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(payload, f, indent=2, ensure_ascii=False)
    f.write("\n")
print("wrote", OUT, len(eps))
