import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        await pool.query(`
      -- Create a secure function to clean up old, unverified users
      CREATE OR REPLACE FUNCTION public.delete_unverified_old_users()
      RETURNS void AS $$
      BEGIN
          -- We delete directly from auth.users.
          -- Because public.users is linked via a foreign key with ON DELETE CASCADE,
          -- the public profile will also be automatically deleted.
          DELETE FROM auth.users 
          WHERE email_confirmed_at IS NULL 
            AND created_at < NOW() - INTERVAL '7 days';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);

        console.log("Cleanup function created successfully!");

        try {
            await pool.query(`
        -- Attempt to schedule the job using pg_cron to run every midnight
        CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
      `);

            try {
                await pool.query(`SELECT cron.unschedule('cleanup-unverified-users');`);
            } catch (e) {
                // Ignore if it wasn't scheduled yet
            }

            await pool.query(`
        SELECT cron.schedule(
          'cleanup-unverified-users', 
          '0 0 * * *', 
          'SELECT public.delete_unverified_old_users()'
        );
      `);
            console.log("Automated nightly garbage collection scheduled successfully!");
        } catch (scheduleError) {
            console.error("Could not schedule automatically (pg_cron may not be enabled):", scheduleError.message);
            console.log("The function 'delete_unverified_old_users()' has been added to your database. You can manually execute it anytime or trigger it via a serverless cron job/Supabase Dashboard.");
        }

    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        pool.end();
    }
}
run();
