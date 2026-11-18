# MENOVA test checklist

## Static / data checks
- [ ] JavaScript syntax check for root and enhanced pages.
- [ ] Desktop and mobile layout, including narrow-screen forms.
- [ ] Sign in with an existing MENOVA account; signed-out users cannot access the enhanced data view.
- [ ] Lifestyle check-in validates dates and numeric bounds; all additional lifestyle fields persist.
- [ ] Biomarker record persists specimen, result, unit, lab interval and lab identity exactly as entered.
- [ ] Existing lab record form still saves.
- [ ] Consultation and referral requests save as simulated drafts and explicitly state no provider is contacted.
- [ ] Timeline sorts entries chronologically.
- [ ] Biomarker history groups only matching parameter/unit labels and does not infer normality or causation.
- [ ] JSON export contains lifestyle, biomarker, lab and care-request records.
- [ ] Individual and bulk deletion remove only the signed-in member's records.
- [ ] Two-account RLS isolation test: account A cannot read, update or delete account B's rows.
- [ ] Sign-out immediately hides member records.

## Clinical / product safety
- [ ] Sudden severe testicular pain route in the main prototype directs immediately to emergency care.
- [ ] No diagnosis, fertility prediction, unvalidated risk score or normal/abnormal lab classification.
- [ ] AI endpoint remains disabled until provider credentials, safety evaluation and clinical review are completed.
- [ ] Consultation and referral flows are clearly marked demo-only until provider network and scheduling integrations are operational.
- [ ] Secure biomarker report upload is not advertised as available.

## Test evidence status
The enhanced page JavaScript syntax was checked after this update. Database migration application and schema/policy checks are performed separately. Browser interaction, real member-session CRUD, two-account isolation, mobile-device testing, clinical validation, AI evaluation, teleconsultation and referral delivery have not been demonstrated by this checklist. Synthetic data only.
