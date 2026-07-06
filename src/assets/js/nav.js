// Progressive-enhancement mobile nav toggle. The nav is fully usable without JS
// (it just renders open on small screens if this never runs); this adds the
// collapse behaviour + accessible state.
(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  // JS is present → start collapsed on mobile.
  nav.setAttribute("data-open", "false");
  toggle.hidden = false;

  function setOpen(open) {
    nav.setAttribute("data-open", String(open));
    toggle.setAttribute("aria-expanded", String(open));
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close on Escape and when a link is chosen.
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
})();
