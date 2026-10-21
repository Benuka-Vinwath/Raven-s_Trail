import { Pool, types } from "pg";
import { env } from "../config/env.js";

// return DATE columns as plain "YYYY-MM-DD" strings; JS Dates would shift them by the server timezone
types.setTypeParser(1082, (v) => v);

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(1);
});
