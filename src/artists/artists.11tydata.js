export default {
  layout: "artist.njk",
  tags: ["artist"],
  navKey: "artists",
  ogType: "profile",
  eleventyComputed: {
    breadcrumbs: (data) => [
      { label: "Home", url: "/" },
      { label: "Artists", url: "/artists/" },
      { label: data.title },
    ],
    shareImage: (data) => data.photo || data.site.defaultShareImage,
    shareImageAlt: (data) => data.photoAlt || data.title,
    description: (data) => data.summary || (data.title + " — " + (data.labels.roles[(data.roles || [])[0]] || "Artist") + " at " + data.settings.name + "."),
  },
};
