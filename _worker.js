export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const db = env.DB || env.D1 || env.INVENTORY_DB;

    const json = (o,s=200) => new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json","access-control-allow-origin":"*"}});

    if (path === "/api/gmail/status") {
      try {
        if (!db) return json({ok:true,connected:false,configured:!!env.GMAIL_CLIENT_ID, error:"DB binding not found. Set D1 binding name to DB"});
        await db.prepare("CREATE TABLE IF NOT EXISTS aurion_gmail_tokens(id INTEGER PRIMARY KEY, tokens_json TEXT, updated_at TEXT, email TEXT)").run();
        const row = await db.prepare("SELECT * FROM aurion_gmail_tokens WHERE id=1").first();
        if (!row) return json({ok:true,connected:false,email:"",updatedAt:null,configured:true});
        const tokens = JSON.parse(row.tokens_json||"{}");
        return json({ok:true,connected:true,email:row.email||tokens.email||"",updatedAt:row.updated_at,configured:true});
      } catch(e){ return json({ok:false,connected:false,error:e.message},500); }
    }

    if (path === "/api/gmail/auth") {
      const redirectUri = env.GMAIL_REDIRECT_URI || `${url.origin}/api/gmail/callback`;
      const auth = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.GMAIL_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.readonly")}&access_type=offline&prompt=consent`;
      return Response.redirect(auth,302);
    }

    if (path === "/api/gmail/callback") {
      const code = url.searchParams.get("code");
      const redirectUri = env.GMAIL_REDIRECT_URI || `${url.origin}/api/gmail/callback`;
      const r = await fetch("https://oauth2.googleapis.com/token",{
        method:"POST", headers:{"content-type":"application/x-www-form-urlencoded"},
        body:new URLSearchParams({code,client_id:env.GMAIL_CLIENT_ID,client_secret:env.GMAIL_CLIENT_SECRET,redirect_uri:redirectUri,grant_type:"authorization_code"})
      });
      const data = await r.json();
      if(!r.ok) return json({error:"token_failed",details:data,redirect_uri:redirectUri},400);

      // Get email
      let email = "";
      try{ const u = await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${data.access_token}`}}); const j=await u.json(); email=j.email||""; }catch{}

      if(db){
        await db.prepare("CREATE TABLE IF NOT EXISTS aurion_gmail_tokens(id INTEGER PRIMARY KEY, tokens_json TEXT, updated_at TEXT, email TEXT)").run();
        await db.prepare("INSERT INTO aurion_gmail_tokens(id,tokens_json,updated_at,email) VALUES(1,?,?,?,?) ON CONFLICT(id) DO UPDATE SET tokens_json=excluded.tokens_json, updated_at=excluded.updated_at, email=excluded.email)").bind(JSON.stringify(data),new Date().toISOString(),email).run();
      }
      return Response.redirect(`${url.origin}/?gmail=connected`,302);
    }

    // SPA fix - important for ?gmail=connected
    try{
      let res = await env.ASSETS.fetch(request);
      if(res.status===404 && !path.startsWith("/api/")){
        res = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
      }
      return res;
    }catch{
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    }
  }
}
