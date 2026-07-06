// Human-readable labels for the controlled vocabularies used across the CMS.
export default {
  eventTypes: {
    music: "Live Music",
    "exhibit-opening": "Exhibit Opening",
    workshop: "Workshop",
    "sound-healing": "Sound Healing",
    market: "Market",
    other: "Event",
  },
  // schema.org Event subtypes for JSON-LD.
  eventSchemaType: {
    music: "MusicEvent",
    "exhibit-opening": "VisualArtsEvent",
    workshop: "EducationEvent",
    "sound-healing": "Event",
    market: "Event",
    other: "Event",
  },
  roles: {
    coordinator: "Coordinator",
    exhibitor: "Exhibiting Artist",
    musician: "Musician",
    other: "Artist",
  },
  exhibitStatus: {
    current: "Now Showing",
    upcoming: "Upcoming",
    past: "Past",
  },
  partnerCategories: {
    resident: "Resident",
    vendor: "Vendor",
  },
};
