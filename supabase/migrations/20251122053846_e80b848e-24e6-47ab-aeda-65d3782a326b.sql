-- Add INSERT policy to prevent direct inserts into audit log
-- Only the SECURITY DEFINER trigger function can insert (which bypasses RLS)
-- This policy denies all direct user attempts to insert
CREATE POLICY "Prevent direct audit log inserts"
  ON public.role_audit_log
  FOR INSERT
  WITH CHECK (false);

-- Also add UPDATE and DELETE policies to prevent tampering
CREATE POLICY "Prevent audit log updates"
  ON public.role_audit_log
  FOR UPDATE
  USING (false);

CREATE POLICY "Prevent audit log deletion"
  ON public.role_audit_log
  FOR DELETE
  USING (false);