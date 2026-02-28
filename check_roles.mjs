import dotenv from 'dotenv';
dotenv.config();

import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
    try {
        const result = await pool.query("SELECT policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'users'");
        console.log(result.rows);
    } catch (e) { console.error(e) }
    pool.end();
}
run();
