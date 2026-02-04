-- Create a validation trigger function for pro_requests
-- Using trigger instead of CHECK constraints for better flexibility
CREATE OR REPLACE FUNCTION public.validate_pro_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate name (2-200 characters)
  IF length(NEW.name) < 2 OR length(NEW.name) > 200 THEN
    RAISE EXCEPTION 'Name must be between 2 and 200 characters';
  END IF;

  -- Validate email format
  IF NEW.email !~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate email length
  IF length(NEW.email) > 255 THEN
    RAISE EXCEPTION 'Email must be less than 255 characters';
  END IF;

  -- Validate WhatsApp (10-20 digits, allowing common formatting)
  IF NEW.whatsapp !~ '^[\d\s\+\-\(\)]{10,25}$' THEN
    RAISE EXCEPTION 'Invalid WhatsApp number format';
  END IF;

  -- Validate order_code length
  IF length(NEW.order_code) < 4 OR length(NEW.order_code) > 20 THEN
    RAISE EXCEPTION 'Invalid order code format';
  END IF;

  -- Validate optional text fields (max 1000 chars each)
  IF NEW.objective IS NOT NULL AND length(NEW.objective) > 1000 THEN
    RAISE EXCEPTION 'Objective must be less than 1000 characters';
  END IF;

  IF NEW.platform IS NOT NULL AND length(NEW.platform) > 200 THEN
    RAISE EXCEPTION 'Platform must be less than 200 characters';
  END IF;

  IF NEW.occasion IS NOT NULL AND length(NEW.occasion) > 200 THEN
    RAISE EXCEPTION 'Occasion must be less than 200 characters';
  END IF;

  IF NEW.tone IS NOT NULL AND length(NEW.tone) > 200 THEN
    RAISE EXCEPTION 'Tone must be less than 200 characters';
  END IF;

  IF NEW.budget IS NOT NULL AND length(NEW.budget) > 100 THEN
    RAISE EXCEPTION 'Budget must be less than 100 characters';
  END IF;

  -- Validate reference_urls (max 10 URLs, each max 2000 chars)
  IF array_length(NEW.reference_urls, 1) > 10 THEN
    RAISE EXCEPTION 'Maximum 10 reference URLs allowed';
  END IF;

  -- Validate each URL in the array
  IF NEW.reference_urls IS NOT NULL AND array_length(NEW.reference_urls, 1) > 0 THEN
    FOR i IN 1..array_length(NEW.reference_urls, 1) LOOP
      IF length(NEW.reference_urls[i]) > 2000 THEN
        RAISE EXCEPTION 'Reference URL too long (max 2000 characters)';
      END IF;
      -- Basic URL format check (must start with http:// or https://)
      IF NEW.reference_urls[i] !~* '^https?://' THEN
        RAISE EXCEPTION 'Reference URLs must start with http:// or https://';
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the trigger on pro_requests table
DROP TRIGGER IF EXISTS validate_pro_request_trigger ON public.pro_requests;
CREATE TRIGGER validate_pro_request_trigger
  BEFORE INSERT OR UPDATE ON public.pro_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_pro_request();