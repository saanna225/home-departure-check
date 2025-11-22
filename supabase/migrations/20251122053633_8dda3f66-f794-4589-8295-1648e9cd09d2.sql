-- Create audit log table for role changes
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  action text NOT NULL CHECK (action IN ('granted', 'revoked')),
  performed_by uuid REFERENCES auth.users(id),
  performed_at timestamp with time zone NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON public.role_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.role_audit_log (user_id, role, action, performed_by, metadata)
    VALUES (NEW.user_id, NEW.role, 'granted', auth.uid(), jsonb_build_object('operation', TG_OP));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.role_audit_log (user_id, role, action, performed_by, metadata)
    VALUES (OLD.user_id, OLD.role, 'revoked', auth.uid(), jsonb_build_object('operation', TG_OP));
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for role changes
DROP TRIGGER IF EXISTS role_change_audit ON public.user_roles;
CREATE TRIGGER role_change_audit
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- Add explicit policy to prevent regular users from inserting roles
-- Drop existing admin policy and recreate with more specific permissions
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow service role (edge functions) to bypass RLS for initial admin setup
-- This is needed for the grant-admin edge function
ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;