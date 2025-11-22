-- Drop the public read policy
DROP POLICY IF EXISTS "Anyone can view feedback" ON public.feedback;

-- Create a new policy that only allows authenticated users to view feedback
-- You can further restrict this to specific admin users if needed
CREATE POLICY "Only authenticated users can view feedback"
  ON public.feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- Keep the public insert policy so anyone can submit feedback
-- The existing "Anyone can submit feedback" policy remains unchanged