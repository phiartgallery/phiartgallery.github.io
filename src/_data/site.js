import settings from "./settings.json" with { type: "json" };

/**
 * Build-time site configuration. Editors change NAP / hours / socials in
 * settings.json (via the CMS); everything here is developer-owned wiring.
 *
 * ⚠️  Set `url` to the final production domain once it's purchased & pointed at
 *     GitHub Pages. It must match the CNAME file and the canonical/OG tags.
 */
export default {
  // Placeholder domain — see PLAN §1 (candidates: phigallery.art / .com / phigallerywatertown.com).
  url: process.env.SITE_URL || "https://phigallery.art",

  lang: "en",
  locale: "en_US",

  // Google Analytics 4 — leave empty to omit the tag in dev/preview builds.
  ga4Id: process.env.GA4_ID || "",

  // Default social-share image (used when a page supplies no better one).
  defaultShareImage: "/assets/img/og-default.jpg",

  // Optional free-tier integrations. Leave empty to hide the related UI.
  // Formspree form id → powers the /contact/ form (formspree.io/f/<id>).
  formspreeId: process.env.FORMSPREE_ID || "",
  // Buttondown username → powers the newsletter signup on the homepage.
  buttondownUser: process.env.BUTTONDOWN_USER || "",

  // Convenience re-exports so templates can read `site.name` etc.
  name: settings.name,
  tagline: settings.tagline,
  instagramUrl: settings.instagram
    ? `https://www.instagram.com/${settings.instagram.replace(/^@/, "")}/`
    : "",

  // sameAs targets for LocalBusiness JSON-LD.
  sameAs: [
    settings.instagram ? `https://www.instagram.com/${settings.instagram.replace(/^@/, "")}/` : null,
    settings.googleBusinessUrl || null,
  ].filter(Boolean),
};
