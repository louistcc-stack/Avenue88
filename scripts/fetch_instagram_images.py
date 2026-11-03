#!/usr/bin/env python3
"""Save each Instagram post thumbnail from data/instagram.json.

Uses Instagram's public media redirect:
https://www.instagram.com/p/<shortcode>/media/?size=l

A post that does not return a JPEG is left without an image field so the
homepage can fall back to Instagram's official embed. Existing files are
kept when a later fetch fails.
"""
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "instagram.json"
OUT = ROOT / "assets" / "instagram"
SHORT = re.compile(r"/(?:p|reel|tv)/([A-Za-z0-9_-]+)")


def shortcode(url):
    match = SHORT.search(url or "")
    return match.group(1) if match else ""


def fetch_jpeg(code):
    url = f"https://www.instagram.com/p/{code}/media/?size=l"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as res:
        data = res.read()
        ctype = res.headers.get("content-type", "")
    if data.startswith(b"\xff\xd8") and ("jpeg" in ctype or "jpg" in ctype):
        return data
    raise RuntimeError(f"not a jpeg ({ctype})")


def main():
    posts = json.loads(DATA.read_text())
    if not isinstance(posts, list):
        raise SystemExit("data/instagram.json must be an array")
    OUT.mkdir(parents=True, exist_ok=True)
    saved, kept, failed = [], [], []
    for post in posts:
        code = shortcode(post.get("url"))
        dest = OUT / f"{code}.jpg" if code else None
        if not code:
            post.pop("image", None)
            post.pop("image_source", None)
            failed.append(post.get("url") or "(no url)")
            continue
        try:
            dest.write_bytes(fetch_jpeg(code))
            post["image"] = f"assets/instagram/{code}.jpg"
            post["image_source"] = f"instagram.com/p/{code}/media/?size=l"
            saved.append(code)
        except Exception as exc:
            if dest.exists() and dest.stat().st_size > 1000:
                post["image"] = f"assets/instagram/{code}.jpg"
                post["image_source"] = f"instagram.com/p/{code}/media/?size=l"
                kept.append(f"{code} ({exc})")
            else:
                post.pop("image", None)
                post.pop("image_source", None)
                failed.append(f"{code} ({exc})")
    DATA.write_text(json.dumps(posts, indent=2, ensure_ascii=False) + "\n")
    print(f"saved {len(saved)}  kept {len(kept)}  embed-fallback {len(failed)}")
    for code in saved:
        print("  saved", code)
    for line in kept:
        print("  kept", line)
    for line in failed:
        print("  fallback", line)


if __name__ == "__main__":
    main()
