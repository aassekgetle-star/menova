# MENOVA enhanced longitudinal-health and zero-additional-cost care demo

The original application is preserved on main. This additive experience is developed on the upgrade branch.

## Implemented in the existing Supabase / GitHub setup

- Longitudinal lifestyle and environmental check-ins: sleep duration, quality and timing; stress and context; activity; nutrition; heat exposure; smoking/nicotine; alcohol; medication/supplement changes.
- Structured biomarker capture: test, parameter, collection date, specimen, result, unit, laboratory reference interval, laboratory and notes.
- Private report attachments in a non-public Supabase Storage bucket, restricted to the authenticated member's own user-id folder. PDF/JPG/PNG, max 10 MB.
- Chronological timeline and descriptive trend comparisons.
- Transparent local rule-based educational summary using member-entered records. It is not generative AI, diagnosis, fertility prediction or validated risk scoring. It makes no external AI request and requires no API key.
- Consultation requests assigned to a selected verified clinician, with a verified clinician inbox and request status actions.
- Specialist referral requests assigned to a selected verified clinician, with an inbox and status workflow.
- Member/assigned-clinician text messaging after the consultation is accepted or scheduled.
- JSON export, record deletion and private report deletion.
- RLS policies on the new tables and storage objects; clinician access is limited to verified accounts assigned to the specific request.

## Zero-cost design and boundaries

This uses the existing free-tier project/repository and browser capabilities; it adds no paid AI, video, messaging, email or booking service. Free-tier quotas and limits may change. This does not guarantee zero cost if the existing project exceeds free quotas.

- No actual generative AI model is connected. Local rule-based summaries are the $0 alternative and are labelled honestly.
- No video/phone teleconsultation vendor is connected. A free public meeting service is not suitable for confidential health consultations without a proper privacy/security agreement. The prototype provides in-app text messaging with assigned verified clinicians.
- Referral requests route only to clinicians already verified and listed in MENOVA. This is an internal workflow, not a national referral network or external hospital integration.
- Secure report uploads are private and access-controlled, but there is no malware scanning or independent security certification. Synthetic data only until reviewed.
- Clinician verification is not automatic. A trusted administrator must verify credentials and set the profile to verified.
- Supabase Auth leaked-password protection remains disabled; enable it before any pilot.
- Two-account isolation and full browser CRUD tests remain outstanding.

## Safety
MENOVA is not a clinical service or emergency tool. Sudden severe testicular pain requires immediate emergency assessment. No automated summary should delay clinical care.
