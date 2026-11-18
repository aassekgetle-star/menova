create index if not exists care_messages_member_user_id_idx on public.care_messages(member_user_id);
create index if not exists care_messages_clinician_user_id_idx on public.care_messages(clinician_user_id);
create index if not exists care_messages_sender_user_id_idx on public.care_messages(sender_user_id);
create index if not exists referral_requests_assigned_clinician_user_id_idx on public.referral_requests(assigned_clinician_user_id);
