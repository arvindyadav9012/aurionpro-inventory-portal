NMRC INVENTORY FINAL BUILD

Verified locally before packaging:
- app.js, worker.js and _worker.js Node syntax PASS
- ZIP integrity PASS
- report-specific fields and pages verified in source
- Admin-only Export Excel / Export PDF / Edit / Delete controls verified
- non-admin report navigation is permission filtered; CCR navigation is per CCR report permission
- CCR supports multiple assigned roles and independent View/Add/Edit/Delete permissions
- CCR Final Summary has exactly 21 fields
- 3-minute inactivity timeout present
- D1 binding uses existing env.DB and no destructive schema operation is included
- Gmail scope is gmail.readonly; processed message IDs are tracked
- no Gmail send API is implemented
- deleted records are archived and Admin-only restore/permanent delete is present
- Android-compatible /api/state endpoint is present
- Google Drive backup payload/sheet generation is present

External/live verification limitation:
- Actual Google Drive sync requires the user's Google Apps Script/Web App URL and authorization.
- Actual Android APK live connection requires the APK's API base URL/credentials and cannot be proven from a web ZIP alone.
- Therefore this package is code/structure tested, but those two external account connections are not claimed as live-tested.
