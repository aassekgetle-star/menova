# MENOVA pilot-readiness and verification checklist

This checklist is intentionally explicit. The prototype is not ready for a real-world clinical pilot until each applicable item is closed and independently verified.

## Outstanding limitations to disclose

1. **Uploaded report files:** Uploaded report files are not automatically available to doctors. The current prototype can include recorded result values and metadata in an approved handover. A consent-scoped, short-lived report access function has now been added for files explicitly included in a member-approved handover. It must still be tested with separate accounts, expiry, revocation and cross-member access attempts before it can be described as validated.
2. **Live account and privacy testing:** Separate personal and doctor accounts still require live browser testing, including signup, email confirmation, manual login, approval, revocation, clinician assignment and access isolation. Static code checks do not prove the end-to-end experience.
3. **Local AI:** The local AI uses a small general-purpose model. It is not a clinically validated medical model and may be inaccurate or hallucinate. It must not diagnose, prescribe, predict fertility, classify laboratory results or replace a clinician.
4. **Leaked-password protection:** Supabase's security advisor reports that leaked-password protection is disabled. Enable it in Supabase Authentication password security settings before any real-world pilot. This setting has not been changed by this code change.

## Manual browser test plan

Use two separate test identities and non-real/synthetic data only.

### Account separation
- Create a Personal account and confirm the email.
- Confirm the email link returns to MENOVA and does not create an authenticated session automatically.
- Manually log in as Personal and verify member pages load.
- Create a Doctor account with self-reported credentials.
- Confirm Doctor account can log in only after selecting Doctor in the shared login form.
- Confirm the doctor UI labels the credentials as self-reported/unverified.

### Handover consent
- As Personal, create synthetic records in each category.
- Open Doctor handover, select one category, preview, and approve to the test doctor.
- Verify the preview and saved snapshot contain only selected categories.
- Verify a different doctor cannot see the handover.
- Verify the assigned doctor can see the approved snapshot only and cannot query unshared raw member records.
- Revoke as Personal; verify the handover disappears from the doctor's accessible list and report endpoint denies new requests.
- Verify information previously viewed or downloaded is not represented as recallable.

### Uploaded report access
- Upload a synthetic PDF to the private report bucket and link its storage path to a biomarker record.
- Approve the test result category to the test doctor.
- Verify the assigned doctor can request a short-lived signed link for the exact report in that snapshot.
- Verify a different doctor, an unassigned handover, a different biomarker ID, an unshared report, a revoked consent, and a modified storage path are denied.
- Verify the signed URL expires after 60 seconds. A signed URL already issued may remain usable until expiry even if consent is revoked; do not promise instantaneous recall of an issued URL.

### Wellness charts and local AI
- Add synthetic sleep, stress, activity, nutrition and test records on different dates.
- Check weekly, monthly and yearly filters use the correct records and show empty states when no records exist.
- Confirm test trend labels preserve units and the lab's own reference interval.
- Confirm the local AI uses only the member's own saved period context and makes no diagnosis, fertility prediction or lab classification.
- Confirm AI still works with no network inference endpoint; the model assets may need an initial download.

## Current validation status

- Database RLS restricts clinician handover reads to the assigned clinician with an active linked consent.
- The report-access Edge Function is deployed with JWT verification enabled. Its end-to-end access-control cases have not yet been browser-tested.
- No live browser test with two separate identities has been completed in this change.
- The account registration PR is a prerequisite and must be merged before this PR is merged.
- Enable Supabase leaked-password protection before a real-world pilot.
