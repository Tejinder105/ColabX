import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: [
    './src/schemas/authSchema.ts',
    './src/schemas/orgSchema.ts',
    './src/schemas/collaborationSchema.ts',
    './src/teams/teams.schema.ts',
    './src/partners/partners.schema.ts',
    './src/contacts/contacts.schema.ts',
    './src/deals/deals.schema.ts',
    './src/okr/okr.schema.ts',
  ],
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
