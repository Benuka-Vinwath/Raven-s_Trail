// Adds the extra trails to an existing database without touching reviews, trips or users.
import { pool } from "./pool.js";
import { applyTrailCosts, insertTrail, moreTrails } from "./trailData.js";

async function addTrails() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    let added = 0;
    for (const t of moreTrails) if (await insertTrail(client, t, true)) added++;
    await applyTrailCosts(client);
    await client.query("COMMIT");
    console.log(`added ${added} new trails (${moreTrails.length - added} already existed)`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

addTrails()
  .catch((err) => {
    console.error("Adding trails failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
