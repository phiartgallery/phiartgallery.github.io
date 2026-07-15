// Hero background video. The <video> carries native `autoplay muted loop playsinline`
// attributes so iOS Safari's autoplay engine sees a valid inline-autoplay video at
// parse time (JS-injected sources make iOS start then bail). This script only:
//   1. honors reduced-motion by keeping the still poster,
//   2. fades the video in once it's really playing, and
//   3. nudges playback back if iOS pauses/suspends it.
(function () {
  var v = document.querySelector(".hero__video");
  if (!v) return;

  // Reduced motion → keep the still poster; don't play or keep loading.
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    v.removeAttribute("autoplay");
    try { v.pause(); } catch (e) {}
    return;
  }

  // Belt-and-suspenders for iOS: enforce muted in JS too (the attribute alone is
  // sometimes ignored for autoplay).
  v.muted = true;
  v.defaultMuted = true;

  v.addEventListener("playing", function () {
    v.classList.add("is-playing");
  });

  function play() {
    var p = v.play();
    if (p && p.catch) p.catch(function () { /* blocked (e.g. Low Power Mode) — poster stays */ });
  }

  if (v.readyState >= 2) play();
  v.addEventListener("canplay", play, { once: true });
  // If iOS pauses it on a stall, or the tab was backgrounded, resume.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden && v.paused) play();
  });
})();
