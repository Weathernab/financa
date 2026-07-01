function readBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  if (typeof req.body === "string") {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve({});
    }
  }
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function validateAppsScriptUrl(value) {
  const endpoint = value || process.env.GOOGLE_APPS_SCRIPT_URL || "";
  if (!endpoint) {
    throw new Error("Vercel okoljska spremenljivka GOOGLE_APPS_SCRIPT_URL ni nastavljena, URL pa ni vpisan v aplikaciji.");
  }
  const target = new URL(endpoint);
  const allowedHost = target.hostname === "script.google.com" || target.hostname.endsWith(".googleusercontent.com");
  if (target.protocol !== "https:" || !allowedHost) {
    throw new Error("Dovoljen je samo varen Google Apps Script URL.");
  }
  return target;
}

function serverSyncKey() {
  return String(process.env.GOOGLE_APPS_SCRIPT_SYNC_KEY || "").trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(200).json({ ok: false, error: "API deluje. Za Google Sheets zahteve aplikacija uporablja POST." });
    return;
  }

  try {
    const body = await readBody(req);
    const target = validateAppsScriptUrl(body.endpoint);
    const request = { ...(body.request || {}) };
    const proxyKey = serverSyncKey();
    if (!String(request.key || "").trim() && proxyKey) request.key = proxyKey;
    let remote;

    if (request.action === "save" || request.action === "profiles-save" || request.action === "profiles-load" || request.action === "login") {
      remote = await fetch(target, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(request),
        redirect: "follow",
        signal: AbortSignal.timeout(15000),
      });
    } else {
      target.searchParams.set("action", request.action || "health");
      target.searchParams.set("key", request.key || "");
      target.searchParams.set("profileId", request.profileId || "");
      target.searchParams.set("credentialHash", request.credentialHash || "");
      remote = await fetch(target, { redirect: "follow", signal: AbortSignal.timeout(15000) });
    }

    const text = await remote.text();
    if (remote.url.includes("accounts.google.com") || !remote.headers.get("content-type")?.includes("application/json")) {
      res.status(502).json({
        ok: false,
        error: "Apps Script zahteva Google prijavo. Deployment nastavi na dostop 'Anyone' in uporabi URL /exec.",
      });
      return;
    }

    const result = JSON.parse(text);
    res.status(remote.ok && result.ok ? 200 : 502).json(result);
  } catch (error) {
    res.status(502).json({ ok: false, error: error.message || "Google Sheets zahteva ni uspela." });
  }
};
