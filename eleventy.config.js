import { DateTime } from "luxon";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import { siteDate, exhibitStatus, TZ } from "./lib/site-date.js";

export default function (eleventyConfig) {
  // ---- Responsive images ----------------------------------------------------
  // The HTML transform plugin rewrites every local <img> in the output into an
  // optimized <picture> (WebP + fallback, srcset). Unlike an async shortcode it
  // works inside includes, loops and markdown — which is why we use it here.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["webp", "auto"],
    widths: ["auto", 400, 800, 1200, 1600],
    failOnError: true,
    urlPath: "/assets/img/optimized/",
    outputDir: "./_site/assets/img/optimized/",
    sharpWebpOptions: { quality: 78 },
    sharpJpegOptions: { quality: 80, mozjpeg: true },
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(min-width: 1000px) 900px, 100vw",
    },
  });

  // ---- Passthrough ----------------------------------------------------------
  eleventyConfig.addPassthroughCopy({ "src/assets/css": "assets/css" });
  eleventyConfig.addPassthroughCopy({ "src/assets/js": "assets/js" });
  eleventyConfig.addPassthroughCopy({ "src/assets/img": "assets/img" });
  eleventyConfig.addPassthroughCopy({ "src/assets/video": "assets/video" });
  eleventyConfig.addPassthroughCopy({ "src/assets/uploads": "assets/uploads" });
  eleventyConfig.addPassthroughCopy({ "src/assets/fonts": "assets/fonts" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.ico": "favicon.ico" });
  eleventyConfig.addPassthroughCopy({ "src/apple-touch-icon.png": "apple-touch-icon.png" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });

  // The CMS admin is a static SPA — copy it verbatim, don't run it through the
  // template pipeline (otherwise index.html renders as a page & hits the sitemap).
  eleventyConfig.ignores.add("src/admin/**");

  eleventyConfig.addWatchTarget("src/assets/css/");

  // ---- Date & string filters ------------------------------------------------
  const asDate = siteDate; // robust Date|string → DateTime in the gallery TZ

  eleventyConfig.addFilter("readableDate", (value, fmt = "cccc, LLLL d, yyyy") =>
    asDate(value).setZone(TZ).toFormat(fmt)
  );
  eleventyConfig.addFilter("readableTime", (value) =>
    asDate(value).setZone(TZ).toFormat("h:mm a")
  );
  eleventyConfig.addFilter("readableDateTime", (value) =>
    asDate(value).setZone(TZ).toFormat("ccc, LLL d · h:mm a")
  );
  eleventyConfig.addFilter("isoDate", (value) => asDate(value).setZone(TZ).toISO());
  eleventyConfig.addFilter("htmlDate", (value) => asDate(value).setZone(TZ).toFormat("yyyy-LL-dd"));
  eleventyConfig.addFilter("rssDate", (value) => asDate(value).setZone(TZ).toRFC2822());
  eleventyConfig.addFilter("year", (value) => asDate(value).setZone(TZ).toFormat("yyyy"));

  // "11:00" -> "11 AM", "20:30" -> "8:30 PM"
  eleventyConfig.addFilter("time12", (t) => {
    if (!t) return "";
    const [h, m] = String(t).split(":").map(Number);
    const dt = DateTime.fromObject({ hour: h || 0, minute: m || 0 });
    return dt.toFormat(m ? "h:mm a" : "h a");
  });

  eleventyConfig.addFilter("slugify", (str) =>
    String(str)
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
  );

  eleventyConfig.addFilter("absoluteUrl", (urlPath, base) => {
    try {
      return new URL(urlPath, base).toString();
    } catch {
      return urlPath;
    }
  });

  // Limit / take-N helper for the homepage lists.
  eleventyConfig.addFilter("take", (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : arr));

  // Safely serialize a value for JSON-LD embedded in a <script> tag: escape "<"
  // (blocks a </script> breakout) and the two line/paragraph separators that
  // are valid in JSON but illegal inside a JS string literal.
  eleventyConfig.addFilter("jsonify", (obj) =>
    JSON.stringify(obj, null, 2)
      .replace(/</g, "\\u003c")
      .replace(/\u2028/g, "\\u2028")
      .replace(/\u2029/g, "\\u2029")
  );

  // Strip markdown/html to a plain-text excerpt for meta descriptions.
  eleventyConfig.addFilter("excerpt", (content, len = 160) => {
    if (!content) return "";
    const text = String(content)
      .replace(/<[^>]+>/g, " ")
      .replace(/[#*_>`\[\]()!]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > len ? text.slice(0, len - 1).trimEnd() + "…" : text;
  });

  // ---- Collections ----------------------------------------------------------
  const now = () => DateTime.now().setZone(TZ);

  const eventEnd = (item) => {
    const d = item.data.end || item.data.start;
    return asDate(d).setZone(TZ);
  };
  const eventStart = (item) => asDate(item.data.start).setZone(TZ);

  eleventyConfig.addCollection("upcomingEvents", (api) =>
    api
      .getFilteredByTag("event")
      .filter((i) => eventEnd(i) >= now())
      .sort((a, b) => eventStart(a).toMillis() - eventStart(b).toMillis())
  );

  eleventyConfig.addCollection("pastEvents", (api) =>
    api
      .getFilteredByTag("event")
      .filter((i) => eventEnd(i) < now())
      .sort((a, b) => eventStart(b).toMillis() - eventStart(a).toMillis())
  );

  // Newest-first, for the RSS feed.
  eleventyConfig.addCollection("eventsFeed", (api) =>
    api
      .getFilteredByTag("event")
      .sort((a, b) => eventStart(b).toMillis() - eventStart(a).toMillis())
      .slice(0, 25)
  );

  const statusOf = (i) =>
    i.data.computedStatus || exhibitStatus(i.data.openDate, i.data.closeDate);

  eleventyConfig.addCollection("exhibitsSorted", (api) => {
    const rank = { current: 0, upcoming: 1, past: 2 };
    return api
      .getFilteredByTag("exhibit")
      .sort((a, b) => {
        const r = rank[statusOf(a)] - rank[statusOf(b)];
        if (r !== 0) return r;
        return asDate(b.data.openDate).toMillis() - asDate(a.data.openDate).toMillis();
      });
  });

  // Pre-grouped exhibit collections (avoids fragile template-side filtering).
  const exhibitsByStatus = (api, status) =>
    api
      .getFilteredByTag("exhibit")
      .filter((i) => statusOf(i) === status)
      .sort((a, b) => asDate(b.data.openDate).toMillis() - asDate(a.data.openDate).toMillis());
  eleventyConfig.addCollection("exhibitsCurrent", (api) => exhibitsByStatus(api, "current"));
  eleventyConfig.addCollection("exhibitsUpcoming", (api) => exhibitsByStatus(api, "upcoming"));
  eleventyConfig.addCollection("exhibitsPast", (api) => exhibitsByStatus(api, "past"));

  const artistRank = { coordinator: 0, exhibitor: 1, musician: 2, other: 3 };
  const sortArtists = (list) =>
    list.sort((a, b) => {
      const r = (artistRank[a.data.role] ?? 9) - (artistRank[b.data.role] ?? 9);
      if (r !== 0) return r;
      return (a.data.order ?? 99) - (b.data.order ?? 99);
    });
  eleventyConfig.addCollection("artistsSorted", (api) =>
    sortArtists(api.getFilteredByTag("artist"))
  );
  eleventyConfig.addCollection("artistsCoordinators", (api) =>
    sortArtists(api.getFilteredByTag("artist").filter((i) => i.data.role === "coordinator"))
  );
  eleventyConfig.addCollection("artistsOthers", (api) =>
    sortArtists(
      api.getFilteredByTag("artist").filter((i) => i.data.role !== "coordinator" || i.data.alsoExhibiting)
    )
  );

  const sortPartners = (list) =>
    list.sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99));
  eleventyConfig.addCollection("partnersSorted", (api) =>
    sortPartners(api.getFilteredByTag("partner"))
  );
  eleventyConfig.addCollection("partnersResidents", (api) =>
    sortPartners(api.getFilteredByTag("partner").filter((i) => i.data.category === "resident"))
  );
  eleventyConfig.addCollection("partnersVendors", (api) =>
    sortPartners(api.getFilteredByTag("partner").filter((i) => i.data.category === "vendor"))
  );

  eleventyConfig.addCollection("pressSorted", (api) =>
    api
      .getFilteredByTag("pressMention")
      .sort((a, b) => asDate(b.data.date).toMillis() - asDate(a.data.date).toMillis())
  );

  // ---- Config ---------------------------------------------------------------
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html", "11ty.js"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: "/",
  };
}
