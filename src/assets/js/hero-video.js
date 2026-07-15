// Progressive-enhancement hero background video. With no JS — or when the visitor
// prefers reduced motion — the hero stays the static poster image. This layers the
// muted, looping video over that image and fades it in once it's actually playing,
// so a slow connection or a blocked autoplay never leaves an empty black box.
(function () {
  var v = document.querySelector(".hero__video");
  if (!v) return;

  // Respect the visitor's motion preference — keep the still image.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function addSource(src, type) {
    if (!src) return;
    var s = document.createElement("source");
    s.src = src;
    s.type = type;
    v.appendChild(s);
  }
  // WebM (smaller) first so supporting browsers prefer it; MP4 is the fallback.
  addSource(v.dataset.webm, "video/webm");
  addSource(v.dataset.mp4, "video/mp4");

  v.addEventListener("playing", function () {
    v.classList.add("is-playing");
  });

  v.load();
  var p = v.play();
  if (p && p.catch) p.catch(function () { /* autoplay blocked — poster stays */ });
})();
