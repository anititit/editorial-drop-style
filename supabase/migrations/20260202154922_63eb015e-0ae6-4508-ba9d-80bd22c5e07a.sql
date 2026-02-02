-- Add DELETE policy for admins on pro_requests table
CREATE POLICY "Admins can delete pro_requests"
ON public.pro_requests
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));