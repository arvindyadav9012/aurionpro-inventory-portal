# NMRC Inventory V40 Live Sync Package

This package keeps the existing V40 portal UI/workflow intact. The live layer is additive: it adds central D1 persistence/synchronization, Google Drive backup endpoint configuration, and Final Summary Excel export.

## What is preserved
- Existing dashboard design and Metro hero image
- Existing sidebar/menu and report workflow
- Existing report fields and permissions UI
- Existing local browser backup/restore
- Existing D1 database is NOT dropped, renamed, or migrated destructively

## Live sync
`config.js` controls the API:
- `NMRC INVENTORY_API_BASE`: use `/api` when the Worker is routed behind the same site; for an APK use the full Worker/API URL.
- `NMRC INVENTORY_API_KEY`: optional shared API key.
- Sync pulls the central state and polls every 3 seconds.
- Every save is pushed to `/api/state`.

The included `worker.js` creates only `aurion_sync_state` if it does not exist. It does not delete or alter existing tables. For production, authentication should be moved to dedicated D1 user tables rather than storing passwords in a shared state blob.

## Google Drive backup
Set `NMRC INVENTORY_DRIVE_BACKUP_URL` to a secured Google Apps Script Web App or backend endpoint that writes the received JSON backup into the chosen Google Drive folder. The portal already has a **Google Drive Backup** control in the existing Theme Setting / Backup page.

The ZIP does not contain a Google account credential or OAuth token. Those must be authorized in the user's Google account/backend endpoint.

## Final Summary Excel
The existing Excel control now exports the actual generated **Final Summary Report** rows (not the empty `state.records.summary` array). The Theme Setting / Backup page also has a **Final Summary Excel** control.

## Deployment
1. Bind `DB` in the Worker to the user's existing D1 database.
2. Deploy the Worker and route `/api/*` to it, or put its full URL in `config.js` for the APK.
3. Configure `NMRC INVENTORY_API_KEY` as a Worker secret if desired and put the same key in the APK/web config.
4. Configure a secured Google Drive backup endpoint and put its URL in `NMRC INVENTORY_DRIVE_BACKUP_URL`.
5. Verify `/api/health` before enabling production use.

Do not create a new D1 database if the intention is to keep the existing data. The included schema only creates the additive `aurion_sync_state` table.
