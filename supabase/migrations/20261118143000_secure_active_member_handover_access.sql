-- Restrict clinician visibility to the exact assigned, approved, non-revoked handover.
DROP POLICY IF EXISTS "Assigned prototype clinicians can view shared handovers" ON public.health_handovers;
CREATE POLICY "Assigned clinicians can view active approved handovers"
ON public.health_handovers
FOR SELECT
TO authenticated
USING (
  clinician_user_id = (SELECT auth.uid())
  AND status IN ('approved_for_sharing','viewed')
  AND EXISTS (
    SELECT 1
    FROM public.clinician_profiles cp
    WHERE cp.user_id = (SELECT auth.uid())
      AND cp.verification_status IN ('verified','self_reported')
  )
  AND EXISTS (
    SELECT 1
    FROM public.sharing_consents sc
    WHERE sc.id = health_handovers.consent_id
      AND sc.member_user_id = health_handovers.member_user_id
      AND sc.revoked_at IS NULL
      AND sc.selected_sections ->> 'clinician_user_id' = (SELECT auth.uid())::text
  )
);

-- Keep member ownership and explicit approval as the only write path.
-- Members can revoke consent; clinician access is removed immediately by the SELECT policy above.
