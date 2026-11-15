# MENOVA — Member-centred men's health prototype

MENOVA is a privacy-first digital companion focused on earlier support for men's health, with the competition demonstration centred on male reproductive health.

## Live demonstration

https://aassekgetle-star.github.io/menova/

The application currently includes:
- Email/password account creation and sign-in using Supabase Auth.
- Member profile creation.
- Reproductive health assessment with transparent, rule-based prompts (not diagnosis or a validated risk score).
- Private text diary with transparent keyword topic tagging.
- Member health record view.
- Explicit consent preview and simulated handover saved to the MENOVA database.
- Scenario lab with synthetic cases, including an emergency red-flag example.
- Simulated clinician view.

## Database

MENOVA uses its own Supabase project, separate from other projects and organisations:
- Project ref: `ytofiyvteuuchmqznzwc`
- Region: EU Central
- Tables: `member_profiles`, `health_assessments`, `diary_entries`, `sharing_consents`, `clinician_profiles`, `health_handovers`.
- Row Level Security is enabled on all six public tables.
- Browser code uses only the Supabase publishable key. Never put a service-role or secret key in this repository.
- Member records are scoped to the signed-in account through RLS.
- Clinician handover access is restricted to the assigned, verified clinician identity at the database policy level.

## Important current limitations

- This is a competition prototype, not a clinical service.
- Use synthetic/demo information only. Do not enter real personal health information.
- Assessments are not diagnosis, medical advice, or a validated risk prediction.
- Diary tagging uses simple keyword matching, not an AI model.
- Handover records are stored as simulated records. They are not sent to a real clinician, and there is no live directory, referral booking, or teleconsultation.
- Clinician verification and role assignment require a trusted administrative process that has not yet been implemented.
- Email confirmation settings depend on the Supabase project's Auth configuration. If signup asks for email confirmation, confirm the email before signing in.
- Production use requires clinical governance, security review, privacy/legal review, tested consent revocation, monitoring, and end-to-end security testing.

## Local development

Open `index.html` through a local static server or use the GitHub Pages deployment. The app uses the Supabase JavaScript v2 browser client from a pinned CDN release.

## Safety

MENOVA is not a substitute for professional care. Sudden severe testicular pain requires immediate emergency assessment.