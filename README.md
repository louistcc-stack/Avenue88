# Avenue88

This is a temporary review site.

## Instagram posts

`data/instagram.json` feeds **Latest on Instagram @avenue88property**. It is an array, newest first. Each item is:

- `url`: the public post or reel link, such as `https://www.instagram.com/p/.../` or `https://www.instagram.com/reel/.../`
- `type`: `post` or `reel`
- `caption`: short text used as the link inside the embed before Instagram's script runs

An empty array shows a single Follow card. When the list has posts, the page embeds each one with Instagram's official blockquote and loads `https://www.instagram.com/embed.js` only once the section is near the screen. Desktop shows three across. Phones scroll them sideways.

`data/tiktok.json` is kept in the repo and is not shown on the homepage. The TikTok button in Follow along still links to @avenue88property.
