-- Update get_listing_ids_filtered to include category in search matches

CREATE OR REPLACE FUNCTION public.get_listing_ids_filtered(
    p_search_query text DEFAULT NULL::text, 
    p_user_lat double precision DEFAULT NULL::double precision, 
    p_user_long double precision DEFAULT NULL::double precision, 
    p_radius_km double precision DEFAULT NULL::double precision, 
    p_category text DEFAULT NULL::text, 
    p_min_price numeric DEFAULT NULL::numeric, 
    p_max_price numeric DEFAULT NULL::numeric, 
    p_duration_type text DEFAULT NULL::text, 
    p_has_security_deposit boolean DEFAULT NULL::boolean, 
    p_sort_by text DEFAULT 'best_match'::text, 
    p_limit integer DEFAULT 20, 
    p_offset integer DEFAULT 0, 
    p_location_query text DEFAULT NULL::text
) RETURNS TABLE(id uuid, distance_km double precision)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sub.id,
    sub.distance_km
  FROM (
    SELECT 
      l.id,
      l.created_at,
      l.price_daily,
      COALESCE(
        (SELECT AVG(rev.rating) FROM reviews rev WHERE rev.listing_id = l.id AND (rev.visible_at IS NULL OR rev.visible_at <= NOW())),
        0
      ) as average_rating,
      l.listing_type,
      l.featured_until,
      (
        CASE
          WHEN p_user_lat IS NOT NULL AND p_user_long IS NOT NULL AND l.latitude IS NOT NULL AND l.longitude IS NOT NULL THEN
            6371 * acos(
              least(1.0, greatest(-1.0, 
                cos(radians(p_user_lat)) * cos(radians(l.latitude)) * cos(radians(l.longitude) - radians(p_user_long)) +
                sin(radians(p_user_lat)) * sin(radians(l.latitude))
              ))
            )
          ELSE NULL
        END
      ) AS distance_km
    FROM listings l
    WHERE 
      l.status = 'active'
      AND COALESCE(l.is_rented, FALSE) = FALSE
      AND (l.expires_at IS NULL OR l.expires_at > NOW())
      -- Category Filter (Explicit)
      AND (p_category IS NULL OR p_category = 'all' OR l.category = p_category)
      -- Search Query (Includes Category match now)
      AND (p_search_query IS NULL OR p_search_query = '' OR 
           l.title ILIKE '%' || p_search_query || '%' OR 
           l.description ILIKE '%' || p_search_query || '%' OR
           l.location ILIKE '%' || p_search_query || '%' OR
           l.category ILIKE '%' || p_search_query || '%')
      -- Location Query
      AND (p_location_query IS NULL OR p_location_query = '' OR l.location ILIKE '%' || p_location_query || '%')
      -- Price Range
      AND (p_min_price IS NULL OR l.price_daily >= p_min_price)
      AND (p_max_price IS NULL OR l.price_daily <= p_max_price)
      -- Duration Type
      AND (p_duration_type IS NULL OR p_duration_type = 'any' OR p_duration_type = ANY(l.allowed_durations::text[]))
      -- Security Deposit
      AND (p_has_security_deposit IS NULL OR 
           (p_has_security_deposit = TRUE AND l.deposit_daily > 0) OR
           (p_has_security_deposit = FALSE AND (l.deposit_daily IS NULL OR l.deposit_daily = 0)))
  ) AS sub
  WHERE 
    (p_radius_km IS NULL OR sub.distance_km IS NULL OR sub.distance_km <= p_radius_km)
    AND (p_sort_by <> 'top_rated' OR sub.average_rating >= 4.5)
  ORDER BY 
    -- FEATURED FIRST
    (LOWER(COALESCE(sub.listing_type, '')) = 'featured' AND (sub.featured_until IS NULL OR sub.featured_until > NOW())) DESC,
    
    -- SECONDARY SORT
    CASE WHEN p_sort_by = 'latest' THEN sub.created_at END DESC,
    CASE WHEN p_sort_by = 'top_rated' THEN sub.average_rating END DESC,
    CASE WHEN p_sort_by = 'price_low' THEN sub.price_daily END ASC,
    CASE WHEN p_sort_by = 'price_high' THEN sub.price_daily END DESC,
    CASE WHEN p_sort_by = 'near_you' THEN sub.distance_km ELSE sub.distance_km END ASC NULLS LAST
  LIMIT p_limit OFFSET p_offset;
END;
$$;
