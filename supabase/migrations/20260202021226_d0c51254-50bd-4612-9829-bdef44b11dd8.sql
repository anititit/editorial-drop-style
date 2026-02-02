-- Add explicit PERMISSIVE policy to deny all public access to rate_limits
-- This ensures IP addresses cannot be exposed even if other policies are added later
CREATE POLICY "Deny public access" ON public.rate_limits
FOR ALL
TO public
USING (false)
WITH CHECK (false);