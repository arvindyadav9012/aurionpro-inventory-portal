NMRC INVENTORY V1.0.0 — V18 FINAL TEST PORTAL

Login demo: admin / admin123

V18 fixes:
1. Login screen has a clearly visible 3D colored background with grid, glowing orbs, cubes and 3D card.
2. Master is an expandable dropdown for Admin with User Management, User Creation and Station Name Add.
3. Station Name Add is a real admin page with add/delete controls.
4. Date / Date & Time / Time fields are native picker controls with visible Select buttons; they are not readonly manual fields.
5. Admin name/menu and a visible Logout button are present in the top header. Browse/photo browse is removed from the header.
6. Forgot Password uses a 4 digit OTP reset flow. Static ZIP cannot send real SMS without an SMS gateway/backend; the test flow displays a demo OTP and production SMS hook must be connected.
7. Existing test data is stored under aurion_state_v18; this package opens with zero counters.
