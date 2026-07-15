import settings from "./settings.json" with { type: "json" };
import site from "./site.js";

const abs = (p) => new URL(p, site.url).toString();

const dayMap = {
  Monday: "Monday",
  Tuesday: "Tuesday",
  Wednesday: "Wednesday",
  Thursday: "Thursday",
  Friday: "Friday",
  Saturday: "Saturday",
  Sunday: "Sunday",
};

const openingHours = settings.hours
  .filter((h) => !h.closed && h.open && h.close)
  .map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: `https://schema.org/${dayMap[h.day]}`,
    opens: h.open,
    closes: h.close,
  }));

const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: settings.address.street,
  addressLocality: settings.address.city,
  addressRegion: settings.address.region,
  postalCode: settings.address.postalCode,
  addressCountry: settings.address.country,
};

// Reusable place block for Event JSON-LD.
export const place = {
  "@type": "Place",
  name: settings.name,
  address: postalAddress,
};

// Sitewide ArtGallery (a LocalBusiness subtype).
export const organization = {
  "@context": "https://schema.org",
  "@type": ["ArtGallery", "MusicVenue"],
  "@id": abs("/#gallery"),
  name: settings.name,
  description: settings.tagline,
  url: site.url,
  image: abs(settings.hero.image),
  logo: abs("/assets/img/logo.webp"),
  address: postalAddress,
  geo: {
    "@type": "GeoCoordinates",
    latitude: settings.geo.lat,
    longitude: settings.geo.lng,
  },
  ...(settings.phone ? { telephone: settings.phone } : {}),
  ...(settings.email ? { email: settings.email } : {}),
  ...(openingHours.length ? { openingHoursSpecification: openingHours } : {}),
  ...(site.sameAs.length ? { sameAs: site.sameAs } : {}),
  foundingDate: settings.founded,
  priceRange: "$",
};

export default { organization, place };
