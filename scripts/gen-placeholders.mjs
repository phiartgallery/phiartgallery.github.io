// Generates poster-style placeholder images so the site builds & looks complete
// out of the box. Real photos replace these via the CMS (uploaded to
// src/assets/uploads). Run with: npm run placeholders
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = "src/assets/img";
const INK = "#0b0b0d";
const PAPER = "#f4f1ea";
const GOLD = "#e8b84b";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Abstract poster: hue-tinted gradient, big φ watermark, golden-ratio arcs.
// Deliberately text-free — cards/hero render their own titles in HTML, and
// object-fit crops would clip any baked-in type.
function posterSVG({ w, h, hue = 40 }) {
  const c1 = `hsl(${hue}, 45%, 16%)`;
  const c2 = `hsl(${(hue + 40) % 360}, 40%, 7%)`;
  const m = Math.min(w, h);
  const phiSize = Math.round(m * 1.15);
  // Concentric arcs stepped by 1/φ, anchored off the top-right corner
  const cx = w * 0.82;
  const cy = h * 0.18;
  const r1 = m * 0.78;
  const r2 = r1 / 1.618;
  const r3 = r2 / 1.618;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="v" cx="0.3" cy="0.2" r="1">
      <stop offset="0" stop-color="rgba(232,184,75,0.14)"/>
      <stop offset="0.6" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${INK}"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#v)"/>
  <circle cx="${cx}" cy="${cy}" r="${r1}" fill="none" stroke="${GOLD}" stroke-opacity="0.10" stroke-width="${Math.max(2, m * 0.004)}"/>
  <circle cx="${cx}" cy="${cy}" r="${r2}" fill="none" stroke="${GOLD}" stroke-opacity="0.08" stroke-width="${Math.max(2, m * 0.004)}"/>
  <circle cx="${cx}" cy="${cy}" r="${r3}" fill="none" stroke="${PAPER}" stroke-opacity="0.06" stroke-width="${Math.max(2, m * 0.004)}"/>
  <text x="${w * 0.5}" y="${h * 0.52}" font-family="Georgia, 'Times New Roman', serif"
        font-size="${phiSize}" fill="${PAPER}" fill-opacity="0.06"
        text-anchor="middle" dominant-baseline="central">&#966;</text>
</svg>`;
}

// Social share card (1200×630). Text is the point here — it renders at a fixed
// size, never cropped, so baked type is safe.
function ogSVG({ w, h, title, subtitle, hue = 38 }) {
  const c1 = `hsl(${hue}, 45%, 16%)`;
  const c2 = `hsl(${(hue + 40) % 360}, 40%, 7%)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${INK}"/>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <text x="${w * 0.5}" y="${h * 0.40}" font-family="Georgia, 'Times New Roman', serif"
        font-size="${h * 0.9}" fill="${PAPER}" fill-opacity="0.06"
        text-anchor="middle" dominant-baseline="central">&#966;</text>
  <rect x="${w * 0.5 - 60}" y="${h * 0.30}" width="120" height="5" fill="${GOLD}"/>
  <text x="${w * 0.5}" y="${h * 0.52}" font-family="'Arial Narrow', Arial, sans-serif"
        font-size="${Math.round(h * 0.19)}" font-weight="800" letter-spacing="2" fill="${PAPER}"
        text-anchor="middle">${esc((title || "").toUpperCase())}</text>
  <text x="${w * 0.5}" y="${h * 0.68}" font-family="Arial, sans-serif"
        font-size="${Math.round(h * 0.05)}" letter-spacing="8" fill="${GOLD}" font-weight="700"
        text-anchor="middle">${esc((subtitle || "").toUpperCase())}</text>
</svg>`;
}

// Simple wordmark on transparent background (partner logos).
function logoSVG({ w = 480, h = 240, name }) {
  const size = name.length > 14 ? 40 : 52;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <circle cx="${w / 2}" cy="${h * 0.34}" r="26" fill="none" stroke="${GOLD}" stroke-width="4"/>
  <text x="${w / 2}" y="${h * 0.34}" font-family="Georgia, serif" font-size="34" fill="${GOLD}"
        text-anchor="middle" dominant-baseline="central">&#966;</text>
  <text x="${w / 2}" y="${h * 0.72}" font-family="'Arial Narrow', Arial, sans-serif" font-weight="800"
        font-size="${size}" letter-spacing="1" fill="${PAPER}" text-anchor="middle">${esc(
    name.toUpperCase()
  )}</text>
</svg>`;
}

const posters = [
  { file: "hero-gallery.jpg", w: 2400, h: 1500, hue: 38 },
  // Event flyers (portrait)
  { file: "flyer-sound-bath.jpg", w: 1000, h: 1250, hue: 275 },
  { file: "flyer-noise-night.jpg", w: 1000, h: 1250, hue: 8 },
  { file: "flyer-zine-lab.jpg", w: 1000, h: 1250, hue: 150 },
  { file: "flyer-makers-market.jpg", w: 1000, h: 1250, hue: 28 },
  { file: "flyer-thresholds-opening.jpg", w: 1000, h: 1250, hue: 205 },
  { file: "flyer-porch-sessions.jpg", w: 1000, h: 1250, hue: 95 },
  // Exhibit covers (landscape)
  { file: "exhibit-thresholds.jpg", w: 1600, h: 1000, hue: 210 },
  { file: "exhibit-field-notes.jpg", w: 1600, h: 1000, hue: 160 },
  { file: "exhibit-winter-light.jpg", w: 1600, h: 1000, hue: 220 },
  // Exhibit gallery details (square)
  { file: "art-thresholds-1.jpg", w: 900, h: 900, hue: 210 },
  { file: "art-thresholds-2.jpg", w: 900, h: 900, hue: 218 },
  { file: "art-thresholds-3.jpg", w: 900, h: 900, hue: 226 },
  // Artist portraits (square)
  { file: "artist-stow.jpg", w: 800, h: 800, hue: 38 },
  { file: "artist-dana.jpg", w: 800, h: 800, hue: 300 },
  { file: "artist-myricks.jpg", w: 800, h: 800, hue: 170 },
  { file: "artist-june-hart.jpg", w: 800, h: 800, hue: 210 },
  { file: "artist-lowlands.jpg", w: 800, h: 800, hue: 95 },
];

const ogCards = [
  { file: "og-default.jpg", w: 1200, h: 630, title: "Phi Gallery", subtitle: "Art · Music · Community", hue: 38 },
];

const logos = [
  { file: "partner-wildroots.png", name: "WildRoots" },
  { file: "partner-holdown.png", name: "Holdown Upstate" },
  { file: "partner-local-legendz.png", name: "Local Legendz" },
  { file: "partner-faeried.png", name: "Faeried Trove" },
  { file: "partner-nc-ceramics.png", name: "NC Ceramics" },
];

await mkdir(OUT, { recursive: true });

for (const p of posters) {
  const svg = posterSVG(p);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, p.file));
  console.log("✓", p.file);
}
for (const c of ogCards) {
  const svg = ogSVG(c);
  await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, c.file));
  console.log("✓", c.file);
}
for (const l of logos) {
  const svg = logoSVG(l);
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, l.file));
  console.log("✓", l.file);
}
console.log(`\nGenerated ${posters.length + ogCards.length + logos.length} placeholder assets in ${OUT}/`);
