import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const cors = {
  "Access-Control-Allow-Origin": "https://aassekgetle-star.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    const { handover_id, biomarker_record_id } = await req.json();
    if (!handover_id || !biomarker_record_id) return new Response(JSON.stringify({ error: "handover_id and biomarker_record_id are required" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
    const { data: userData, error: userError } = await userClient.auth.getUser(token);
    if (userError || !userData.user) return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });

    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: clinician } = await admin.from("clinician_profiles").select("user_id,verification_status").eq("user_id", userData.user.id).maybeSingle();
    if (!clinician || !["verified", "self_reported"].includes(clinician.verification_status)) return new Response(JSON.stringify({ error: "Clinician account required" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const { data: handover } = await admin.from("health_handovers").select("id,member_user_id,clinician_user_id,consent_id,shared_snapshot,status").eq("id", handover_id).eq("clinician_user_id", userData.user.id).maybeSingle();
    if (!handover || !["approved_for_sharing", "viewed"].includes(handover.status)) return new Response(JSON.stringify({ error: "Active assigned handover not found" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    const { data: consent } = await admin.from("sharing_consents").select("id,member_user_id,selected_sections,revoked_at").eq("id", handover.consent_id).eq("member_user_id", handover.member_user_id).is("revoked_at", null).maybeSingle();
    if (!consent || consent.selected_sections?.clinician_user_id !== userData.user.id || !consent.selected_sections?.sections?.includes("test_results")) return new Response(JSON.stringify({ error: "Consent does not authorise report access" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const rows = handover.shared_snapshot?.test_results?.biomarker_records || [];
    const approved = rows.find((r: any) => r.id === biomarker_record_id && typeof r.report_storage_path === "string" && r.report_storage_path.length > 0);
    if (!approved) return new Response(JSON.stringify({ error: "This report is not part of the approved handover" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    const path = approved.report_storage_path;
    if (!path.startsWith(handover.member_user_id + "/")) return new Response(JSON.stringify({ error: "Invalid report ownership path" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });

    const { data: signed, error: signError } = await admin.storage.from("menova-private-reports").createSignedUrl(path, 60, { download: true });
    if (signError || !signed?.signedUrl) return new Response(JSON.stringify({ error: "Could not issue a short-lived report link" }), { status: 404, headers: { ...cors, "Content-Type": "application/json" } });
    return new Response(JSON.stringify({ signed_url: signed.signedUrl, expires_in: 60 }), { status: 200, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  } catch (_error) {
    return new Response(JSON.stringify({ error: "Unable to authorise report access" }), { status: 400, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  }
});