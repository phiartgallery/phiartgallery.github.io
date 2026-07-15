// Progressive-enhancement hero background video. With no JS — or when the visitor
// prefers reduced motion — the hero stays the static poster image. This layers the
// muted, looping video over that image and fades it in once it's actually playing,
// so a slow connection or a blocked autoplay never leaves an empty black box.
(function () {
  var v = document.querySelector(".hero__video");
  if (!v) return;

  // Respect the visitor's motion preference — keep the still image.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // iOS autoplay: the `muted` HTML attribute alone is frequently ignored, so set the
  // flags in JS too. playsinline/webkit-playsinline stop iOS from going fullscreen.
  v.muted = true;
  v.defaultMuted = true;
  v.autoplay = true;
  v.setAttribute("muted", "");
  v.setAttribute("playsinline", "");
  v.setAttribute("webkit-playsinline", "");

  // Single H.264 MP4 — small and plays everywhere, including iOS Safari.
  if (v.dataset.mp4) {
    var s = document.createElement("source");
    s.src = v.dataset.mp4;
    s.type = "video/mp4";
    v.appendChild(s);
  }

  v.addEventListener("playing", function () {
    v.classList.add("is-playing");
  });

  v.load();
  var p = v.play();
  if (p && p.catch) p.catch(function () { /* autoplay blocked (e.g. Low Power Mode) — poster stays */ });
})();
