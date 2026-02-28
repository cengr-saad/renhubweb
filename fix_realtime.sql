-- 1. Enable Realtime for rent_requests 
-- This allows the app to instantly see new requests on the "Owner" screen
ALTER PUBLICATION supabase_realtime ADD TABLE rent_requests;

-- 2. Grant permissions (safety check)
GRANT ALL ON public.rent_requests TO postgres;
GRANT ALL ON public.rent_requests TO anon;
GRANT ALL ON public.rent_requests TO authenticated;
GRANT ALL ON public.rent_requests TO service_role;

-- 3. Instructions:
-- Run this script in your Supabase SQL Editor.
-- Then, on the Owner's device/simulator:
-- a. Go to 'Orders' screen
-- b. Toggle 'As Owner'
-- c. Pull to Refresh
