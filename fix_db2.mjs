import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function run() {
  try {
    await pool.query('ALTER TABLE messages ADD COLUMN is_system BOOLEAN DEFAULT FALSE;');
    console.log("Added is_system column successfully");
  } catch(e) {
    console.log("Column might already exist or error: ", e.message);
  }
  process.exit(0);
}
run();
