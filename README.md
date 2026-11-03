# Avenue88

This is a temporary review site.

## Instagram posts

`data/instagram.json` feeds the homepage **INSTAGRAM.** row. It is an array, newest first. Each item is:

- `url`: the public post or reel link, such as `https://www.instagram.com/p/.../` or `https://www.instagram.com/reel/.../`
- `type`: `post`, `reel`, `carousel` or `photo`
- `caption`: the line shown on the dark card

An empty array hides that row. The four-handle Follow strip stays either way. Cards link out to Instagram. They are not the official white embed.

`data/tiktok.json` is kept in the repo and is not shown on the homepage. The TikTok button in Follow along still links to @avenue88property.

## New launches map

`scripts/geocode_launches.py` fills `lat` and `lng` on `data/launches.json` from Singapore OneMap's public search. It does not invent a point. A project OneMap cannot match is marked `geocode_status: flagged` and is left off the map. The script skips a project that was already geocoded, or already flagged, for the same address. `.github/workflows/geocode-launches.yml` runs it when `data/launches.json` changes on `main`, and on demand.
