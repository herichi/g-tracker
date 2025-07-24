-- Fix critical RLS issue: Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Fix critical RLS issue: Enable RLS on panels table  
ALTER TABLE public.panels ENABLE ROW LEVEL SECURITY;

-- Fix critical RLS issue: Enable RLS on buildings table
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;

-- Fix critical RLS issue: Enable RLS on history table
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- Add missing UPDATE policy for panels table
CREATE POLICY "Users can update panels" 
ON public.panels 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);