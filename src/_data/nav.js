// Primary navigation. Order matters; `key` matches the `navKey` set in each
// section's front matter so the current item can be highlighted.
export default {
  primary: [
    { key: "events", label: "Events", url: "/events/" },
    { key: "exhibits", label: "Exhibits", url: "/exhibits/" },
    { key: "artists", label: "Artists", url: "/artists/" },
    { key: "partners", label: "Partners", url: "/partners/" },
    { key: "about", label: "About", url: "/about/" },
    { key: "visit", label: "Visit", url: "/visit/" },
  ],
  // Secondary links surfaced in the footer only.
  footer: [
    { key: "press", label: "Press", url: "/press/" },
    { key: "contact", label: "Contact", url: "/contact/" },
    { key: "privacy", label: "Privacy", url: "/privacy/" },
  ],
};
