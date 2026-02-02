-- Remove políticas permissivas da tabela de rate limit
-- A edge function usa service role (bypass de RLS).
-- Com RLS ligado e sem policies, anon/auth não conseguem ler/escrever.

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

DROP POLICY IF EXISTS "RLS Policy Always True" ON public.rate_limits;