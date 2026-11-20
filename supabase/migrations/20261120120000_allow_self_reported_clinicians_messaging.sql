-- The app lists self-reported prototype clinicians to members, but consultation, referral and
-- messaging policies only accepted 'verified' clinicians, so requests and messages were rejected.
-- Also fixes care_messages policies: inside the EXISTS subquery, unqualified member_user_id /
-- clinician_user_id resolved to the consultation row (always true), so a participant could post into
-- someone else's accepted consultation. They are now qualified with care_messages.

drop policy if exists "Members create own consultation requests" on public.consultation_requests;
create policy "Members create own consultation requests" on public.consultation_requests for insert to authenticated with check(member_user_id=(select auth.uid()) and (clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=clinician_user_id and cp.verification_status in ('verified','self_reported'))));
drop policy if exists "Members cancel own consultation requests" on public.consultation_requests;
create policy "Members cancel own consultation requests" on public.consultation_requests for update to authenticated using(member_user_id=(select auth.uid())) with check(member_user_id=(select auth.uid()) and (clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=clinician_user_id and cp.verification_status in ('verified','self_reported'))));
drop policy if exists "Verified assigned clinicians view consultation requests" on public.consultation_requests;
create policy "Assigned clinicians view consultation requests" on public.consultation_requests for select to authenticated using(clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status in ('verified','self_reported')));
drop policy if exists "Verified assigned clinicians update consultation requests" on public.consultation_requests;
create policy "Assigned clinicians update consultation requests" on public.consultation_requests for update to authenticated using(clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status in ('verified','self_reported'))) with check(clinician_user_id=(select auth.uid()));

drop policy if exists "Members create own referral requests" on public.referral_requests;
create policy "Members create own referral requests" on public.referral_requests for insert to authenticated with check(member_user_id=(select auth.uid()) and (assigned_clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=assigned_clinician_user_id and cp.verification_status in ('verified','self_reported'))));
drop policy if exists "Members update own referral requests" on public.referral_requests;
create policy "Members update own referral requests" on public.referral_requests for update to authenticated using(member_user_id=(select auth.uid())) with check(member_user_id=(select auth.uid()) and (assigned_clinician_user_id is null or exists(select 1 from public.clinician_profiles cp where cp.user_id=assigned_clinician_user_id and cp.verification_status in ('verified','self_reported'))));
drop policy if exists "Verified assigned clinicians view referral requests" on public.referral_requests;
create policy "Assigned clinicians view referral requests" on public.referral_requests for select to authenticated using(assigned_clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status in ('verified','self_reported')));
drop policy if exists "Verified assigned clinicians update referral requests" on public.referral_requests;
create policy "Assigned clinicians update referral requests" on public.referral_requests for update to authenticated using(assigned_clinician_user_id=(select auth.uid()) and exists(select 1 from public.clinician_profiles cp where cp.user_id=(select auth.uid()) and cp.verification_status in ('verified','self_reported'))) with check(assigned_clinician_user_id=(select auth.uid()));

drop policy if exists "Care participants read their messages" on public.care_messages;
create policy "Care participants read their messages" on public.care_messages for select to authenticated using((care_messages.member_user_id=(select auth.uid()) or care_messages.clinician_user_id=(select auth.uid())) and exists(select 1 from public.consultation_requests cr where cr.id=care_messages.consultation_request_id and cr.member_user_id=care_messages.member_user_id and cr.clinician_user_id=care_messages.clinician_user_id));
drop policy if exists "Care participants send messages" on public.care_messages;
create policy "Care participants send messages" on public.care_messages for insert to authenticated with check(sender_user_id=(select auth.uid()) and (sender_user_id=member_user_id or sender_user_id=clinician_user_id) and exists(select 1 from public.consultation_requests cr where cr.id=care_messages.consultation_request_id and cr.member_user_id=care_messages.member_user_id and cr.clinician_user_id=care_messages.clinician_user_id and cr.status in ('accepted','scheduled')) and exists(select 1 from public.clinician_profiles cp where cp.user_id=care_messages.clinician_user_id and cp.verification_status in ('verified','self_reported')));
