import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import config from '../config/config.js';

const db = drizzle(config.databaseUrl);

export default db;
