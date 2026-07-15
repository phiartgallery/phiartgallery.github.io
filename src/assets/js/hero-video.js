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

  function addSource(src, type) {
    if (!src) return;
    var s = document.createElement("source");
    s.src = src;
    s.type = type;
    v.appendChild(s);
  }

  // Only hand WebM to browsers that *definitely* decode VP9 (Chrome/Firefox report
  // "probably"). iOS Safari reports "maybe"/"" and, if given the WebM source, latches
  // onto it and stalls instead of falling through — so gate it and let Safari take
  // the universally-supported H.264 MP4.
  var webmOk =
    !!v.canPlayType && v.canPlayType('video/webm; codecs="vp9"') === "probably";
  if (webmOk) addSource(v.dataset.webm, "video/webm");
  addSource(v.dataset.mp4, "video/mp4");

  v.addEventListener("playing", function () {
    v.classList.add("is-playing");
  });

  v.load();
  var p = v.play();
  if (p && p.catch) p.catch(function () { /* autoplay blocked (e.g. Low Power Mode) — poster stays */ });
})();
