NMRC INVENTORY V41.0 — FINAL PORTAL PACKAGE

This package preserves the existing dashboard/menu/report UI and adds the central live-sync API Worker layer.

LIVE FLOW
Admin Portal -> Worker API -> existing D1
Android APK -> Worker API -> existing D1
APK polls central state every 1.5 seconds; portal changes therefore become visible in the APK without rebuilding the APK.

The included worker.js requires an existing D1 binding named DB. Configure it in wrangler.toml / Cloudflare Worker bindings. Do not delete or replace existing D1 tables.

Google Drive backup remains an integration endpoint provision in config.js; Google authorization must be configured separately.


CCR GMAIL FINAL
---------------
The CCR module uses Gmail as the primary complaint source. Manual screenshot upload is retained as backup. Replies are never sent automatically. The live-domain OAuth callback is configured for https://aurion-invay.pages.dev/api/gmail/callback.
