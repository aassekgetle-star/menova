# MENOVA enhanced longitudinal-health and care-pathway demo

The original root application is preserved. This additive experience lives at `/enhanced/` on the upgrade branch.

## Added from reviewer feedback

- Longitudinal lifestyle and environmental check-ins: sleep duration, quality and timing; stress level and context; physical activity and type; nutrition pattern and notes; heat exposure and context; smoking/nicotine; alcohol frequency; and medication/supplement changes.
- Structured biomarker records: test/panel, biomarker, collection date, specimen type, result, unit, laboratory-specific reference interval, laboratory name and notes. Results are stored as entered; there is no normal/abnormal or fertility classification.
- Chronological timeline and descriptive earliest/latest comparisons for selected lifestyle measures.
- Biomarker history grouped by parameter and unit to make longitudinal entries easier to review without implying causation.
- Export and deletion controls for the member's timeline, biomarker, laboratory and care-request records.
- Consultation and specialist-referral request records, with status fields and clear demo-only disclosure.
- Supabase-backed member data with RLS policies limiting each new record to its authenticated owner.

## Not yet live / important limitations

- **AI synthesis:** no genuine AI model is connected. The current insights are transparent descriptive comparisons only. A real model requires a server-side provider integration, managed secret, evaluation against unsafe/unsupported medical outputs, monitoring, and clinical governance. No API key is stored in browser code.
- **Teleconsultation:** no video/phone vendor, booking calendar, clinician availability or payment flow is connected. Consultation requests are saved as simulated drafts and do not contact a clinician.
- **Referrals:** referral requests are saved as simulated drafts. No verified specialist directory, clinical triage, provider routing or external referral transmission is connected.
- **Biomarker uploads:** structured results are supported; secure file/image upload and malware scanning are not yet implemented.
- **Clinician handoff:** existing consent/hand-over prototype remains separate. The new care-request tables are member-private; no clinician/admin processing interface has been granted access.
- **Clinical interpretation:** no diagnosis, validated risk score, fertility prediction, or causal inference is provided.

## Safety and privacy

Use synthetic/demo information only. The prototype is not a clinical record or emergency service. Sudden severe testicular pain requires immediate emergency assessment; do not wait for MENOVA.

Before any real-world pilot: complete an independent security/privacy review, verify clinician credentials through a trusted process, implement purpose-limited and revocable consent with audit trails, configure leaked-password protection, establish retention/deletion and incident-response policies, validate clinical content, and complete end-to-end member-isolation testing.
