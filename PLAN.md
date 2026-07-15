# Phi Gallery — Website Plan

Static site for **Phi Gallery**, a DIY community art space + music venue at **88 Public Square, Watertown, NY 13601**. Founded 2023 by Stow Dunham; coordinated by Stow Dunham, Dana Gillan, and Mykel "Quince" & Destiny Myrick.

**Goals:** free hosting, non-technical editors with a beautiful login UI, excellent local SEO (Watertown NY + surrounding North Country), GA4 analytics, press kit.

---

## 1. Stack

| Piece | Choice | Why |
|---|---|---|
| Site generator | **Eleventy (11ty) v3** | Content-first, zero client JS by default, trivial GitHub Actions build |
| Hosting | **GitHub Pages** (deploy via Actions, not the legacy Jekyll pipeline) | Free, HTTPS on custom domain |
| CMS | **Sveltia CMS** at `/admin` | Gorgeous modern UI, dark mode, mobile-usable, **resizes + converts uploads to WebP automatically** (critical for a gallery run by non-technical artists), drop-in Decap-compatible config |
| CMS auth | **sveltia-cms-auth** Cloudflare Worker (free tier) | One-time setup; editors just click "Sign in with GitHub" at phigallery.art/admin |
| Images | Sveltia optimizes on upload + `@11ty/eleventy-img` generates responsive `srcset` at build | Fast pages even with big art photos |
| Analytics | **GA4** (free) via gtag in base layout + **Google Search Console** | |
| Domain | Custom (~$12/yr — the only recurring cost). Candidates: `phigallery.art`, `phigallery.com`, `phigallerywatertown.com` | Apex + www both pointed at Pages, HTTPS enforced |

**Repo:** create a `phigallery` GitHub **organization** (or user account) owning `phigallery/phigallery.github.io`-style repo. Each artist-manager gets their **own free GitHub account added as a collaborator** — individual logins, revocable, auditable. Avoid one shared password.

**Editor flow (what the artists experience):**
1. Go to `phigallery.art/admin` → click **Sign in with GitHub**
2. Click **Events → New Event**, fill a form, drag in the flyer image
3. Hit **Publish** → site rebuilds via Actions, live in ~90 seconds

---

## 2. Site map & sections

| URL | Section | Notes |
|---|---|---|
| `/` | **Home** | Hero (gallery photo / current show), next 3 events, current exhibit, Instagram link, newsletter signup (optional, Buttondown free tier), footer NAP block |
| `/events/` + `/events/<slug>/` | **Events & Music** | The heartbeat. Live music, workshops, sound healing, openings. Upcoming list + auto-archived past events. Each event: date/time, type tag, flyer, price/RSVP link. Emits `Event` JSON-LD → eligible for Google's event surfaces |
| `/exhibits/` + `/exhibits/<slug>/` | **Exhibits** | Current / upcoming / past. Artist(s), statement, photo gallery, run dates |
| `/artists/` + `/artists/<slug>/` | **Artists & Collective** | Coordinators + exhibiting artists: photo, bio, links, work samples |
| `/partners/` | **Residents & Vendors** | WildRoots Wellness and Revival · Holdown Upstate · Local Legendz by Tunes 92.5 · Faeried Treasure Trove · rotating artisanal vendors. Logo, blurb, link each |
| `/about/` | **About** | The story (2023, Stow, DIY collective ethos), what happens here |
| `/visit/` | **Visit** | Hours, address, embedded map, parking on the Square, accessibility, contact. This page targets "things to do in Watertown NY" queries |
| `/press/` | **Press Kit** | Web version of PRESS-KIT.md + downloadable asset ZIP |
| `/contact/` | **Contact** | Email, Instagram, booking inquiries (mailto or free Formspree tier) |
| `404.html` | | On-brand, links home |

**Design direction:** DIY poster-art aesthetic — dark ground, bold display face for headings, readable body type, show flyers as first-class visuals. Mobile-first (locals arrive from Google Maps + Instagram on phones). Minimal/zero JS; aim for Lighthouse ≥95 across the board.

---

## 3. CMS collections (Sveltia `config.yml`)

- **events** — title, start/end datetime, type (`music` / `exhibit-opening` / `workshop` / `sound-healing` / `market` / `other`), flyer image, description, price, ticket/RSVP URL, performer(s)
- **exhibits** — title, open/close dates, artists (relation), statement (markdown), image gallery
- **artists** — name, role (coordinator/exhibitor/musician), photo, bio, website/Instagram, work images
- **partners** — name, logo, blurb, URL, category (resident / vendor)
- **press** — mentions & releases: outlet, date, link or PDF
- **Singletons ("file collection"):**
  - `settings` — hours (per-day), address, phone, email, Instagram, announcement banner (e.g. "Closed for install this week")
  - `about`, `visit` page bodies

Hours live in `settings` so the artists can change them without touching code — and the templates feed the same data into visible pages **and** the JSON-LD, so it never drifts.

