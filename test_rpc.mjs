import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    const result = await pool.query(`
    SELECT * FROM public.get_listing_ids_filtered(
      p_search_query := NULL,
      p_user_lat := NULL,
      p_user_long := NULL,
      p_radius_km := NULL,
      p_category := NULL,
      p_min_price := NULL,
      p_max_price := NULL,
      p_duration_type := NULL,
      p_has_security_deposit := NULL,
      p_sort_by := 'latest',
      p_limit := 10,
      p_offset := 0,
      p_location_query := 'some_fake_made_up_location_that_does_not_exist'
    );
  `);
    console.log('Results with fake location:', result.rows.length);

    const result2 = await pool.query(`
    SELECT * FROM public.get_listing_ids_filtered(
      p_search_query := NULL,
      p_user_lat := NULL,
      p_user_long := NULL,
      p_radius_km := NULL,
      p_category := NULL,
      p_min_price := NULL,
      p_max_price := NULL,
      p_duration_type := NULL,
      p_has_security_deposit := NULL,
      p_sort_by := 'featured',
      p_limit := 10,
      p_offset := 0,
      p_location_query := 'some_fake_made_up_location_that_does_not_exist'
    );
  `);
    console.log('Results with fake location (featured):', result2.rows.length);

    process.exit(0);
}
check().catch(console.error);
