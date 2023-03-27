import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });
  await db.exec("ALTER TABLE s_prompts ADD COLUMN thumbnail TEXT");
  await db.exec("ALTER TABLE s_prompts ADD COLUMN scraped INTEGER");

  await db.exec("ALTER TABLE prompts ADD COLUMN thumbnail TEXT");
  await db.exec("ALTER TABLE prompts ADD COLUMN scraped INTEGER");
  /*
  let done = true;
  let offset = 0;
  while (done) {
    const rows = await db.all(
      "SELECT id, title, listing_pda, price, ai_type, views, saves, description, owner FROM s_prompts LIMIT ? OFFSET ?",
      50,
      offset
    );

    for (let i = 0; i < rows.length; i++) {
      const images = await db.all(
        "SELECT * FROM images WHERE listing_pda = ? LIMIT 1",
        rows[i].listing_pda
      );

      await db.run(
        "UPDATE s_prompts SET thumbnail = ? WHERE listing_pda = ?",
        images[0].cdn,
        rows[i].listing_pda
      );
    }

    offset+= 50;
    console.log(rows);

    if (rows.length === 0) done = false;
  }*/
})();
