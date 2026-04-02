import 'dotenv/config';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import config from '../config/config.js';

const pool = new Pool({ connectionString: config.databaseUrl });
const db = drizzle({ client: pool });

export default db;
