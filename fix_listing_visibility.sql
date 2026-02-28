-- Refine listing visibility logic
-- A listing should only be hidden if hide_on_rent is true AND there is a LIVE or RETURN_PENDING order.
-- Statuses like PENDING, ACCEPTED, HANDOVER_PENDING should NOT hide the listing.

-- 1. Refine the has_active_orders check
CREATE OR REPLACE FUNCTION public.has_active_orders(p_listing_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.rent_requests
    WHERE listing_id = p_listing_id
    AND status IN ('LIVE', 'RETURN_PENDING', 'DISPUTED')
  );
END;
$$;

-- 2. Refine the sync_listing_visibility function to use the updated has_active_orders
CREATE OR REPLACE FUNCTION public.sync_listing_visibility(p_listing_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hide_on_rent BOOLEAN;
  v_has_active BOOLEAN;
BEGIN
  -- Get the hide_on_rent setting
  SELECT COALESCE(hide_on_rent, true) INTO v_hide_on_rent 
  FROM public.listings 
  WHERE id = p_listing_id;
  
  -- Check if there are truly active orders (LIVE/RETURN_PENDING/DISPUTED)
  v_has_active := public.has_active_orders(p_listing_id);
  
  -- Update is_rented boolean based on owner preference and active rental status
  UPDATE public.listings 
  SET is_rented = (v_hide_on_rent AND v_has_active),
      updated_at = NOW()
  WHERE id = p_listing_id;
END;
$$;

-- 3. Run a global sync to fix existing incorrectly hidden listings
SELECT public.sync_listing_visibility(id) FROM public.listings;
