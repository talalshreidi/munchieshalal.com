# Munchies Hartford website

Static site for Munchies Fried Chicken & Shawarma (21 Asylum St, Hartford, CT).

Live site: **https://munchieshalal.com**

## What's in here

- `src/index.html` — the actual page
- `css/` — styles
- `js/` — menu, scroll, contact form, menu lightbox, etc.
- `assets/` — photos, logo, video
- `netlify.toml` — makes the root URL work on Netlify (serves `src/index.html` at `/`)

No build step. Just HTML, CSS, and plain JavaScript modules.

## Run it on your computer

From this folder:

```bash
python -m http.server 8000
```

Then open **http://localhost:8000/src/index.html**

The address bar will show `/src/index.html` locally. On Netlify it shows just the domain — that's normal.

## Deploy

Push to GitHub. Netlify is hooked up to this repo and deploys on push.

Publish directory on Netlify should be the project root (`.`).

## Contact form

The form uses [Web3Forms](https://web3forms.com). The access key is in `src/index.html` (`data-access-key`). Lock the key to your domain in the Web3Forms dashboard if the repo is public.

## Notes

- Menu images open in a lightbox (tap to zoom on mobile).
- Nav scrolls smoothly and keeps the URL clean (no `#contact` in the bar).
