-- MENOVA prototype doctor registration and account access
-- Professional details are self-reported for prototype testing and are not verified.
ALTER TABLE public.clinician_profiles
  DROP CONSTRAINT IF EXISTS clinician_profiles_verification_status_check;
ALTER TABLE public.clinician_profiles
  ADD CONSTRAINT clinician_profiles_verification_status_check
  CHECK (verification_status = ANY (ARRAY['pending','self_reported','verified','rejected','suspended']));

DROP POLICY IF EXISTS "Clinicians can create an unverified profile for themselves" ON public.clinician_profiles;
CREATE POLICY "Clinicians can create a self-reported profile for themselves"
  ON public.clinician_profiles FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id AND verification_status = 'self_reported');

DROP POLICY IF EXISTS "Members can view verified clinician directory" ON public.clinician_profiles;
CREATE POLICY "Members can view prototype clinician directory"
  ON public.clinician_profiles FOR SELECT TO authenticated
  USING (verification_status IN ('verified','self_reported'));

DROP POLICY IF EXISTS "Verified assigned clinicians can view shared handovers" ON public.health_handovers;
CREATE POLICY "Assigned prototype clinicians can view shared handovers"
  ON public.health_handovers FOR SELECT TO authenticated
  USING (
    clinician_user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.clinician_profiles cp
      WHERE cp.user_id = (SELECT auth.uid())
    )
  );
