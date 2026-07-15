# Phi Gallery contact-form Worker

A tiny Cloudflare Worker that receives the site's contact form and sends it via
[Resend](https://resend.com). Keeps the Resend API key off the static site.

Both services are free at this volume (Cloudflare Workers: 100k req/day; Resend:
3k emails/month).

## One-time setup

### 1. Resend
1. Create a Resend account and **verify the domain `phigallery.art`** (Resend
   gives you SPF/DKIM DNS records to add wherever `phigallery.art` DNS lives).
2. Create an **API key** (Sending access).

### 2. Deploy the Worker
```bash
cd contact-worker
npx wrangler login              # opens browser, authorizes Cloudflare (free acct)
npx wrangler secret put RESEND_API_KEY   # paste the Resend API key
npx wrangler deploy
```
Deploy prints the Worker URL, e.g. `https://phi-contact.<your-subdomain>.workers.dev`.

### 3. Point the site at the Worker
Add the Worker URL as a **repository Variable** named `CONTACT_ENDPOINT`
(Settings → Secrets and variables → Actions → Variables), then re-run the deploy.
Locally you can test with:
```bash
CONTACT_ENDPOINT="https://phi-contact.<your-subdomain>.workers.dev" npm run build
```

## Editing recipients / from-address
Change `[vars]` in `wrangler.toml` and re-run `npx wrangler deploy`. `FROM_EMAIL`
must be on the Resend-verified domain; `reply_to` is set to the visitor so you
can just hit Reply.

## Optional hardening
Add [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) if spam
gets through the honeypot.
