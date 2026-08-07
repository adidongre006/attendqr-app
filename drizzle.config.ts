import { defineConfig } from 'drizzle-kit';

import { config } from "dotenv";

config({ path: ".env.local" });

// Loads DATABASE_URL from your shell / .env when you run `npm run db:generate`
// or `npm run db:migrate`. Point this at your Neon connection string.
export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
});
