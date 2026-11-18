import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://aassekgetle-star.github.io",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const systemInstructions = `You are MENOVA, an educational male reproductive-health guide. You are not a doctor and must never diagnose, prescribe, claim to determine fertility, interpret an individual's lab result as normal or abnormal, or replace professional assessment.

Use clear, respectful, non-judgmental language. Explain general health concepts, distinguish established general information from uncertainty, and ask only relevant clarifying questions. When useful, help the user prepare questions for a qualified clinician. Never claim to have reviewed a medical record unless its contents were explicitly included in the current conversation. Do not invent clinical facts, statistics, local services, or treatment recommendations. Do not request names, phone numbers, addresses, identity numbers, or other identifying information.

Safety:
- Sudden or severe testicular pain, especially with nausea, vomiting, swelling, or a high-riding testicle, requires immediate emergency assessment. Tell the user not to wait for this chat.
- Severe acute illness, fainting, heavy bleeding, or rapidly worsening symptoms require urgent/emergency care.
- New testicular lump, persistent swelling, blood in semen/urine, genital discharge, fever with genital/urinary symptoms, or persistent erectile/sexual-function concerns warrant timely professional assessment.
- For fertility concerns, explain that assessment may involve both partners and that a clinician determines appropriate tests. Do not diagnose infertility from duration alone.
- If a user expresses self-harm intent, respond supportively and direct them to immediate local emergency/crisis support and a trusted person.

Keep answers concise, practical, and accessible. State when something is general educational information. Do not provide dosing instructions or recommend prescription medicines. Do not encourage delaying care.`;

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed." });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const openaiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !anonKey || !openaiKey) {
    return json(503, { error: "AI guidance is not configured yet. Please try again later." });
  }

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json(401, { error: "Please sign in to use MENOVA AI guidance." });

  // Verify the user's access token with Supabase Auth; never trust client-supplied user IDs.
  const userCheck = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, Authorization: auth },
  });
  if (!userCheck.ok) return json(401, { error: "Your session is invalid or expired. Please sign in again." });

  let body: { message?: unknown; history?: unknown };
  try { body = await req.json(); } catch { return json(400, { error: "Invalid request body." }); }
  if (typeof body.message !== "string" || !body.message.trim() || body.message.length > 3000) {
    return json(400, { error: "Enter a question of 1–3,000 characters." });
  }

  const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
  const safeHistory = history.filter((item): item is { role: "user" | "assistant"; content: string } =>
    !!item && typeof item === "object" &&
    ((item as Record<string, unknown>).role === "user" || (item as Record<string, unknown>).role === "assistant") &&
    typeof (item as Record<string, unknown>).content === "string" &&
    ((item as Record<string, string>).content.length <= 3000)
  ).map(item => ({ role: item.role, content: item.content }));

  // Do not send acute red-flag scenarios to a generative model for triage.
  if (/sudden.{0,30}severe.{0,30}(testic|testicle)|severe.{0,30}(testic|testicle).{0,30}pain|testic.{0,30}pain.{0,30}(sudden|severe)/i.test(body.message)) {
    return json(200, { reply: "Sudden or severe testicular pain needs immediate emergency medical assessment. Please go to the nearest emergency department or contact local emergency services now. Do not wait for an online response or try to manage this through MENOVA." });
  }

  const input = [
    ...safeHistory,
    { role: "user", content: body.message.trim() },
  ];
  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions: systemInstructions,
        input,
        max_output_tokens: 650,
        store: false,
      }),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("MENOVA AI provider error", response.status, errorBody.slice(0, 500));
      return json(502, { error: "MENOVA AI is temporarily unavailable. Please try again later." });
    }
    const result = await response.json();
    const reply = (result.output || [])
      .filter((item: { type?: string }) => item.type === "message")
      .flatMap((item: { content?: Array<{ type?: string; text?: string }> }) => item.content || [])
      .filter((part: { type?: string }) => part.type === "output_text")
      .map((part: { text?: string }) => part.text || "")
      .join("\n").trim();
    if (!reply) return json(502, { error: "MENOVA AI returned an empty response. Please try again." });
    return json(200, { reply });
  } catch (error) {
    console.error("MENOVA AI request failed", error);
    return json(502, { error: "MENOVA AI could not complete the request. Please try again." });
  }
});
