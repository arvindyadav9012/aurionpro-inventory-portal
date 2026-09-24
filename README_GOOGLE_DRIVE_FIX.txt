GOOGLE DRIVE BACKUP FIX

Why the old build returned HTTP 502:
The old Apps Script request tried to create/update every report spreadsheet, export every XLSX, create the consolidated workbook, and archive deleted records in ONE HTTP request. That can exceed the Google Apps Script execution/request window and the Cloudflare proxy then returns HTTP 502.

This build changes the flow:
1. Full backup is sent one report at a time. Each report gets its own Google Sheet and XLSX file.
2. After the individual reports finish, one separate request creates/updates the consolidated Google Sheet + XLSX.
3. Permanent Delete backs up ONLY the affected report + deleted record first. If that backup request fails, the record is NOT permanently deleted.
4. Deleted records are also archived in NMRC_INVENTORY_DELETED.
5. One page of Deleted Reports still shows 50 entries with pagination.

IMPORTANT DEPLOYMENT STEP:
The Google Apps Script code in GOOGLE_DRIVE_BACKUP.gs MUST replace the currently deployed Web App code. Then deploy a NEW VERSION of the Web App using the same Web App URL/endpoint configured in config.js. The ZIP cannot change an already-deployed Google Apps Script by itself.

After redeploying the script, test:
- Manual Google Drive backup: each report creates/updates its own XLSX + Google Sheet.
- Consolidated backup creates NMRC_INVENTORY_BACKUP.xlsx + Google Sheet.
- Permanent Delete: affected report backup succeeds first; only then is permanent deletion completed.
