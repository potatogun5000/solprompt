import { PublicKey } from "@solana/web3.js";

export const createTables = async (db) => {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS prompts(id integer primary key, listing_pda TEXT, title TEXT, prompt TEXT, instructions TEXT, ai_settings TEXT, signature TEXT, confirmed INTEGER, approved INTEGER, tries INTEGER, owner TEXT, description TEXT, ai_type TEXT, UNIQUE(signature))"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS images(listing_pda TEXT, filename TEXT)"
  );
};

export const approvedCacheLoop = async (db, memoryCache) => {
  try {
    const result = await db.all(
      "SELECT * FROM prompts WHERE approved = 1 AND confirmed = 1"
    );

    for (let i = 0; i < result.length; i++) {
      const images = await db.all(
        "SELECT filename FROM images WHERE listing_pda = ?",
        result[i].listing_pda
      );

      result[i].images = images;

      delete result[i].instructions;
      delete result[i].prompt;
      delete result[i].ai_settings;

    }

    memoryCache.approved = result;
  } catch (error) {
    console.log(error);
  }
  await new Promise((r) => setTimeout(r, 1000 * 30));
  return approvedCacheLoop(db, memoryCache);
};

export const approvePromptsLoop = async (db, connection) => {
  try {
    const result = await db.all(
      "SELECT * FROM prompts WHERE approved = 0 AND confirmed = 1"
    );

    for (let i = 0; i < result.length; i++) {
      try {
        const info = await connection.getAccountInfo(
          new PublicKey(result[i].listing_pda)
        );

        if (info.owner.toBase58() !== process.env.CONTRACT_ID) continue;

        const bytes = new Uint8Array(info.data);
        const isApproved = bytes[8];

        if (isApproved !== 1) continue;

        await db.run(
          "UPDATE prompts SET approved = 1 WHERE id = ?",
          result[i].id
        );
      } catch (err) {
        console.log("problem with ", i, err.message);
      }
    }
  } catch (error) {
    console.log("somethings wrong", error);
  }
  await new Promise((r) => setTimeout(r, 1000 * 10));
  return approvePromptsLoop(db, connection);
};

export const confirmPromptsLoop = async (db, connection) => {
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
  return confirmPromptsLoop(db, connection);
};
