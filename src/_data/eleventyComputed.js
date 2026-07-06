// Per-page computed data (runs for every page with the full data cascade).
export default {
  // BreadcrumbList JSON-LD derived from a page's `breadcrumbs` front matter:
  //   breadcrumbs: [{ label: "Events", url: "/events/" }, { label: "This show" }]
  breadcrumbsLd: (data) => {
    const crumbs = data.breadcrumbs;
    if (!Array.isArray(crumbs) || crumbs.length === 0) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.label,
        ...(c.url ? { item: new URL(c.url, data.site.url).toString() } : {}),
      })),
    };
  },
};
