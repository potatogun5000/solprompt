export const createTables = async (db) => {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS prompts(id integer primary key, listing_pda TEXT, title TEXT, prompt TEXT, instructions TEXT, ai_settings TEXT, signature TEXT, confirmed INTEGER, approved INTEGER, tries INTEGER, owner TEXT, UNIQUE(signature))"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS images(listing_pda TEXT, filename TEXT)"
  );
};

export const approveSigsLoop = async (db, connection) => {
  try {
    const result = await db.all("SELECT * FROM prompts WHERE confirmed = 0");

    for (let i = 0; i < result.length; i++) {
      try {
        const tx = await connection.getConfirmedTransaction(
          result[i].signature
        );

        if (!tx) throw new Error("failed");

        if (tx.meta.err) throw new Error("failed");

        await db.run(
          "UPDATE prompts SET confirmed = 1 WHERE id = ?",
          result[i].id
        );
      } catch (error) {
        if (result[i].tries < 50) {
          await db.run(
            "UPDATE prompts SET tries = ? WHERE id = ?",
            result[i].tries + 1,
            result[i].id
          );
        } else {
          await db.run("DELETE FROM prompts WHERE id = ?", result[i].id);
        }
      }
    }
  } catch (error) {
    console.log("somethings wrong", error);
  }

  await new Promise((r) => setTimeout(r, 5000));
  return approveSigsLoop(db, connection);
};
