#!/usr/bin/env python3
"""Turn the team's "Past transactions" spreadsheet (saved as CSV) into data/transactions.json.

Usage: python3 scripts/transactions_csv_to_json.py past-transactions.csv

Columns (first row): Agent, Project or street, District, Property type, Sale or rental,
Month (YYYY-MM), We represented, Price S$ (optional), Highlight (optional),
Photo file name (optional), Client OK to show? (Yes/No)

Only rows with "Client OK to show?" = Yes are published. Photos go in img/transactions/.
These featured deals appear above the CEA records on the About page.
"""
import csv, json, os, re, sys

AGENTS = {"jason ang", "jackie mang", "benny poh", "brent wang", "chantel teo", "phoebe goh", "louis tay"}
TYPES = {"hdb": "HDB", "condo": "Condo", "ec": "EC", "landed": "Landed", "commercial": "Commercial"}
SIDES = {"seller", "buyer", "landlord", "tenant"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def col(row, start):
    for k, v in row.items():
        if k and k.strip().lower().startswith(start):
            return (v or "").strip()
    return ""


def main(path):
    out, problems = [], []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for i, row in enumerate(csv.DictReader(f), start=2):
            if col(row, "client ok").lower() not in ("yes", "y"):
                continue
            agent = col(row, "agent").lower()
            ptype = TYPES.get(col(row, "property type").lower())
            txn = col(row, "sale or rental").title()
            month = col(row, "month")
            side = col(row, "we represented").lower()
            dist = col(row, "district").upper().replace("DISTRICT", "D").replace(" ", "")
            if dist and not dist.startswith("D"):
                dist = "D" + dist
            if dist and re.fullmatch(r"D\d", dist):
                dist = "D0" + dist[1]
            price = re.sub(r"[^\d]", "", col(row, "price"))
            photo = col(row, "photo")
            errs = [m for ok, m in [(agent in AGENTS, "agent"), (bool(col(row, "project")), "project"), (ptype, "property type"),
                                    (txn in ("Sale", "Rental"), "sale or rental"), (re.fullmatch(r"20\d{2}-(0[1-9]|1[0-2])", month), "month"),
                                    (side in SIDES, "we represented")] if not ok]
            if errs:
                problems.append(f"row {i}: check {', '.join(errs)}")
                continue
            out.append({"agent": agent.replace(" ", "-"), "project": col(row, "project"), "district": dist,
                        "property_type": ptype, "transaction_type": txn, "month": month, "represented": side,
                        "price": int(price) if price else None, "highlight": col(row, "highlight") or None,
                        "photo": ("img/transactions/" + photo) if photo else None, "featured": True})
    out.sort(key=lambda r: r["month"], reverse=True)
    with open(os.path.join(ROOT, "data", "transactions.json"), "w") as f:
        json.dump({"example": False, "note": "Featured deals from the team's spreadsheet. Built by scripts/transactions_csv_to_json.py.",
                   "transactions": out}, f, indent=1, ensure_ascii=False)
    print(f"wrote {len(out)} featured deals")
    for p in problems:
        print("skipped", p)


if __name__ == "__main__":
    main(sys.argv[1])
