-- Create function for updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for Pro editorial requests (metadata only, no image storage)
CREATE TABLE public.pro_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  objective TEXT,
  platform TEXT,
  occasion TEXT,
  tone TEXT,
  budget TEXT,
  reference_urls TEXT[] NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pro_requests ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone (public form)
CREATE POLICY "Allow public inserts"
ON public.pro_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Only service role can read/update (for admin access)
CREATE POLICY "Service role full access"
ON public.pro_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_pro_requests_updated_at
BEFORE UPDATE ON public.pro_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();