---

## 4. Local SEO plan

### The #1 action item (not even on the website)
**Claim the Google Business Profile.** The listing currently shows *"Own this business?"* — unclaimed — and lists the **wrong address** (88 Mill St / First Baptist Church). Claim it, correct to **88 Public Square**, set hours, category "Art gallery" (+ "Live music venue", "Event venue"), add photos, link the new domain. Then get the crew to ask friendly regulars for reviews — it currently has **zero** ("Be the first to review"), and the first ~10 reviews move the map ranking more than anything on the site will.

### On-site
- **NAP consistency:** identical name/address/phone string in the footer of every page, `/visit/`, and schema. "Phi Gallery · 88 Public Square, Watertown, NY 13601".
- **JSON-LD:**
  - `ArtGallery` (subtype of LocalBusiness) sitewide: name, address, geo, hours, sameAs (Instagram, GBP), image
  - `Event` on every event page (name, startDate, location w/ full address, offers, performer) — this is how shows get into Google's "events near me" results
  - `BreadcrumbList` on inner pages
- **Titles/descriptions** with natural local phrasing:
  - Home: `Phi Gallery — Art Gallery & Live Music on Public Square | Watertown, NY`
  - Events: `Live Music & Events in Watertown NY | Phi Gallery`
  - Visit: `Visit Phi Gallery — Downtown Watertown, NY | Hours & Directions`
- **Content targets freshness:** the events collection keeps the site alive in Google's eyes; past-event archive pages accumulate long-tail ("<band name> Watertown") equity.
- Semantic HTML, one `h1`/page, descriptive alt text on all art images (artists write it in the CMS — make it a required field with helper text).
- `sitemap.xml` (auto from 11ty), `robots.txt`, canonical URLs, OG + Twitter card meta with a per-page share image (event flyer / exhibit hero).
- Performance = ranking: static HTML + optimized images + no framework JS makes Core Web Vitals a non-issue.

### Off-site (cheap, high-leverage)
- **Google Search Console + Bing Webmaster** — verify, submit sitemap.
- **Citations/backlinks** — same NAP everywhere: Apple Maps, Yelp, Facebook page, Visit the 1000 Islands / Visit Watertown tourism listings, Greater Watertown-North Country Chamber of Commerce, NNY360 (Watertown Daily Times) events calendar, Eventbrite/Bandsintown for shows.
- **Tunes 92.5 already partners** (Local Legendz) — get a link from their site; local radio backlink is gold.
- Instagram bio → the new domain.

---

## 5. Analytics

- GA4 property, gtag snippet in the base layout (async, bottom of `<head>`).
- Mark as key events: outbound ticket-link clicks, directions clicks, Instagram clicks, press-kit downloads.
- Small tasteful footer notice + link to a one-paragraph privacy page (NY doesn't mandate a consent banner for basic analytics; keep it honest and lightweight).
- Share GA + Search Console read access with the gallery's Google account so the crew can see their own numbers.

---

## 6. Build phases

**Phase 0 — Gather (blockers, mostly on the gallery):**
- [x] Confirm address: **88 Public Square** ✅
- [ ] Buy domain; pick final name with Stow
- [ ] Confirm hours, contact email, phone (Google shows none), Instagram handle
- [ ] Collect assets: logo (vector if it exists), 10–15 hi-res photos (interior, exterior on the Square, events/crowds, art install shots), coordinator headshots + 2-sentence bios
- [ ] Create GitHub org + accounts for each editor

**Phase 1 — Scaffold:**
- [ ] 11ty project: base layout, design tokens, nav/footer w/ NAP, GH Actions → Pages deploy, custom domain + HTTPS
- [ ] Templates for all sections in §2, eleventy-img pipeline, 404

**Phase 2 — CMS:**
- [ ] Sveltia `/admin` + `config.yml` per §3; deploy sveltia-cms-auth Worker; register GitHub OAuth app
- [ ] Set media folder + upload size guidance; test full publish loop from a *non-admin* collaborator account

**Phase 3 — Content:**
- [ ] Load real events/exhibits/artists/partners; About + Visit copy; press page from PRESS-KIT.md

**Phase 4 — SEO + Analytics:**
- [ ] JSON-LD, meta, sitemap, OG images; GA4; Search Console + Bing; **claim & fix Google Business Profile**; citation sweep (§4)

**Phase 5 — Handoff:**
- [ ] 5-minute screen recording: "add an event, add an exhibit, change hours"
- [ ] One-page printable cheat sheet (URL, login steps, image size tips, "publish takes ~2 min")
- [ ] Dry run with Stow or Dana adding a real upcoming show themselves

---

## 7. Costs

| Item | Cost |
|---|---|
| GitHub Pages, Actions, Sveltia, Cloudflare Worker, GA4, Search Console, Formspree/Buttondown free tiers | $0 |
| Domain | ~$12/yr |
| **Total** | **~$12/yr** |
