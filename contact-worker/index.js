// =============================================================================
// Phi Gallery — contact form relay (Cloudflare Worker → Resend)
//
// The static site (GitHub Pages) can't hold a secret API key, so the contact
// form POSTs here; this Worker validates and sends the email via Resend with the
// key kept server-side.
//
// Deploy:  cd contact-worker && npx wrangler deploy
// Secret:  npx wrangler secret put RESEND_API_KEY
// Vars:    edit [vars] in wrangler.toml (TO_EMAIL, FROM_EMAIL, ALLOWED_ORIGIN)
// =============================================================================

const cors = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Requested-With",
  "Vary": "Origin",
});

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: cors(origin) });
    }

    // JS enhances the form and sets this header; native (no-JS) POSTs won't.
    const wantsJson = request.headers.get("x-requested-with") === "fetch";
    const reply = (ok, message, status) => {
      status = status || (ok ? 200 : 400);
      if (wantsJson) {
        return new Response(JSON.stringify({ ok, message }), {
          status,
          headers: { "Content-Type": "application/json", ...cors(origin) },
        });
      }
      const back = (env.ALLOWED_ORIGIN || "") + "/contact/";
      return new Response(
        `<!doctype html><html lang="en"><meta charset="utf-8">` +
          `<meta name="viewport" content="width=device-width, initial-scale=1">` +
          `<title>${ok ? "Message sent" : "Something went wrong"} — Phi Gallery</title>` +
          `<body style="font-family:system-ui,sans-serif;background:#0b0b0d;color:#f4f1ea;margin:0;padding:4rem 1.5rem;text-align:center">` +
          `<h1 style="font-size:1.6rem">${ok ? "Thanks — your message is on its way." : "Sorry, that didn't send."}</h1>` +
          `<p style="color:#b7b3aa">${message}</p>` +
          `<p><a style="color:#e8b84b" href="${back}">← Back to Phi Gallery</a></p>`,
        { status, headers: { "Content-Type": "text/html; charset=utf-8", ...cors(origin) } }
      );
    };

    // ---- Parse (supports fetch FormData, native form POST, and JSON) --------
    let data;
    try {
      const ct = request.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await request.json();
      } else {
        data = Object.fromEntries((await request.formData()).entries());
      }
    } catch {
      return reply(false, "We couldn't read that submission.");
    }

    // ---- Honeypot: real people never fill "company" -------------------------
    if ((data.company || "").toString().trim() !== "") {
      return reply(true, "Thanks."); // silently accept, don't email
    }

    const name = (data.name || "").toString().trim();
    const email = (data.email || "").toString().trim();
    const topic = (data.topic || "General question").toString().trim();
    const message = (data.message || "").toString().trim();

    if (!name || !email || !message) {
      return reply(false, "Please add your name, email, and a message.");
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 254) {
      return reply(false, "That email address doesn't look right.");
    }
    if (message.length > 5000) {
      return reply(false, "That message is a little too long — please trim it.");
    }

    // ---- Send via Resend ----------------------------------------------------
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let res;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL,
          to: [env.TO_EMAIL],
          reply_to: email,
          subject: `[${topic}] Phi Gallery contact — ${name}`,
          text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
          html:
            `<p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;<br>` +
            `<strong>Topic:</strong> ${esc(topic)}</p>` +
            `<p style="white-space:pre-wrap">${esc(message)}</p>`,
        }),
      });
    } catch {
      return reply(false, "Our email service is unreachable right now. Please email us directly.", 502);
    }

    if (!res.ok) {
      return reply(false, "Our email service returned an error. Please email us directly.", 502);
    }
    return reply(true, "We'll get back to you soon.");
  },
};
