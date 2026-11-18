# MENOVA AI guidance setup

This branch adds a genuine generative AI conversation to the authenticated longitudinal workspace.

## Architecture
- The browser calls the authenticated Supabase Edge Function `menova-guidance`.
- The function validates the Supabase access token with Supabase Auth.
- The OpenAI API key is held only as a Supabase Function secret; it is never sent to the browser.
- The function calls the OpenAI Responses API using `gpt-4.1-mini`.
- Chat history is held in page memory only. It is not written to MENOVA's database.
- Requests use `store: false`; the app does not save AI questions or answers to the health timeline.
- Acute severe testicular-pain wording is intercepted by a fixed emergency instruction before any model call.

## Required deployment configuration
Set the following Supabase Edge Function secrets in project `ytofiyvteuuchmqznzwc`:
- `OPENAI_API_KEY`: a valid OpenAI API key with API billing enabled.

Supabase provides `SUPABASE_URL` and `SUPABASE_ANON_KEY` to Edge Functions. Deploy `supabase/functions/menova-guidance/index.ts` with JWT verification enabled.

The OpenAI API is usage-billed; this integration is not guaranteed to be free. Set a low project spending limit and monitor usage before inviting testers. Never commit the key to GitHub or place it in HTML/JavaScript.

## Before real-world use
- Add server-side per-user rate limiting and abuse controls.
- Complete clinician review of prompts, red-flag wording, and example responses.
- Complete privacy impact assessment and data-processing review for sending questions to an external AI provider.
- Run safety and bias evaluations with synthetic cases, including emergency red flags and out-of-scope prompts.
- Make a clinician escalation pathway and local emergency information reliable for each deployment country.
- Do not claim diagnostic accuracy, fertility prediction, clinical validation, or improved outcomes.

## Test checklist
1. Unauthenticated request returns 401.
2. Authenticated request with a valid question returns a model-generated response.
3. Sudden/severe testicular pain receives the fixed emergency response without a model call.
4. Invalid/oversized messages are rejected.
5. Provider errors return a safe generic error without leaking the API key.
6. Inspect browser network traffic to confirm no OpenAI key is exposed.
7. Confirm AI conversation is not persisted to the member's health tables.
