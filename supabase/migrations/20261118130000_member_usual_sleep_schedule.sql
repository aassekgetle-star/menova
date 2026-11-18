-- Remember each member's usual sleep routine for automatic lifestyle check-ins.
alter table public.member_profiles
  add column if not exists usual_sleep_time time without time zone,
  add column if not exists usual_wake_time time without time zone;

comment on column public.member_profiles.usual_sleep_time is
  'Member-selected usual bedtime, used to prefill lifestyle check-ins.';
comment on column public.member_profiles.usual_wake_time is
  'Member-selected usual wake time, used to prefill lifestyle check-ins.';
