import { PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { ShdwDrive, ShadowFile } from "@shadow-drive/sdk";
import fs from "fs";
import rimraf from "rimraf";
import path from "path";
import sharp from "sharp";

const download = require("image-downloader");

export const getPda = async (programId, seed, inputs) => {
  const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(seed),
      ...inputs.map((input) => input.toBytes()),
    ],
    new PublicKey(programId)
  );

  return pda;
};

export const getDynamicPda = async (programId, seed, pub, uint) => {
  const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(seed),
      pub.toBytes(),
      new anchor.BN(uint).toArrayLike(Buffer, "le", 8),
    ],
    new PublicKey(programId)
  );

  return pda;
};

export const createTables = async (db) => {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS prompts(id integer primary key, listing_pda TEXT, title TEXT, prompt TEXT, instructions TEXT, ai_settings TEXT, signature TEXT, confirmed INTEGER, approved INTEGER, tries INTEGER, owner TEXT, description TEXT, ai_type TEXT, price TEXT, views INTEGER, saves INTEGER, thumbnail TEXT, scraped INTEGER, UNIQUE(signature))"
  );
  await db.exec(
    "CREATE TABLE IF NOT EXISTS s_prompts(id integer primary key, listing_pda TEXT, title TEXT, prompt TEXT, instructions TEXT, ai_settings TEXT, signature TEXT, confirmed INTEGER, approved INTEGER, tries INTEGER, owner TEXT, description TEXT, ai_type TEXT, price TEXT, views INTEGER, saves INTEGER, thumbnail TEXT, scraped INTEGER, UNIQUE(signature))"
  );

  await db.exec(
    "CREATE TABLE IF NOT EXISTS images(listing_pda TEXT, filename TEXT, cdn TEXT)"
  );
};

export const thumbnailLoop = async (db, connection) => {
  try {
    const result = await db.all(
      "SELECT listing_pda FROM prompts WHERE approved = 1 AND confirmed = 1 AND thumbnail IS NULL AND scraped IS NULL"
    );

    console.log(result.length);

    let secretKey = Uint8Array.from(JSON.parse(process.env.SHADOW_KEY));
    let keypair = Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();
    const acctPubkey = new PublicKey(process.env.SHADOW_STORAGE_ACCOUNT);

    for (let i = 0; i < result.length; i++) {
      try {
        rimraf.sync("./temp");
        fs.mkdirSync("./temp");
        const { listing_pda } = result[i];
        const { cdn } = await db.get(
          "SELECT cdn FROM images WHERE listing_pda = ? AND cdn IS NOT NULL",
          listing_pda
        );

        const options: any = {
          url: cdn,
          dest: path.join(__dirname, "./temp"),
        };

        const { filename } = await download.image(options);
        await new Promise((r) => setTimeout(r, 1000));

        const buffer = await sharp(filename)
          .resize({
            fit: sharp.fit.contain,
            width: 300,
          })
          .jpeg({ quality: 80 })
          .toBuffer();

        const fileToUpload: ShadowFile = {
          name: "dog.jpg",
          file: buffer,
        };

        const { finalized_locations } = await drive.uploadFile(
          acctPubkey,
          fileToUpload
        );

        await db.run(
          "UPDATE prompts SET thumbnail = ? WHERE listing_pda = ?",
          finalized_locations[0],
          listing_pda
        );

        console.log(i);
      } catch (error) {
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error.message);
  }

  await new Promise((r) => setTimeout(r, 1000 * 60 * 5));
  return imageCdnLoop(db, connection);
};

export const imageCdnLoop = async (db, connection) => {
  try {
    const result = await db.all(
      "SELECT filename FROM images WHERE cdn is NULL"
    );

    let secretKey = Uint8Array.from(JSON.parse(process.env.SHADOW_KEY));
    let keypair = Keypair.fromSecretKey(secretKey);
    const wallet = new anchor.Wallet(keypair);
    const drive = await new ShdwDrive(connection, wallet).init();

    const acctPubkey = new PublicKey(process.env.SHADOW_STORAGE_ACCOUNT);

    for (let i = 0; i < result.length; i++) {
      try {
        const fileBuff = fs.readFileSync(`./public/${result[i].filename}`);

        const fileToUpload: ShadowFile = {
          name: result[i].filename,
          file: fileBuff,
        };

        const uploadFile = await drive.uploadFile(acctPubkey, fileToUpload);

        await db.run(
          "UPDATE images SET cdn = ? WHERE filename = ?",
          uploadFile.finalized_locations[0],
          result[i].filename
        );
      } catch (error) {
        console.log(error.message);
      }
    }
  } catch (error) {
    console.log(error.message);
  }

  await new Promise((r) => setTimeout(r, 1000 * 60 * 5));
  return imageCdnLoop(db, connection);
};

export const approvedCacheLoop = async (db, memoryCache) => {
  try {
    const result = await db.all(
      "SELECT * FROM prompts WHERE approved = 1 AND confirmed = 1 AND scraped is NULL"
    );

    for (let i = 0; i < result.length; i++) {
      const images = await db.all(
        "SELECT filename, cdn FROM images WHERE listing_pda = ?",
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

    console.log(result.length);

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
  await new Promise((r) => setTimeout(r, 1000 * 60 * 10));
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

  await new Promise((r) => setTimeout(r, 1000 * 60 * 10));
  return confirmPromptsLoop(db, connection);
};
