t default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/gmail/auth") {
      const scope = "https://www.googleapis.com/auth/gmail.readonly";
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.GMAIL_REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
      return Response.redirect(authUrl, 302);
    }

    if (path === "/api/gmail/callback") {
      const code = url.searchParams.get("code");
      const r = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code, client_id: env.GMAIL_CLIENT_ID,
          client_secret: env.GMAIL_CLIENT_SECRET,
          redirect_uri: env.GMAIL_REDIRECT_URI,
          grant_type: "authorization_code"
        })
      });
      const tokens = await r.json();
      if (!r.ok) return new Response(JSON.stringify(tokens), {status:500});
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS aurion_gmail_tokens(id INTEGER PRIMARY KEY, tokens_json TEXT, updated_at TEXT)").run();
      await env.DB.prepare("INSERT INTO aurion_gmail_tokens(id,tokens_json,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET tokens_json=excluded.tokens_json, updated_at=excluded.updated_at)").bind(JSON.stringify(tokens), new Date().toISOString()).run();
      return Response.redirect("https://aurion-invay.pages.dev/?gmail=connected", 302);
    }

    if (path === "/api/gmail/status") {
      try {
        const row = await env.DB.prepare("SELECT updated_at FROM aurion_gmail_tokens WHERE id=1").first();
        return new Response(JSON.stringify({connected: !!row, updatedAt: row?.updated_at || null}), {headers: {"content-type":"application/json","access-control-allow-origin":"*"}});
      } catch(e) {
        return new Response(JSON.stringify({connected:false}), {headers: {"content-type":"application/json"}});
      }
    }

    // Sabse Important Line - Portal ko tootne se bachati hai
    return env.ASSETS.fetch(request);
  }
}
