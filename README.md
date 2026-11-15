# MENOVA — Public Demonstration

MENOVA is a concept for helping men organise male reproductive health concerns, understand when professional assessment may be appropriate, and control what information they share with a healthcare professional.

## Public demo
The root `index.html` is a static, presentation-only demonstration. It contains:
- The proposed patient journey
- Fictional scenarios illustrating navigation principles
- Safety, consent and privacy-by-design principles

## Important limitations
This public page does not provide accounts, intake forms, diary storage, AI inference, clinical rules, diagnosis, test interpretation, referrals, teleconsultations or patient records. It does not collect or transmit information. All examples are synthetic.

MENOVA is not a medical device or clinical service. It does not diagnose infertility or calculate a validated risk score. Sudden severe testicular pain requires immediate emergency assessment.

## Development
This repository is public. Do not commit credentials, API keys, confidential material or real patient information. The public page is intentionally limited to a concept demonstration. Any functionality executed in a public browser should be treated as visible to visitors.

## Hosting
A GitHub Actions workflow in `.github/workflows/pages.yml` is configured to publish the repository root to GitHub Pages after Pages is configured to use **GitHub Actions** under Settings → Pages.
