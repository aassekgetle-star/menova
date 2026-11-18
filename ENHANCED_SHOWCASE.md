# MENOVA enhanced showcase

A separate longitudinal-health demonstration at /enhanced/. The original root application remains available and is preserved on fallback/pre-upgrade-2026-11-18.

Added: dated lifestyle and environmental check-ins (sleep, stress, nutrition, activity, heat exposure); descriptive trends; structured laboratory record capture including units and laboratory-specific reference intervals; transparent deterministic comparisons; local JSON export and deletion.

Boundaries: enhanced records are stored in browser localStorage only. They are not connected to the existing Supabase project and must not be used for real health information. No AI model, validated risk score, verified clinician network, referral service or teleconsultation is implemented.

Production integration requires schema design, tested row-level policies, member isolation, clinician authorisation, revocable consent, secure lab-file handling, privacy/security review and clinical governance.
