import { place } from "../_data/schema.js";
import { siteDate } from "../../lib/site-date.js";

const toISO = (v) => {
  const dt = siteDate(v);
  return dt.isValid ? dt.toISO() : undefined;
};

// Applies to every file inside src/events/ (individual events).
export default {
  layout: "event.njk",
  tags: ["event"],
  navKey: "events",
  ogType: "article",
  eleventyComputed: {
    breadcrumbs: (data) => [
      { label: "Home", url: "/" },
      { label: "Events", url: "/events/" },
      { label: data.title },
    ],
    // Share image defaults to the event's flyer.
    shareImage: (data) => data.flyer || data.site.defaultShareImage,
    description: (data) => data.summary || data.settings.tagline,

    // Event JSON-LD → eligible for Google's event surfaces.
    jsonld: (data) => {
      const abs = (p) => (p ? new URL(p, data.site.url).toString() : undefined);
      const type =
        (data.labels.eventSchemaType && data.labels.eventSchemaType[data.type]) ||
        "Event";

      const offers =
        data.free || data.ticketUrl || data.price
          ? {
              "@type": "Offer",
              url: data.ticketUrl || abs(data.page.url),
              price: data.free ? "0" : undefined,
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
            }
          : undefined;

      const performer = Array.isArray(data.performers)
        ? data.performers.map((p) => ({ "@type": "PerformingGroup", name: p }))
        : undefined;

      return {
        "@context": "https://schema.org",
        "@type": type,
        name: data.title,
        startDate: toISO(data.start),
        endDate: toISO(data.end),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { ...place, url: data.site.url },
        image: data.flyer ? [abs(data.flyer)] : undefined,
        description: data.summary || undefined,
        url: abs(data.page.url),
        organizer: {
          "@type": "Organization",
          name: place.name,
          url: data.site.url,
        },
        ...(performer ? { performer } : {}),
        ...(offers ? { offers } : {}),
      };
    },
  },
};
