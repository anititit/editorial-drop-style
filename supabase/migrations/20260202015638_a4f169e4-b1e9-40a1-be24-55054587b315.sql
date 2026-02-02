-- Drop the existing RESTRICTIVE policy
DROP POLICY IF EXISTS "Service role only" ON public.rate_limits;

-- Create a PERMISSIVE policy that allows ONLY service_role full access
-- This is the correct pattern: PERMISSIVE grants access, and we only grant to service_role
CREATE POLICY "Service role full access" 
ON public.rate_limits 
FOR ALL 
TO authenticated, anon
USING (false)
WITH CHECK (false);

-- Create policy that allows service_role (which bypasses RLS anyway, but explicit is better)
CREATE POLICY "Allow service role" 
ON public.rate_limits 
FOR ALL 
USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
)
WITH CHECK (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);