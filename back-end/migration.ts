import sqlite3 from "sqlite3";
import { open } from "sqlite";

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

})();
