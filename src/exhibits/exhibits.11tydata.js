import { exhibitStatus } from "../../lib/site-date.js";

export default {
  layout: "exhibit.njk",
  tags: ["exhibit"],
  navKey: "exhibits",
  ogType: "article",
  eleventyComputed: {
    computedStatus: (data) => exhibitStatus(data.openDate, data.closeDate),
    breadcrumbs: (data) => [
      { label: "Home", url: "/" },
      { label: "Exhibits", url: "/exhibits/" },
      { label: data.title },
    ],
    shareImage: (data) =>
      data.cover ||
      (data.gallery && data.gallery[0] && data.gallery[0].image) ||
      data.site.defaultShareImage,
    description: (data) => data.summary || data.settings.tagline,
  },
};
