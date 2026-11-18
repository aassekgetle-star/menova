# MENOVA on-device AI guidance

This branch replaces the earlier cloud/API proposal with optional local inference in the browser. No OpenAI API key, paid inference account, Supabase Edge Function, or AI server is required.

## Architecture
- The authenticated MENOVA enhanced workspace loads Transformers.js in the browser.
- The model is `onnx-community/SmolLM2-135M-Instruct-ONNX-MHA`, an Apache-2.0 ONNX instruction model.
- The quantized model download is approximately 118 MB with WebGPU (`q4f16`) or 182 MB with WebAssembly (`q4`), plus tokenizer/runtime assets. Actual transfer and storage may vary.
- WebGPU is selected when exposed by the browser; otherwise the app attempts the WebAssembly CPU backend.
- The model files are downloaded from Hugging Face on first use and cached by the browser/runtime where supported. A network connection is needed for the initial download.
- Prompts and generated answers are passed to the model in the browser. The app does not send chat content to an AI inference API and does not save this conversation to Supabase.
- The user must explicitly choose “Download & prepare on-device AI” before model files are fetched.
- The acute testicular-pain emergency check is a fixed local safety rule that runs before model generation.

## User experience
1. Sign in to the MENOVA enhanced workspace.
2. Open Insights.
3. Select “Download & prepare on-device AI”. Explain the one-time download before starting.
4. Wait for the download and model initialization to finish.
5. Ask a general educational question. Use Ctrl/Command+Enter as an optional keyboard shortcut.
6. Clear the chat to remove the in-page conversation history.

## Important limitations
- This is a small general-purpose language model, not a medical model. It may hallucinate, omit important information, or give unsafe/incomplete answers.
- It is not clinically validated and must not be used for diagnosis, triage decisions, fertility prediction, treatment selection, or medication dosing.
- The fixed red-flag wording is a basic safeguard, not a complete symptom checker. It cannot reliably identify every emergency phrasing.
- Sudden or severe testicular pain requires immediate emergency assessment; do not wait for the model.
- WebGPU availability and device memory vary. WebAssembly may be slow or fail on lower-memory phones. If the model cannot load, the chat remains unavailable and the user should use ordinary clinician care.
- Initial download requires internet access. Model caching is controlled by browser storage and may be cleared by the user or browser.
- Loading the model uses an external CDN and downloads model assets from Hugging Face. After loading, prompts and replies are processed locally by the browser.
- Do not describe this as zero-data-network usage: model assets and the runtime are downloaded. The health conversation itself is not sent to an AI server by this implementation.

## Verification checklist
- Confirm the Insights view shows the on-device download explanation.
- Confirm the user must explicitly start the model download.
- Confirm WebGPU selection and WASM fallback behavior on supported devices.
- Confirm model progress and load failures are presented without losing access to other MENOVA features.
- Ask benign synthetic questions and inspect output quality.
- Test red-flag wording variants and ensure the fixed emergency message appears before generation.
- Inspect browser network traffic: model/runtime assets may download, but the entered question and chat history must not be transmitted to a remote AI endpoint.
- Test on Android Chrome and at least one desktop browser. No end-to-end browser/device test has yet been performed by this code change.
