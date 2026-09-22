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

LOGIN/LOGOUT FIX
- Existing portal data/tables are not deleted by this change.
- Admin authentication now handles the case where an old/stale local admin_password exists but the central state has no configured admin password: the existing local password or the default admin123 can be used.
- If a central state adminPassword exists, it remains authoritative and is not overwritten.
- Logout clears the portal session and stops the live-sync polling timer before returning to the login page.
- No existing D1 tables are dropped or renamed.
