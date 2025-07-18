import express from "express";
const app = express();
import bodyParser from "body-parser";
import multer from "multer";
import FormData from "form-data";
import axios from "axios";
import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import {
  imageCdnLoop,
  createTables,
  approvePromptsLoop,
  confirmPromptsLoop,
  approvedCacheLoop,
  thumbnailLoop
} from "./db-helpers";
import {
  validateListing,
  uploadListing,
  doesExist,
  getListing,
  fetchPrompts,
  getListingV2,
  getOwnedListings,
  createTestTags,
  getAllListings,
  uploadScrapedListing,
  getPendingListings,
  requireAdmin,
  createTags,
  getTags,
  setLocals,
  errorHandler,
  getApprovedListings,
  fetchRandomPrompts,
} from "./middleware";
import { Connection } from "@solana/web3.js";
import cors from "cors";
import * as dotenv from "dotenv";
import rateLimit from 'express-rate-limit'
dotenv.config();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${req.body.listing_pda}-${uniqueSuffix}${path.extname(
        file.originalname
      )}`
    );
  },
});

const connection = new Connection(process.env.SOL_RPC);
const upload = multer({ storage: storage });
const publicFolder = "public";
const memoryCache = {};

if (!fs.existsSync(`./${publicFolder}`)) {
  fs.mkdirSync(`./${publicFolder}`);
}

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  await createTables(db);

  imageCdnLoop(db, connection);
  confirmPromptsLoop(db, connection);
  approvePromptsLoop(db, connection);
  approvedCacheLoop(db, memoryCache);
  thumbnailLoop(db, connection);

  app.use(cors());
  app.use("/static", express.static(publicFolder));
  app.use(bodyParser.json());
  app.use(setLocals(db, memoryCache, connection));

  app.get("/hello", (req, res, next) => res.send("worx"));
  app.get("/listing/all", requireAdmin, getAllListings);
  app.get("/listing/pending", requireAdmin, getPendingListings);
  app.get("/listing/:id/exist", requireAdmin, doesExist);
  app.get("/listing/approved", getApprovedListings);
  app.post(
    "/listing/scraped",
    requireAdmin,
    uploadScrapedListing
  );
  app.post(
    "/listing",
    upload.array("photos", 10),
    validateListing,
    uploadListing
  );

  app.get("/tags/test", createTestTags);
  app.post("/tags/:id", requireAdmin, createTags);
  app.get("/tags/:id", requireAdmin, getTags);
  app.get("/prompts/random", requireAdmin, fetchRandomPrompts);
  app.get("/prompts", fetchPrompts);


  app.get("/v2/listing/:id", getListingV2);

  app.get("/buyer/:address/:sig", getOwnedListings);

  app.use(errorHandler);

  const server = app.listen(8080, () => {
    console.log("Server listening on port 8080");
  });
})();
