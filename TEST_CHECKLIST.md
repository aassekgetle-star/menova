# MENOVA test checklist

## Static / schema checks
- [x] Inline JavaScript syntax check for root and enhanced pages after the latest updates.
- [x] New biomarker, consultation, referral, AI-summary and care-message tables created.
- [x] RLS policies and authenticated grants checked on new tables.
- [x] Private report bucket exists, is non-public, and limits PDF/JPG/PNG to 10 MB.
- [x] Storage policies scope uploads, reads and deletes to the authenticated member folder.
- [ ] Two-account RLS isolation test using separate real member accounts.
- [ ] End-to-end browser sign-in, create/read/update/delete test on Android and desktop.
- [ ] Test a real report upload, signed URL access and deletion.
- [ ] Test verified clinician assignment, accept/decline, referral status and two-way message exchange.
- [ ] Confirm unverified clinician cannot see member requests or messages.

## Product safety
- [x] No paid model, API key, public meeting provider or paid messaging provider added.
- [x] Local summary is explicitly described as rule-based, not generative AI.
- [x] No diagnosis, fertility prediction, unvalidated risk score or lab normal/abnormal classification.
- [x] Consultation/referral access is limited to assigned verified clinician accounts.
- [ ] Independent security/privacy review and clinical governance before real patient data.
- [ ] Enable Supabase leaked-password protection before any pilot.
- [ ] Add malware scanning and retention policy before real report uploads.
- [ ] Secure live video/phone provider remains out of scope for a zero-cost prototype.

## Evidence status
The code's inline JavaScript syntax passed. Supabase schema, RLS policy presence, authenticated grants and private bucket configuration were checked. No test records were created and no actual member session was available, so end-to-end browser CRUD, cross-account isolation, real file upload and two-way clinician messaging are not yet verified. Use synthetic data only.
