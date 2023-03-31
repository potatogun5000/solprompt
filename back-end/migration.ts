import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as b58 from "b58";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  await db.run("DELETE FROM prompts WHERE id = ?", "2891");
  await db.run("DELETE FROM prompts WHERE id = ?", "2767");
  await db.run(
    "DELETE FROM prompts WHERE listing_pda = ?",
    "d9a736d0d85a13ccf0acb4d127e9b64c5b1e02d152b04863730305e5e78045c1"
  );
  await db.run(
    "DELETE FROM prompts WHERE listing_pda = ?",
    "440a3bda6793fb1e8a2a591ec2c9793ed6541687bf95a1477a0815d45eb81ab8"
  );
  await db.run(
    "DELETE FROM prompts WHERE listing_pda = ?",
    "f5d53088889cf95b36e7475e5313e942aa6922cc4470136ff53e6d917a875676"
  );

  const rows = await db.all("SELECT * FROM prompts WHERE scraped IS NOT NULL");
  for(let i = 0; i < rows.length; i++){
    const a_settings = b58.decode(rows[i].ai_settings).toString();
    await db.run("UPDATE prompts SET ai_settings = ? WHERE id = ?", a_settings, rows[i].id)
  }

})();
