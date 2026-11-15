# MENOVA — Interactive Competition Prototype

MENOVA is a privacy-first concept focused on earlier support for male reproductive health concerns.

## Live demonstration
The root `index.html` is an interactive, mobile-responsive front-end prototype. It demonstrates:
1. Guided reproductive health intake with transparent explanations and suggested next steps.
2. A private diary with simple keyword-based topic organisation.
3. Five synthetic scenarios, including an urgent testicular-pain safety scenario.
4. A patient health record assembled from demo assessment and diary entries.
5. A consent checkpoint where the user selects information, previews it and explicitly approves a simulated handover.
6. A simulated doctor portal that displays only approved demo handovers.

## How to demonstrate
Open the site and:
- Run the assessment with the “Trying to conceive” reason, select “Yes” and “More than 12 months”, then organise the assessment.
- Open Scenario lab and run the urgent testicular-pain case.
- Add a fictional diary entry and inspect My health record.
- Open Consent & handover, preview the selected information, tick explicit approval, and approve.
- Open Doctor portal to inspect the approved simulated handover.

## Safety, privacy and technical limitations
- All examples are synthetic. Never enter real patient or patient-identifiable information.
- Assessment and diary organisation use simple deterministic rules and keyword matching, not trained AI or a validated clinical risk model.
- MENOVA does not diagnose infertility, interpret laboratory tests, prescribe treatment or replace a healthcare professional.
- Sudden severe testicular pain requires immediate emergency assessment; do not wait for an app.
- Data is stored in the browser's localStorage. This is a demonstration convenience, not secure clinical storage.
- Doctor profiles and handovers are simulated. No real clinician directory, authentication, server-side consent enforcement, encrypted data transfer, referrals, teleconsultations or backend are connected.
- The approval flow demonstrates user choice only; it does not transmit information to a clinician.

## Run locally
Open `index.html` in a modern browser. No build step, paid API, database, domain or subscription is required.

This repository is public. Do not commit credentials, confidential material or real patient information.
