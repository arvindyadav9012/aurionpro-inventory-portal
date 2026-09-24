NMRC INVENTORY V41.0 - ADMIN PORTAL PACKAGE

Purpose:
- Preserve the existing V40.5 dashboard, sidebar/menu and workflow.
- Add central live sync through Cloudflare Worker -> existing D1.
- Portal polls central state every 1.5 seconds and pushes changes immediately.
- Admin user changes, equipment/report changes and agent entries are shared through the central API.
- Google Drive backup hook remains available.

Deployment:
1. Deploy worker.js with the existing D1 binding (env.DB).
2. Route the Worker API at /api or set config.js NMRC INVENTORY_API_BASE to the deployed API.
3. Keep the existing D1 database/tables; worker only creates aurion_sync_state if absent.

Important:
This package does not delete or replace existing D1 tables. It is a compatibility/live-sync layer.

CCR ADDITIVE REPORT:
- Added CCR Transaction Screenshot Report as a separate report/role.
- Multiple payment screenshots can be OCR processed into separate rows.
- CCR users can be restricted to this report through the existing Admin User Creation permission system.
- Existing records and existing D1 tables are preserved.

CCR FINAL MODULE
- Gmail is the primary complaint source.
- New Gmail complaints are imported automatically while the portal is open.
- Manual screenshot upload is a backup.
- Reply is prepared automatically but sent manually by CCR.
- Final report tracks Replied By, Reply Date & Time, Reply Status, and Resolution Status.
