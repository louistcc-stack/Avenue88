# Avenue88

This is a temporary review site.

## Navigation

The header and footer page links are drawn from `A88_NAV` in `js/main.js`. Each page leaves `<nav id="nav"></nav>` empty. Edit that list to change the links everywhere. The current page is marked with `aria-current` and shown in gold.

## Instagram posts

`data/instagram.json` feeds the homepage **INSTAGRAM.** grid. It is an array, newest first. Each item is:

- `url`: the public post or reel link, such as `https://www.instagram.com/p/.../` or `https://www.instagram.com/reel/.../`
- `type`: `photo`, `reel` or `carousel`
- `caption`: the line shown on the card
- `image`: optional local thumbnail, `assets/instagram/<shortcode>.jpg`

`scripts/fetch_instagram_images.py` downloads each thumbnail from `instagram.com/p/<shortcode>/media/?size=l`. If that fetch fails and no file is already saved, the card uses Instagram's official embed instead. Do not add stock or generated images.

`data/tiktok.json` is kept in the repo and is not shown on the homepage. The TikTok button in Follow along still links to @avenue88property.

## New launches map

`data/preview-timeline.json` is the Huttons 2027 residential preview timeline (updated 22 Oct 2026). `scripts/apply_preview_timeline.py` copies developer, tenure, estimated units, land psf ppr, region, and target preview onto `data/launches.json`. Run it again after a Huttons refresh so those fields are not dropped. `-` and `Redev` in the land column are left blank. The industrial page is not included.

`scripts/geocode_launches.py` fills `lat` and `lng` on `data/launches.json` from Singapore OneMap's public search. It does not invent a point. A project OneMap cannot match is marked `geocode_status: flagged` and is left off the map. The script skips a project that was already geocoded, or already flagged, for the same address. `.github/workflows/geocode-launches.yml` runs it when `data/launches.json` changes on `main`, and on demand.
