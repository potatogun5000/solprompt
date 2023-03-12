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
import { createTables, approveSigsLoop } from "./db-helpers";
import {
  validateListing,
  uploadListing,
  getListing,
  getAllListings,
  setLocals,
  errorHandler,
} from "./middleware";
import { Connection } from "@solana/web3.js";

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

const connection = new Connection("https://api.devnet.solana.com");
const upload = multer({ storage: storage });
const publicFolder = "public";

if (!fs.existsSync(`./${publicFolder}`)) {
  fs.mkdirSync(`./${publicFolder}`);
}

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  await createTables(db);

  approveSigsLoop(db, connection);

  app.use("/static", express.static(publicFolder));
  app.use(bodyParser.json());
  app.use(setLocals(db));
  app.use(errorHandler);

  app.get("/listings/all", getAllListings);
  app.get("/hello", (req, res, next) => res.send("henlo"));
  app.post(
    "/upload",
    upload.array("photos", 10),
    validateListing,
    uploadListing
  );
  app.get("/listing/:id", getListing);

  const server = app.listen(8080, () => {
    console.log("Server listening on port 8080");
  });
})();
