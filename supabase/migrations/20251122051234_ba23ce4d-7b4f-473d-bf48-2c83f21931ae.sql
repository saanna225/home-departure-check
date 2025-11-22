-- Add explicit DELETE policy for feedback (admins only)
CREATE POLICY "Only admins can delete feedback"
  ON public.feedback
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Add explicit UPDATE policy (deny all - feedback is immutable)
CREATE POLICY "Feedback cannot be updated"
  ON public.feedback
  FOR UPDATE
  TO authenticated
  USING (false);