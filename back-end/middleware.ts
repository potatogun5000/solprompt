import b58 from "b58";
import * as yup from "yup";
import { PublicKey } from "@solana/web3.js";
import { getPda, getDynamicPda } from "./db-helpers";
import * as anchor from "@project-serum/anchor";
import nacl from "tweetnacl";

export const setLocals =
  (db, memoryCache, connection) => async (req, res, next) => {
    res.locals.db = db;
    res.locals.memoryCache = memoryCache;
    res.locals.connection = connection;
    next();
  };

export const validateListing = async (req, res, next) => {
  //TODO: do better

  try {
    let schema = yup.object().shape({
      signature: yup.string().required(),
      listing_pda: yup.string().required(),
      title: yup.string().required(),
      prompt: yup.string().required(),
      instructions: yup.string().required(),
      ai_settings: yup.string().required(),
      owner: yup.string().required(),
      description: yup.string().required(),
      ai_type: yup.string().required(),
      price: yup.string().required(),
    });

    const valid = await schema.isValid(req.body);

    if (!valid) throw new Error("bad input");

    res.locals.cleaned = {};

    res.locals.cleaned.signature = escape(req.body.signature);
    res.locals.cleaned.listing_pda = escape(req.body.listing_pda);
    res.locals.cleaned.title = escape(req.body.title);
    res.locals.cleaned.prompt = escape(req.body.prompt);
    res.locals.cleaned.instructions = escape(req.body.instructions);
    res.locals.cleaned.owner = escape(req.body.owner);
    res.locals.cleaned.ai_settings = b58.encode(
      Buffer.from(req.body.ai_settings)
    );
    res.locals.cleaned.description = escape(req.body.description);
    res.locals.cleaned.ai_type = escape(req.body.ai_type);
    res.locals.cleaned.price = escape(req.body.price);

    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  if (req.query.pw === process.env.ADMIN_PW) return next();

  next("wrong pw");
};

export const getPendingListings = async (req, res, next) => {
  const result = await res.locals.db.all(
    "SELECT * FROM prompts WHERE approved = 0 AND confirmed = 1"
  );

  for (let i = 0; i < result.length; i++) {
    const images = await res.locals.db.all(
      "SELECT filename FROM images WHERE listing_pda = ?",
      result[i].listing_pda
    );

    result[i].images = images;
  }

  res.send(result);
};

export const getApprovedListings = async (req, res, next) => {
  res.send(res.locals.memoryCache.approved);
};

export const getAllListings = async (req, res, next) => {
  const result = await res.locals.db.all("SELECT * FROM prompts");
  res.send(result);
};

export const getOwnedListings = async (req, res, next) => {
  try {
    const signatureUint8 = b58.decode(req.params.sig);
    const message = new TextEncoder().encode("sign in solprompt");
    const pubKeyUint8 = b58.decode(req.params.address);
    const verified = nacl.sign.detached.verify(
      message,
      signatureUint8,
      pubKeyUint8
    );

    if (!verified) throw new Error("not verified");

    console.log("verified", verified);

    const buyer = new PublicKey(req.params.address);

    const buyerPda = await getPda(process.env.CONTRACT_ID, "buyer", [buyer]);
    const buyerAcc = await res.locals.connection.getAccountInfo(buyerPda);

    const acc = new Uint8Array(buyerAcc.data);
    const u64 = acc.slice(8 + 32, 8 + 32 + 8);
    const buffer = Buffer.from(u64);
    const buyerPurchases = Number(buffer.readBigUInt64LE(0));

    const receiptPromise = [];
    for (let i = 0; i < buyerPurchases; i++) {
      const receiptPda = await getDynamicPda(
        process.env.CONTRACT_ID,
        "receipt",
        buyer,
        i
      );
      receiptPromise.push(res.locals.connection.getAccountInfo(receiptPda));
    }

    const receiptDatas = await Promise.all(receiptPromise);

    const pdas = receiptDatas.map(({ data }) => {
      const receiptData = new Uint8Array(data);
      const pubkey = receiptData.slice(8, 32 + 8);
      return b58.encode(pubkey);
    });

    const queryStr = pdas.map((p) => `"${p}"`).join(" OR listing_pda = ");

    const allOwnedListings = await res.locals.db.all(
      `SELECT * FROM prompts WHERE listing_pda = ${queryStr}`
    );

    res.send(allOwnedListings);
  } catch (error) {
    res.send([]);
  }
};

export const doesExist = async (req, res, next) => {
  try {
    const result = await res.locals.db.get(
      "SELECT listing_pda FROM prompts WHERE listing_pda = ?",
      req.params.id
    );

    if (result) {
      return res.send({
        exist: true,
      });
    }
  } catch (error) {}

  res.send({
    exist: false,
  });
};

export const uploadScrapedListing = async (req, res, next) => {
  try {
    const { cdns, uuid, title, prompt, instructions, ai_settings, ai_type } =
      req.body;

    for (let i = 0; i < 4; i++) {
      await res.locals.db.exec(
        `INSERT INTO images VALUES ("${uuid}", null, "${cdns[i]}")`
      );
    }

    const aiSettings = b58.encode(Buffer.from(ai_settings));

    await res.locals.db.exec(
      `INSERT INTO prompts VALUES (NULL, "${uuid}", "${escape(
        title
      )}", "${escape(prompt)}", "${escape(
        instructions
      )}", "${aiSettings}", "${uuid}", 1, 1, 0, "SOL_PROMPT", "FREE", "${ai_type}", "0", 0, 0, NULL, 1)`
    );

    res.send("done");
  } catch (error) {
    next(error);
  }
};

export const uploadListing = async (req, res, next) => {
  try {
    for (let i = 0; i < req.files.length; i++) {
      await res.locals.db.exec(
        `INSERT INTO images VALUES ("${
          res.locals.cleaned.listing_pda
        }", "${escape(req.files[i].filename)}", NULL)`
      );
    }
    await res.locals.db.exec(
      `INSERT INTO prompts VALUES (NULL, "${res.locals.cleaned.listing_pda}", "${res.locals.cleaned.title}", "${res.locals.cleaned.prompt}", "${res.locals.cleaned.instructions}", "${res.locals.cleaned.ai_settings}", "${res.locals.cleaned.signature}", 0, 0, 0, "${res.locals.cleaned.owner}", "${res.locals.cleaned.description}", "${res.locals.cleaned.ai_type}", "${res.locals.cleaned.price}", 0, 0, NULL, NULL)`
    );

    res.redirect("https://solprompt.io/pending");
  } catch (error) {
    next(error);
  }
};

export const getListingV2 = async (req, res, next) => {
  try {
    const listingInfo = await res.locals.db.get(
      "SELECT * FROM prompts WHERE listing_pda = ? AND approved = 1",
      req.params.id
    );
    const images = await res.locals.db.all(
      `SELECT filename, cdn FROM images WHERE listing_pda = "${req.params.id}"`
    );

    delete listingInfo.instructions;
    delete listingInfo.prompt;
    delete listingInfo.ai_settings;

    res.send({
      ...listingInfo,
      images,
    });

    await res.locals.db.run(
      "UPDATE prompts SET views = ? WHERE id = ?",
      listingInfo.views + 1,
      listingInfo.id
    );
  } catch (error) {
    res.send("does not exist");
  }
};

export const fetchPrompts = async (req, res, next) => {
  try {
    let offset = 0;
    if (req.query.offset) offset = parseInt(req.query.offset);

    let sort = "views";
    if (req.query.sort === "newest") {
      sort = "id";
    }

    const rows = await res.locals.db.all(
      "SELECT title, listing_pda, price, ai_type, views, saves, description, owner, thumbnail FROM prompts ORDER BY ? LIMIT ? OFFSET ?",
      sort,
      25,
      offset
    );

    const count = await res.locals.db.get(
      "SELECT COUNT(*) FROM prompts ORDER BY ?",
      sort,
    );

    res.send({
      rows,
      count: count['COUNT(*)']
    });
  } catch (error) {
    next(error);
  }
};

export const fetchRandomPrompts = async (req, res, next) => {
  try {
    const rows = await res.locals.db.all(
      "SELECT title, listing_pda, price, ai_type, views, saves, description, owner FROM prompts WHERE tries = 0 ORDER BY RANDOM() LIMIT 10"
    );

    res.send(rows);
  } catch (error) {
    console.log(error);
    next(error);
  }
};


/*
export const getAllListings = async (req, res, next) => {
  try {
    const listingInfo = await res.locals.db.get(
      "SELECT * FROM prompts WHERE listing_pda = ? AND approved = 1",
      req.params.id
    );
    const allImages = await res.locals.db.all(
      `SELECT filename, cdn FROM images WHERE listing_pda = "${req.params.id}"`
    );

    delete listingInfo.instructions;
    delete listingInfo.prompt;
    delete listingInfo.ai_settings;

    res.send({
      ...listingInfo,
      images: allImages.map((f) => f.filename),
      imageCdns: allImages.map((f) => f.cdn),
    });
  } catch (error) {
    res.send("does not exist");
  }
};
*/

export const getListing = async (req, res, next) => {
  try {
    const listingInfo = await res.locals.db.get(
      "SELECT * FROM prompts WHERE listing_pda = ? AND approved = 1",
      req.params.id
    );
    const allImages = await res.locals.db.all(
      `SELECT filename, cdn FROM images WHERE listing_pda = "${req.params.id}"`
    );

    delete listingInfo.instructions;
    delete listingInfo.prompt;
    delete listingInfo.ai_settings;

    res.send({
      ...listingInfo,
      images: allImages.map((f) => f.filename),
      imageCdns: allImages.map((f) => f.cdn),
    });
  } catch (error) {
    res.send("does not exist");
  }
};

export const errorHandler = async (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("error");
};
