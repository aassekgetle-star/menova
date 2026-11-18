-- MENOVA reviewer-feedback expansion (additive; preserves existing tables and data)
alter table public.lifestyle_checkins
  add column if not exists sleep_start_time time,
  add column if not exists sleep_end_time time,
  add column if not exists stressors text,
  add column if not exists activity_type text,
  add column if not exists nutrition_notes text,
  add column if not exists smoking_status text,
  add column if not exists alcohol_frequency text,
  add column if not exists heat_exposure_details text,
  add column if not exists medication_changes text;

create table if not exists public.biomarker_records (
 id uuid primary key default gen_random_uuid(),
 member_user_id uuid not null references auth.users(id) on delete cascade,
 test_name text not null, biomarker text not null, collection_date date not null,
 specimen_type text, result_value text not null, unit text,
 lab_reference_interval text, laboratory_name text, report_storage_path text,
 notes text, is_simulated boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists biomarker_records_member_date_idx on public.biomarker_records(member_user_id,collection_date desc);

create table if not exists public.consultation_requests (
 id uuid primary key default gen_random_uuid(),
 member_user_id uuid not null references auth.users(id) on delete cascade,
 clinician_user_id uuid references auth.users(id) on delete set null,
 requested_specialty text not null,
 preferred_contact_method text not null default 'not_selected' check(preferred_contact_method in ('not_selected','video','phone','in_person')),
 preferred_time_window text, member_message text,
 status text not null default 'draft' check(status in ('draft','submitted','accepted','declined','scheduled','completed','cancelled')),
 is_simulated boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists consultation_requests_member_created_idx on public.consultation_requests(member_user_id,created_at desc);

create table if not exists public.referral_requests (
 id uuid primary key default gen_random_uuid(),
 member_user_id uuid not null references auth.users(id) on delete cascade,
 requested_specialty text not null, reason_for_referral text,
 urgency_preference text not null default 'routine' check(urgency_preference in ('routine','soon','clinician_to_assess')),
 status text not null default 'draft' check(status in ('draft','submitted','under_review','accepted','declined','completed','cancelled')),
 receiving_provider text, external_reference text, is_simulated boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists referral_requests_member_created_idx on public.referral_requests(member_user_id,created_at desc);

create table if not exists public.ai_insights (
 id uuid primary key default gen_random_uuid(),
 member_user_id uuid not null references auth.users(id) on delete cascade,
 insight_type text not null, insight_text text not null,
 evidence_summary jsonb not null default '{}'::jsonb,
 model_name text, prompt_version text, is_simulated boolean not null default true,
 created_at timestamptz not null default now()
);
create index if not exists ai_insights_member_created_idx on public.ai_insights(member_user_id,created_at desc);

alter table public.biomarker_records enable row level security;
alter table public.consultation_requests enable row level security;
alter table public.referral_requests enable row level security;
alter table public.ai_insights enable row level security;
revoke all on public.biomarker_records,public.consultation_requests,public.referral_requests,public.ai_insights from anon,public,authenticated;
grant select,insert,update,delete on public.biomarker_records,public.consultation_requests,public.referral_requests,public.ai_insights to authenticated;

create policy "Members manage their own biomarker records" on public.biomarker_records for all to authenticated using((select auth.uid())=member_user_id) with check((select auth.uid())=member_user_id);
create policy "Members manage their own consultation requests" on public.consultation_requests for all to authenticated using((select auth.uid())=member_user_id) with check((select auth.uid())=member_user_id);
create policy "Members manage their own referral requests" on public.referral_requests for all to authenticated using((select auth.uid())=member_user_id) with check((select auth.uid())=member_user_id);
create policy "Members manage their own AI insights" on public.ai_insights for all to authenticated using((select auth.uid())=member_user_id) with check((select auth.uid())=member_user_id);
