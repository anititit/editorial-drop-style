-- Drop the conflicting policy that blocks all access
DROP POLICY IF EXISTS "Service role full access" ON public.rate_limits;

-- The "Allow service role" policy remains and is sufficient
-- It grants access only to service_role, which is the correct behavior
-- RLS enabled + no policy for anon/authenticated = they are blocked by default