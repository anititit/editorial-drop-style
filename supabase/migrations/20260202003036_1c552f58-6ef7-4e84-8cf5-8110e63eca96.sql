-- Create rate limiting table
CREATE TABLE public.rate_limits (
  ip_address TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (ip_address)
);

-- Enable RLS (public read/write needed for edge function with service role)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy for edge functions using service role
CREATE POLICY "Service role can manage rate limits"
  ON public.rate_limits
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Index for cleanup queries
CREATE INDEX idx_rate_limits_window ON public.rate_limits (window_start);

-- Function to check and increment rate limit (atomic operation)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_ip TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 60
)
RETURNS TABLE (allowed BOOLEAN, retry_after INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_count INTEGER;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- Try to get existing record
  SELECT window_start, request_count INTO v_window_start, v_count
  FROM rate_limits
  WHERE ip_address = p_ip
  FOR UPDATE;
  
  IF NOT FOUND THEN
    -- First request from this IP
    INSERT INTO rate_limits (ip_address, request_count, window_start)
    VALUES (p_ip, 1, v_now);
    RETURN QUERY SELECT true::BOOLEAN, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Check if window has expired
  IF v_now > v_window_start + (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Reset window
    UPDATE rate_limits
    SET request_count = 1, window_start = v_now
    WHERE ip_address = p_ip;
    RETURN QUERY SELECT true::BOOLEAN, 0::INTEGER;
    RETURN;
  END IF;
  
  -- Check if rate limited
  IF v_count >= p_max_requests THEN
    RETURN QUERY SELECT 
      false::BOOLEAN, 
      GREATEST(1, EXTRACT(EPOCH FROM (v_window_start + (p_window_seconds || ' seconds')::INTERVAL - v_now))::INTEGER);
    RETURN;
  END IF;
  
  -- Increment count
  UPDATE rate_limits
  SET request_count = request_count + 1
  WHERE ip_address = p_ip;
  
  RETURN QUERY SELECT true::BOOLEAN, 0::INTEGER;
END;
$$;

-- Cleanup function for old entries (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits(p_older_than_seconds INTEGER DEFAULT 300)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < now() - (p_older_than_seconds || ' seconds')::INTERVAL;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;