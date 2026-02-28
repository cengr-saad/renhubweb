-- 1. DROP OLD FUNCTION
DROP FUNCTION IF EXISTS transition_request_status(uuid, text, jsonb);

-- 2. ENSURE ALL COLUMNS EXIST
ALTER TABLE public.rent_requests
ADD COLUMN IF NOT EXISTS cancellation_note TEXT,
ADD COLUMN IF NOT EXISTS handover_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS handover_rejection_note TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS rejection_note TEXT,
ADD COLUMN IF NOT EXISTS withdrawal_reason TEXT,
ADD COLUMN IF NOT EXISTS withdrawal_note TEXT,
ADD COLUMN IF NOT EXISTS dispute_reason TEXT,
ADD COLUMN IF NOT EXISTS dispute_note TEXT;

-- 2.5 ADD availability column to listings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS is_rented BOOLEAN DEFAULT false;

-- 3. FINAL STATE MACHINE FUNCTION (REFACTORED FOR SYNC)
CREATE OR REPLACE FUNCTION transition_request_status(
  p_request_id UUID,
  p_action TEXT,
  p_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request RECORD;
  v_new_status TEXT;
  v_listing_id UUID;
BEGIN
  SELECT * INTO v_request FROM public.rent_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Request not found'; END IF;
  
  v_listing_id := v_request.listing_id;

  -- 1. PENDING Transitions
  IF (p_action = 'ACCEPTED' OR p_action = 'accept') AND v_request.status = 'PENDING' THEN
    v_new_status := 'ACCEPTED';
    
  ELSIF (p_action = 'REJECTED' OR p_action = 'reject') AND v_request.status = 'PENDING' THEN
    v_new_status := 'REJECTED';
    UPDATE public.rent_requests SET
      rejection_reason = p_data->>'rejection_reason',
      rejection_note = p_data->>'rejection_note'
    WHERE id = p_request_id;

  ELSIF (p_action = 'WITHDRAWN' OR p_action = 'withdraw') AND v_request.status = 'PENDING' THEN
    v_new_status := 'WITHDRAWN';
    UPDATE public.rent_requests SET
      withdrawal_reason = p_data->>'withdrawal_reason',
      withdrawal_note = p_data->>'withdrawal_note'
    WHERE id = p_request_id;
    
  -- 2. HANDOVER flow
  ELSIF p_action = 'submit_handover' AND v_request.status = 'ACCEPTED' THEN
    v_new_status := 'HANDOVER_PENDING';
    UPDATE public.rent_requests SET
      actual_amount_paid = (p_data->>'actual_amount_paid')::numeric,
      security_deposit_paid = (p_data->>'security_deposit_paid')::numeric,
      transaction_id = p_data->>'transaction_id'
    WHERE id = p_request_id;
    
  ELSIF (p_action = 'LIVE' OR p_action = 'approve_handover') AND v_request.status = 'HANDOVER_PENDING' THEN
    v_new_status := 'LIVE';
    
  ELSIF p_action = 'reject_handover' AND v_request.status = 'HANDOVER_PENDING' THEN
    v_new_status := 'ACCEPTED'; 
    UPDATE public.rent_requests SET
      handover_rejection_reason = p_data->>'handover_rejection_reason',
      handover_rejection_note = p_data->>'handover_rejection_note'
    WHERE id = p_request_id;

  -- 3. RETURN & DISPUTE
  ELSIF (p_action = 'RETURN_PENDING' OR p_action = 'request_return') AND v_request.status = 'LIVE' THEN
    v_new_status := 'RETURN_PENDING';
    UPDATE public.rent_requests SET
      return_requested_by = auth.uid()
    WHERE id = p_request_id;

  ELSIF (p_action = 'COMPLETED' OR p_action = 'approve_return') AND v_request.status = 'RETURN_PENDING' THEN
    v_new_status := 'COMPLETED';
    UPDATE public.rent_requests SET
      return_approved_at = NOW()
    WHERE id = p_request_id;

  ELSIF p_action = 'reject_return' AND v_request.status = 'RETURN_PENDING' THEN
    v_new_status := 'LIVE';
    UPDATE public.rent_requests SET
      rejection_reason = p_data->>'rejection_reason',
      rejection_note = p_data->>'rejection_note'
    WHERE id = p_request_id;

  ELSIF p_action = 'DISPUTED' AND v_request.status = 'RETURN_PENDING' THEN
    v_new_status := 'DISPUTED';
    UPDATE public.rent_requests SET
      dispute_reason = p_data->>'reason',
      dispute_note = p_data->>'note',
      disputed_by = auth.uid()
    WHERE id = p_request_id;

  -- 4. GLOBAL CANCELLATION
  ELSIF p_action = 'cancel' THEN
    v_new_status := 'CANCELLED';
    UPDATE public.rent_requests SET
      cancellation_reason = p_data->>'cancellation_reason',
      note_to_other_party = p_data->>'note_to_other_party',
      cancelled_by = auth.uid()
    WHERE id = p_request_id;

  ELSE
    RAISE EXCEPTION 'Invalid transition attempted: % to %', v_request.status, p_action;
  END IF;

  -- Default Final Update (COMMIT STATUS)
  UPDATE public.rent_requests 
  SET status = v_new_status::public.request_status, updated_at = NOW() 
  WHERE id = p_request_id;

  -- 5. SYNC LISTING AVAILABILITY
  -- A listing is 'rented' if ANY order for it is LIVE, RETURN_PENDING, or DISPUTED.
  -- If all orders are COMPLETED, REJECTED, or CANCELLED, it becomes available.
  UPDATE public.listings 
  SET is_rented = EXISTS (
    SELECT 1 FROM public.rent_requests 
    WHERE listing_id = v_listing_id 
    AND status IN ('LIVE', 'RETURN_PENDING', 'DISPUTED')
  ), 
  updated_at = NOW() 
  WHERE id = v_listing_id;

  RETURN jsonb_build_object('id', p_request_id, 'status', v_new_status);
END;
$$;

-- 4. IMMEDIATE DATA REPAIR
-- This fixes any listings that are currently hidden but should be visible 
-- (i.e. they only have orders in PENDING, ACCEPTED, or HANDOVER stages)
UPDATE public.listings l
SET is_rented = EXISTS (
  SELECT 1 FROM public.rent_requests r
  WHERE r.listing_id = l.id
  AND r.status IN ('LIVE', 'RETURN_PENDING', 'DISPUTED')
);

-- 5. AUTO-CLEANUP USER HISTORY (KEEP LATEST 5 ORDERS ONLY)
-- Automatically deletes orders for a renter once they exceed 5 requests.
CREATE OR REPLACE FUNCTION cleanup_old_orders_fn()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.rent_requests
  WHERE renter_id = NEW.renter_id
  AND id NOT IN (
    SELECT id
    FROM public.rent_requests
    WHERE renter_id = NEW.renter_id
    ORDER BY created_at DESC
    LIMIT 5
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_old_orders ON public.rent_requests;
CREATE TRIGGER trigger_cleanup_old_orders
AFTER INSERT ON public.rent_requests
FOR EACH ROW
EXECUTE FUNCTION cleanup_old_orders_fn();
