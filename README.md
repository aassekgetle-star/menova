# MENOVA — Member-centred men's health prototype

MENOVA is a privacy-first digital companion focused on earlier support for men's health, with the demonstration centred on male reproductive health.

## Live demonstration
https://aassekgetle-star.github.io/menova/

## Existing prototype
- Email/password account creation and sign-in using Supabase Auth.
- Member profile, reproductive-health intake and explainable rule-based prompts.
- Private diary with transparent keyword topic tagging.
- Member health record and explicit consent preview / simulated handover.
- Synthetic scenario lab, including an emergency red-flag example.
- Simulated clinician view.

## Reviewer-feedback expansion (upgrade branch)
The additive `/enhanced/` experience includes:
- Longitudinal sleep, stress, activity, nutrition, heat exposure, smoking/nicotine, alcohol and medication-change tracking.
- Structured biomarker capture with specimen, result, unit, lab reference interval and laboratory identity.
- Chronological descriptive trend summaries and biomarker history.
- Member-private consultation and specialist-referral request drafts.
- JSON export and deletion controls for the new timeline and request records.

## Supabase
MENOVA uses its own Supabase project (EU Central), separate from other projects. The browser uses only the publishable key; never put a service-role or secret key in this repository. New tables have RLS enabled and owner-scoped policies. The new AI insights table is a future persistence point; it is not populated by a live model.

## Important limitations
- The upgrade is on a separate branch and draft pull request; the original main branch and existing public deployment have not been overwritten or updated.
- Use synthetic/demo information only. This is not a clinical service or production-certified clinical record.
- Descriptive comparisons are not AI, diagnosis, validated risk prediction, causal inference or fertility interpretation.
- A genuine AI synthesis service is not connected. It requires a server-side model provider, managed secret, safety testing, monitoring and clinical governance.
- Biomarker values are stored as entered. Secure report file upload is not yet implemented.
- Consultation/referral records are demonstration drafts only. No verified specialist network, referral delivery, appointment scheduling, teleconsultation vendor or secure live clinician messaging is connected.
- Clinician verification and privileged case processing require a trusted administrative process and audited access controls.
- Supabase Auth leaked-password protection remains disabled and must be enabled in project Auth settings before any real pilot.
- Production requires independent security/privacy review, end-to-end two-account RLS testing, clinical governance, retention/deletion and incident-response policies.

## Safety
MENOVA does not replace professional care. Sudden severe testicular pain requires immediate emergency assessment; do not wait for an app assessment.
