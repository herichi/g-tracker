-- Fix project creation by allowing data_entry users to create projects
DROP POLICY IF EXISTS "Project managers and admins can insert projects" ON public.projects;

CREATE POLICY "Authenticated users can insert projects" 
ON public.projects 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow data_entry users to update projects they created
DROP POLICY IF EXISTS "Project managers and admins can update projects" ON public.projects;

CREATE POLICY "Users can update projects they created or admins/managers can update all" 
ON public.projects 
FOR UPDATE 
USING (
  created_by = auth.uid() OR 
  is_admin() OR 
  (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'project_manager'::user_role))
);