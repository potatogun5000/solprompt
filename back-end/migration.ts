import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  //move all s_prompts into prompts with scraped = 1

  /*
    await db.exec(
    "CREATE TABLE IF NOT EXISTS s_prompts(id integer primary key, listing_pda TEXT, title TEXT, prompt TEXT, instructions TEXT, ai_settings TEXT, signature TEXT, confirmed INTEGER, approved INTEGER, tries INTEGER, owner TEXT, description TEXT, ai_type TEXT, price TEXT, views INTEGER, saves INTEGER, thumbnail TEXT, scraped INTEGER, UNIQUE(signature))"
  );*/

  const rows = await db.all("SELECT * FROM s_prompts");

  for (let i = 0; i < rows.length; i++) {
    const {
      listing_pda,
      title,
      prompt,
      instructions,
      ai_settings,
      signature,
      confirmed,
      approved,
      tries,
      owner,
      description,
      ai_type,
      price,
      views,
      saves,
      thumbnail,
      scraped,
    } = rows[i];

    await db.exec(
      `INSERT INTO prompts VALUES (NULL, "${listing_pda}", "${title}", "${prompt}", "${instructions}", "${ai_settings}", "${signature}", 1, 1, 0, "${owner}", "${description}", "${ai_type}", "${price}", 0, 0, NULL, 1)`
    );
    console.log(i);
  }


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
