#!/usr/bin/env python3
"""Merge data/preview-timeline.json onto data/launches.json.

The timeline file is the source for Huttons preview fields. Run this after a
Huttons refresh so those fields are not lost. It does not invent values.
'-' and 'Redev' in the land psf ppr column are stored as no value.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LAUNCHES = ROOT / "data" / "launches.json"
TIMELINE = ROOT / "data" / "preview-timeline.json"
MONTHS = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def norm_name(name):
    text = name.lower()
    text = re.sub(r"\([^)]*\)", " ", text)
    text = re.sub(r"\bgls\b", " ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def plain(name):
    return re.sub(r"[^a-z0-9]+", " ", name.lower()).strip()


def month_token(token):
    return MONTHS[token[:3].lower()]


def month_label(token, year):
    return f"{token[:3].title()} {year}"


def parse_preview(raw):
    text = re.sub(r"\s+", " ", (raw or "").strip())
    matched = re.fullmatch(r"(\d{1,2})\s*/\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", text)
    if matched:
        year = int(matched.group(4))
        month = month_token(matched.group(3))
        return f"{year}-{month:02d}-0", month_label(matched.group(3), year)
    matched = re.fullmatch(r"(?i)mid\s+([A-Za-z]+)\s+(\d{4})", text)
    if matched:
        year = int(matched.group(2))
        month = month_token(matched.group(1))
        return f"{year}-{month:02d}-0", month_label(matched.group(1), year)
    matched = re.fullmatch(r"(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})", text)
    if matched:
        year = int(matched.group(3))
        month = month_token(matched.group(2))
        return f"{year}-{month:02d}-0", month_label(matched.group(2), year)
    matched = re.fullmatch(r"([A-Za-z]+)\s*/\s*([A-Za-z]+)\s+(\d{4})", text)
    if matched:
        year = int(matched.group(3))
        month = month_token(matched.group(2))
        label = f"{matched.group(1)[:3].title()} / {matched.group(2)[:3].title()} {year}"
        return f"{year}-{month:02d}-1", label
    matched = re.fullmatch(r"([A-Za-z]+)\s+(\d{4})", text)
    if matched:
        year = int(matched.group(2))
        month = month_token(matched.group(1))
        return f"{year}-{month:02d}-0", month_label(matched.group(1), year)
    matched = re.fullmatch(r"([1-4])Q\s*(\d{4})", text)
    if matched:
        quarter = int(matched.group(1))
        year = int(matched.group(2))
        return f"{year}-{quarter * 3:02d}-2", f"{quarter}Q {year}"
    matched = re.fullmatch(r"([12])H\s*(\d{4})", text)
    if matched:
        half = int(matched.group(1))
        year = int(matched.group(2))
        end = 6 if half == 1 else 12
        return f"{year}-{end:02d}-3", f"{half}H {year}"
    matched = re.fullmatch(r"(\d{4})", text)
    if matched:
        year = int(matched.group(1))
        return f"{year}-12-4", str(year)
    raise SystemExit(f"Cannot read preview date: {raw}")


def land_value(raw):
    text = (raw or "").strip()
    if text in ("", "-", "Redev"):
        return ""
    return text


def slug(name):
    return re.sub(r"-+", "-", re.sub(r"[^a-z0-9]+", "-", name.lower())).strip("-")


def blank_project(row, key, label):
    district = f"D{int(row['district']):02d}"
    return {
        "id": slug(row["name"]),
        "name": row["name"],
        "status": "Upcoming",
        "district": district,
        "area": row["location"],
        "region_group": "",
        "address": row["location"],
        "type": "",
        "launch_date": "",
        "preview_date": "",
        "top": "",
        "price_from": "",
        "price_to": "",
        "psf_from": "",
        "psf_to": "",
        "total_units": str(row["units"]),
        "available_units": "",
        "developer": row["developer"],
        "tenure": row["tenure"],
        "unit_mix": "",
        "mrt": "",
        "image": "",
        "source_image": "",
        "blurb": "",
        "region": row["region"],
        "preview_target": row["preview"],
        "preview_group_key": key,
        "preview_group_label": label,
        "land_psf_ppr": land_value(row.get("land_psf_ppr")),
        "preview_source": "Huttons preview timeline 22 Oct 2026",
    }


def apply_fields(project, row, key, label):
    project["region"] = row["region"]
    project["developer"] = row["developer"]
    project["tenure"] = row["tenure"]
    project["total_units"] = str(row["units"])
    project["land_psf_ppr"] = land_value(row.get("land_psf_ppr"))
    project["preview_target"] = row["preview"]
    project["preview_group_key"] = key
    project["preview_group_label"] = label
    project["preview_source"] = "Huttons preview timeline 22 Oct 2026"


def main():
    launches = json.loads(LAUNCHES.read_text())
    timeline = json.loads(TIMELINE.read_text())
    projects = launches.setdefault("projects", [])
    by_norm = {}
    for project in projects:
        key = norm_name(project.get("name") or "")
        by_norm.setdefault(key, []).append(project)

    matched, added, ambiguous = [], [], []
    for row in timeline["projects"]:
        key, label = parse_preview(row["preview"])
        norm = norm_name(row["name"])
        hits = by_norm.get(norm) or []
        if len(hits) > 1:
            ambiguous.append(f"{row['name']}: more than one existing project normalises to '{norm}'")
            continue
        if len(hits) == 1:
            project = hits[0]
            apply_fields(project, row, key, label)
            matched.append(project["name"])
            if plain(row["name"]) != plain(project["name"]):
                ambiguous.append(
                    f"Matched PDF '{row['name']}' to existing '{project['name']}' after ignoring (EC)/GLS wording."
                )
            pdf_district = f"D{int(row['district']):02d}"
            if (project.get("district") or "") != pdf_district:
                ambiguous.append(
                    f"Matched '{project['name']}' by name, but the district differs: "
                    f"existing {project.get('district') or 'blank'} / {project.get('address') or 'no address'}; "
                    f"PDF {pdf_district} / {row['location']}. Kept the existing address and district."
                )
            continue
        project = blank_project(row, key, label)
        projects.append(project)
        by_norm.setdefault(norm, []).append(project)
        added.append(project["name"])
        location = norm_name(row["location"])
        for existing in projects:
            if existing is project or norm_name(existing.get("name") or "") == norm:
                continue
            address = norm_name(existing.get("address") or "")
            if location and address and (location in address or address in location):
                ambiguous.append(
                    f"Did not match PDF '{row['name']}' ({row['location']}) to existing "
                    f"'{existing['name']}' ({existing.get('address')}). Names differ, so it was added separately."
                )

    launches["preview_timeline_updated"] = timeline.get("updated")
    LAUNCHES.write_text(json.dumps(launches, indent=1, ensure_ascii=False) + "\n")
    print(f"matched {len(matched)}")
    for name in matched:
        print("  match", name)
    print(f"added {len(added)}")
    for name in added:
        print("  new", name)
    print(f"ambiguous {len(ambiguous)}")
    for line in ambiguous:
        print("  -", line)


if __name__ == "__main__":
    main()
