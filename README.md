# Avenue88

This is a temporary review site.

## TikTok videos

`data/tiktok.json` is the list behind **Latest on TikTok**, newest first. Each item is:

- `id`: the number from the video URL
- `url`: full TikTok video link
- `title`: short caption. Leave it blank and the page will ask `https://www.tiktok.com/oembed?url=...` for a title and thumbnail, and use them only if that request returns them
- `thumbnail`: optional image URL. TikTok's oEmbed often has no thumbnail, so the card stays navy with the TikTok icon when this is empty
- `agent`: optional name, shown on the card when set

Replace the file with the latest videos (about six). The homepage loads it with `cache: 'no-cache'`. A card plays TikTok's own player only after a tap. **Open on TikTok** is always there if the player is blocked.
