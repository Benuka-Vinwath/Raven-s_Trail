import { Pool } from "pg";
import { env } from "../config/env.js";

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(1);
});
