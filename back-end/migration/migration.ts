import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  const combos = JSON.parse(
    fs.readFileSync("./migration/real-tag-to-tags.json", "utf8")
  );
  const keys = Object.keys(combos);

  for await (const k of keys) {
    const arr = combos[k];
    console.log(k);

    for (let i = 0; i < arr.length; i++) {
      const tag = arr[i];

      const rows = await db.all("SELECT * FROM tags WHERE text like ?", tag);

      for (let r = 0; r < rows.length; r++) {
        const { listing_pda } = rows[r];

        try {
          await db.run("INSERT INTO tags VALUES(?, ?)", listing_pda, k);
        } catch (error) {
          //console.log(error.message);
        }
      }
    }
  }
})();
