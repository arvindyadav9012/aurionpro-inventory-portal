CCR TRANSACTION SCREENSHOT REPORT - ADDITIVE MODULE

This package adds one separate report named:
CCR Transaction Screenshot Report

Existing dashboard, existing reports, existing D1 tables and existing data are preserved. The new module is additive.

CCR workflow:
1. Admin opens Master -> User Creation.
2. Create a CCR user and select only "CCR Transaction Screenshot Report".
3. Give View + Add permission. Edit/Delete can be enabled if required.
4. CCR user logs in and sees only Dashboard + CCR Transaction Report in the sidebar.
5. CCR user uploads one or multiple payment screenshots.
6. Browser OCR reads visible text and creates one row per screenshot.
7. Fields not visible in the screenshot remain blank. The module does not invent missing UTR/Gmail/IDs.
8. The report can be exported to Excel/PDF.
9. If a Gmail address is visible, Open Gmail opens a prefilled Gmail compose/reply window with recipient, subject and status-based reply text.

Fields:
Source File, App, Name, Gmail, Amount, Date, Time, UPI ID, UTR Number, UPI Transaction ID, App Transaction ID, Payment Method, Status, Reference ID, Reply Required, Reply To Gmail, Reply Subject, Reply Message.

Data isolation in the portal:
- Admin can see all CCR records.
- A normal CCR user sees only CCR records uploaded by that user.
- A CCR user cannot see the other existing report menus through the portal navigation.

OCR note:
The OCR runs in the browser using the Tesseract.js library already loaded by the portal. Accuracy depends on screenshot quality and the text layout. Users should verify important transaction IDs before sending a reply.

Gmail note:
The Open Gmail button pre-fills a compose/reply window. It does not silently send an email. Sending remains under the user's control.
