import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment variables');
}

const pool = new Pool({
  connectionString,
});

pool.query('SELECT NOW()')
  .then(res => console.log('Database connected successfully'))
  .catch(err => console.error('Error connecting to the database', err.stack));

export default pool;
