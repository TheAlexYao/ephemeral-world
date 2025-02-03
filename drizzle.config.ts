import type { Config } from "drizzle-kit";

export default {
  schema: "./src/drizzle/schema.ts",
  out: "./src/drizzle/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
  },
} satisfies Config; 