-- Fix 1: Remove overly permissive "Service role full access" policy on pro_requests
-- The admin-specific policies already handle proper access control
DROP POLICY IF EXISTS "Service role full access" ON public.pro_requests;

-- Fix 2: Add missing INSERT, UPDATE, DELETE policies on user_roles
-- Only admins should be able to manage user roles

-- Allow admins to insert new user roles
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update user roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user roles
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));