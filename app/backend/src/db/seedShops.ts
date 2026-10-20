// Adds (or refreshes) the real gear rental shops without touching trails, reviews, trips or users.
import { pool } from "./pool.js";
import { insertRealShops, realShops } from "./gearShopData.js";

async function seedShops() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await insertRealShops(client);
    await client.query("COMMIT");
    console.log(`inserted ${realShops.length} real gear shops`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

seedShops()
  .catch((err) => {
    console.error("Seeding shops failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
