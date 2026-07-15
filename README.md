# Phi Gallery — website

Static site for **Phi Gallery**, a DIY community art space & live music venue at
**88 Public Square, Watertown, NY 13601**. Built with [Eleventy](https://www.11ty.dev/)
v3, edited through [Sveltia CMS](https://github.com/sveltia/sveltia-cms), and hosted
free on GitHub Pages. See [`PLAN.md`](./PLAN.md) for the full strategy.

- **Zero framework JS**, responsive images (WebP + fallback), local-SEO JSON-LD, GA4 ready.
- **Editors never touch code** — they log in at `/admin` and fill out forms.
- **~$12/yr total** (just the domain). Everything else is free-tier.

---

## Quick start (developers)

```bash
npm install
npm start          # dev server with live reload → http://localhost:8080
npm run build      # production build → ./_site
npm run placeholders   # (re)generate the sample poster images
```

Requires Node 18+ (built on Node 20/24).

---

## Project structure

```
src/
  _data/            Global + CMS-editable data
    settings.json     ← NAP, hours, socials, hero, announcement (edited in CMS)
    visit.json        ← Visit-page prose (edited in CMS)
    site.js           ← build config: url, GA4 id, integrations (dev-owned)
    schema.js         ← sitewide ArtGallery/MusicVenue JSON-LD
    nav.js, labels.js, eleventyComputed.js
  _includes/
    layouts/          base, page, event, exhibit, artist
    partials/         head (SEO/meta/JSON-LD), header, footer, cards, hours…
  assets/
    css/styles.css    the whole design system (dark DIY-poster aesthetic)
    js/nav.js         tiny progressive-enhancement mobile-nav toggle
    img/              logo + generated placeholder images
    uploads/          ← CMS image uploads land here
  admin/              Sveltia CMS (index.html + config.yml)
  events/  exhibits/  artists/  partners/  press-mentions/   ← content collections
  index.njk  events.njk  exhibits.njk  …  404.njk  sitemap.njk  robots.njk
lib/site-date.js      timezone-safe date handling (America/New_York)
eleventy.config.js    image pipeline, filters, collections
.github/workflows/deploy.yml   build + deploy to GitHub Pages
```

Content lives in folders (`src/events/*.md`, etc.); the matching `*.11tydata.js`
file sets the layout, tags, breadcrumbs and per-item JSON-LD for that folder.
Listing pages (`/events/`, `/exhibits/`…) are the `src/<section>.njk` templates.

---

## How editors add content

1. Go to **`phigallery.art/admin`** → **Sign in with GitHub**.
2. Pick a collection (Events, Exhibits, Artists, Residents & Vendors, Press) → **New**.
3. Fill the form, drag in a flyer/photo (auto-resized & converted to WebP), **Publish**.
4. GitHub Actions rebuilds and deploys — **live in ~1–2 minutes**.

Hours, address, socials, the announcement banner and the homepage hero live under
**Site Settings → Gallery info** so they can change without any code edits — and the
same data feeds both the visible pages *and* the SEO schema, so it never drifts.

---

## ⚠️ Before going live — configuration checklist

These placeholders **must** be set for production. Grep for `TODO` and `phigallery.art`.

| What | Where | Notes |
|---|---|---|
| **Final domain** | `src/CNAME`, `SITE_URL` in `.github/workflows/deploy.yml`, `site_url`/`display_url` in `src/admin/config.yml` | Must all match. Candidates: `phigallery.art`, `.com`, `phigallerywatertown.com`. |
| **GitHub repo** | `backend.repo` in `src/admin/config.yml` | `owner/repo`, e.g. `phigallery/phigallery`. |
| **CMS auth Worker** | `backend.base_url` in `src/admin/config.yml` | Deploy [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) (free Cloudflare Worker) + a GitHub OAuth app; paste the Worker URL. |
| **GA4 id** | repo → Settings → Secrets and variables → Actions → **Variables** → `GA4_ID` | e.g. `G-XXXXXXX`. Left empty, the tag is simply omitted. |
| **Contact form** (optional) | Variable `FORMSPREE_ID` | Free [Formspree](https://formspree.io) form id enables the `/contact/` form. |
| **Newsletter** (optional) | Variable `BUTTONDOWN_USER` | Free [Buttondown](https://buttondown.email) username enables the homepage signup. |
| **Real content** | CMS / `src/` | Replace the sample events/exhibits/artists and the `artist-*` placeholder photos and bios. |
| **Google Business Profile** | (off-site) | **The #1 SEO action.** Claim it, fix the address to 88 Public Square, set hours, add photos, gather reviews. See `PLAN.md §4`. |

Then enable **GitHub Pages → Source: GitHub Actions**, point apex + `www` DNS at
Pages, and submit `sitemap.xml` to Google Search Console + Bing.

---

## SEO built in

- `ArtGallery`/`MusicVenue` JSON-LD sitewide; `Event` JSON-LD on every event page
  (eligible for Google's event surfaces); `BreadcrumbList` on inner pages.
- Consistent NAP block in the footer of every page.
- Canonical URLs, Open Graph + Twitter cards (per-page share image = the flyer/cover),
  `sitemap.xml`, `robots.txt`, RSS at `/events/feed.xml`.
- One `<h1>` per page, semantic HTML, required alt text on images.

## Local dev notes

- **Placeholder images:** `src/assets/img/*.jpg|png` are generated by
  `scripts/gen-placeholders.mjs`. Delete them as real photos come in.
- **Fonts:** display/body faces load from Google Fonts with a condensed system
  fallback. To self-host and drop the dependency, add a `woff2` to
  `src/assets/fonts/` and an `@font-face` rule in `styles.css`.
- **Dates** are interpreted in **America/New_York**; the CMS stores local
  wall-clock times (no UTC surprises) — see `lib/site-date.js`.

## Handoff (Phase 5)

- [ ] 5-min screen recording: add an event, add an exhibit, change hours.
- [ ] One-page cheat sheet (login steps, image tips, "publish takes ~2 min").
- [ ] Dry run: have a coordinator add a real upcoming show themselves.
