import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });
  await db.exec("ALTER TABLE prompts ADD COLUMN views INTEGER DEFAULT 0");
  await db.exec("ALTER TABLE prompts ADD COLUMN saves INTEGER DEFAULT 0");
})();
