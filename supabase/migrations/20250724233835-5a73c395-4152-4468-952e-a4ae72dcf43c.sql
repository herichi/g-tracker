-- Phase 1: Critical Database Security Fixes

-- 1. Create security definer functions to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.can_manage_users()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
$$;

-- 2. Fix existing is_admin function with proper search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'::user_role
  )
$$;

-- 3. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing insecure policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 5. Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.can_manage_users());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role = OLD.role); -- Prevent role escalation

CREATE POLICY "Only admins can update user roles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.can_manage_users())
WITH CHECK (public.can_manage_users());

CREATE POLICY "Only admins can insert new profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_users());

-- 6. Update projects RLS policies to use security definer functions
DROP POLICY IF EXISTS "Users can update projects they created or admins/managers can u" ON public.projects;

CREATE POLICY "Users can update projects they created or admins/managers can update"
ON public.projects
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid() OR 
  public.can_manage_users() OR 
  public.get_current_user_role() = 'project_manager'::user_role
);

-- 7. Update buildings RLS policies
DROP POLICY IF EXISTS "Project managers and admins can insert buildings" ON public.buildings;
DROP POLICY IF EXISTS "Project managers and admins can update buildings" ON public.buildings;

CREATE POLICY "Project managers and admins can insert buildings"
ON public.buildings
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_manage_users() OR 
  public.get_current_user_role() = 'project_manager'::user_role
);

CREATE POLICY "Project managers and admins can update buildings"
ON public.buildings
FOR UPDATE
TO authenticated
USING (
  public.can_manage_users() OR 
  public.get_current_user_role() = 'project_manager'::user_role OR
  created_by = auth.uid()
);

-- 8. Create audit_logs table for security monitoring
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.can_manage_users());

-- 9. Create audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values
    ) VALUES (
      auth.uid(),
      'ROLE_CHANGE',
      TG_TABLE_NAME,
      NEW.id::text,
      jsonb_build_object('role', OLD.role),
      jsonb_build_object('role', NEW.role)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 10. Create audit trigger for profile role changes
CREATE TRIGGER audit_profile_role_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_function();