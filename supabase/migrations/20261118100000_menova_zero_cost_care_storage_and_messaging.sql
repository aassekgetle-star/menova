-- MENOVA zero-additional-cost feature completion (uses existing Supabase project)
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('menova-private-reports','menova-private-reports',false,10485760,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=array['application/pdf','image/jpeg','image/png'];
create policy "Members upload own MENOVA reports" on storage.objects for insert to authenticated with check(bucket_id='menova-private-reports' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Members view own MENOVA reports" on storage.objects for select to authenticated using(bucket_id='menova-private-reports' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Members delete own MENOVA reports" on storage.objects for delete to authenticated using(bucket_id='menova-private-reports' and (storage.foldername(name))[1]=(select auth.uid())::text);
alter table public.referral_requests add column if not exists assigned_clinician_user_id uuid references auth.users(id) on delete set null;

drop policy if exists "Members manage their own consultation requests" on public.consultation_requests;
create policy "Members view own consultation requests" on public.consultation_requests for select to authenticated using(member_user_id=(select auth.uid()));
create policy "Members create own consultation requests" on public.consultation_requests for insert to authenticated with check(member_user_id=(select auth.uid()) and (clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=clinician_user_id and cp.verification_status='verified')));
create policy "Members cancel own consultation requests" on public.consultation_requests for update to authenticated using(member_user_id=(select auth.uid())) with check(member_user_id=(select auth.uid()) and (clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=clinician_user_id and cp.verification_status='verified')));
create policy "Members delete own consultation requests" on public.consultation_requests for delete to authenticated using(member_user_id=(select auth.uid()));
create policy "Verified assigned clinicians view consultation requests" on public.consultation_requests for select to authenticated using(clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status='verified'));
create policy "Verified assigned clinicians update consultation requests" on public.consultation_requests for update to authenticated using(clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status='verified')) with check(clinician_user_id=(select auth.uid()));

drop policy if exists "Members manage their own referral requests" on public.referral_requests;
create policy "Members view own referral requests" on public.referral_requests for select to authenticated using(member_user_id=(select auth.uid()));
create policy "Members create own referral requests" on public.referral_requests for insert to authenticated with check(member_user_id=(select auth.uid()) and (assigned_clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=assigned_clinician_user_id and cp.verification_status='verified')));
create policy "Members update own referral requests" on public.referral_requests for update to authenticated using(member_user_id=(select auth.uid())) with check(member_user_id=(select auth.uid()) and (assigned_clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=assigned_clinician_user_id and cp.verification_status='verified')));
create policy "Members delete own referral requests" on public.referral_requests for delete to authenticated using(member_user_id=(select auth.uid()));
create policy "Verified assigned clinicians view referral requests" on public.referral_requests for select to authenticated using(assigned_clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status='verified'));
create policy "Verified assigned clinicians update referral requests" on public.referral_requests for update to authenticated using(assigned_clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status='verified')) with check(assigned_clinician_user_id=(select auth.uid()));

create table if not exists public.care_messages (
 id uuid primary key default gen_random_uuid(),
 consultation_request_id uuid not null references public.consultation_requests(id) on delete cascade,
 member_user_id uuid not null references auth.users(id) on delete cascade,
 clinician_user_id uuid not null references auth.users(id) on delete cascade,
 sender_user_id uuid not null references auth.users(id) on delete cascade,
 message_text text not null check(length(trim(message_text)) between 1 and 4000),
 created_at timestamptz not null default now(), read_at timestamptz
);
create index if not exists care_messages_conversation_created_idx on public.care_messages(consultation_request_id,created_at);
alter table public.care_messages enable row level security;
revoke all on public.care_messages from anon,public,authenticated;
grant select,insert on public.care_messages to authenticated;
create policy "Care participants read their messages" on public.care_messages for select to authenticated using((member_user_id=(select auth.uid()) or clinician_user_id=(select auth.uid())) and exists(select 1 from public.consultation_requests cr where cr.id=consultation_request_id and cr.member_user_id=member_user_id and cr.clinician_user_id=clinician_user_id));
create policy "Care participants send messages" on public.care_messages for insert to authenticated with check(sender_user_id=(select auth.uid()) and (sender_user_id=member_user_id or sender_user_id=clinician_user_id) and exists(select 1 from public.consultation_requests cr where cr.id=consultation_request_id and cr.member_user_id=member_user_id and cr.clinician_user_id=clinician_user_id and cr.status in ('accepted','scheduled')) and exists(select 1 from public.clinician_profiles cp where cp.user_id=clinician_user_id and cp.verification_status='verified'));
