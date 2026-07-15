// Progressive enhancement for the contact form: submit via fetch to the
// Cloudflare Worker and show inline feedback. Without JS, the form still POSTs
// natively (the Worker returns a plain thank-you page).
(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("contact-status");
  var btn = form.querySelector('button[type="submit"]');

  function setStatus(msg, kind) {
    if (!status) return;
    status.textContent = msg;
    status.className = "form-status" + (kind ? " is-" + kind : "");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
    setStatus("", null);

    fetch(form.action, {
      method: "POST",
      headers: { "X-Requested-With": "fetch", Accept: "application/json" },
      body: new FormData(form),
    })
      .then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok && j.ok, message: j.message }; });
      })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          form.style.display = "none";
          setStatus(res.message || "Thanks — your message was sent.", "ok");
        } else {
          setStatus(res.message || "Something went wrong. Please email us directly.", "error");
        }
      })
      .catch(function () {
        setStatus("Network error — please email us directly.", "error");
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = "Send message"; }
      });
  });
})();
