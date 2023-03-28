import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  await db.exec("DROP TABLE s_prompts");

  const rows = await db.all(
    "SELECT * FROM prompts WHERE thumbnail IS NOT NULL"
  );

  for (let i = 0; i < rows.length; i++) {
    await db.run(
      "UPDATE prompts SET thumbnail = NULL WHERE listing_pda = ?",
      rows[i].listing_pda
    );
  }

})();
