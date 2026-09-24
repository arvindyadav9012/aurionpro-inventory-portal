CCR GMAIL INTEGRATION - FINAL STRUCTURE
=======================================

Primary source:
- One connected complaint Gmail account.
- New Gmail messages are read automatically while the portal is open.
- Manual screenshot upload remains available as a backup.

CCR final report fields:
- Source
- App
- Name
- Gmail
- Amount
- Date
- Time
- UPI ID
- UTR Number
- UPI Transaction ID
- App Transaction ID
- Payment Method
- Transaction Status
- Reference ID
- Reply Required
- Reply To Gmail
- Reply Subject
- Reply Message
- Replied By
- Reply Date & Time
- Reply Status
- Resolution Status

Reply behavior:
- The system prepares the reply draft.
- It DOES NOT send email automatically.
- CCR user opens Gmail, reviews/edits, and manually sends the reply.
- After manual sending, the user can mark Reply Sent.
- Resolution can be set to Pending or Resolved.

Gmail security:
- OAuth is used; the Gmail password is never stored in the portal.
- Scope is read-only (gmail.readonly). The system does not have Gmail send permission.
- Gmail OAuth tokens are stored in the existing D1 database in the new gmail_oauth table.
- Existing portal tables are not deleted or altered.

REQUIRED GOOGLE / CLOUDFLARE SETUP
----------------------------------
1. Create a Google Cloud OAuth Web Application.
2. Add this Authorized Redirect URI exactly:
   https://aurion-invay.pages.dev/api/gmail/callback
3. Put the OAuth Client ID in wrangler.toml [vars] as GMAIL_CLIENT_ID.
4. Put the OAuth Redirect URI in wrangler.toml [vars] as GMAIL_REDIRECT_URI.
5. Store GMAIL_CLIENT_SECRET as a Cloudflare Worker secret. Do not put the secret in a public file.
6. Deploy the worker with the same existing D1 database binding.
7. Open the portal, log in as Admin, open the CCR report, and click Connect Complaint Gmail.
8. Complete Google's consent screen once.

AUTOMATIC CHECKING
------------------
- The CCR page checks for new Gmail complaints immediately when opened.
- It checks again every 30 seconds while the portal session is open.
- Already imported Gmail message IDs are recorded in gmail_processed, so the same message is not imported twice.

IMPORTANT LIMIT
---------------
This ZIP contains the Gmail OAuth integration code, but a real Gmail connection cannot be completed until the Google OAuth Client ID/Secret and exact live portal redirect URI are configured in the deployment. No Gmail credentials are included in this ZIP.


LIVE PORTAL TARGET
------------------
Live portal: https://aurion-invay.pages.dev/
OAuth callback: https://aurion-invay.pages.dev/api/gmail/callback

The only value that must still come from the Google account owner is the Google OAuth Client ID and Client Secret. These cannot be safely invented or embedded in the ZIP.
