-- Add explicit policy allowing ONLY service_role access (blocks anon/authenticated)
-- This is defense-in-depth since RLS with no policies already blocks access

CREATE POLICY "Service role only" 
ON public.rate_limits 
FOR ALL 
USING (
  (SELECT current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);