import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SignaturesForAddressOptions } from "@solana/web3.js";
import idl from "./prompt3.json";

const { Wallet, web3 } = anchor;
const CONTRACT_ID = "CKi9rre9A3oL99JB7BbU3rpBJXNRDWF2Qm2iMpYYTxAn";
const SYSVAR_RENT_PUBKEY = web3.SYSVAR_RENT_PUBKEY;
const PROGRAM_ID = web3.SystemProgram.programId;

export const useProgram = () => {
  const { provider } = useProvider();
  const programId = new anchor.web3.PublicKey(CONTRACT_ID);
  const program = new anchor.Program(idl as any, programId, provider);

  return { program };
};

export const useProvider = (): { provider: anchor.AnchorProvider } => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  return { provider };
};

export const getPda = async (program, seed, inputs) => {
  const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(seed),
      ...inputs.map((input) => input.toBytes()),
    ],
    program.programId
  );

  return pda;
};

export const getDynamicPda = async (program, seed, pub, uint) => {
  const [pda, bump] = await anchor.web3.PublicKey.findProgramAddress(
    [
      anchor.utils.bytes.utf8.encode(seed),
      pub.toBytes(),
      new anchor.BN(uint).toArrayLike(Buffer, "le", 8),
    ],
    program.programId
  );

  return pda;
};

export const sleep = async (n) =>
  await new Promise((resolve) => setTimeout(resolve, n));

export const getSellerAccount = async (program, provider, publicKey) => {
  const sellerPda = await getPda(program, "seller", [publicKey]);

  try {
    const sellerAccount = await program.account.seller.fetch(sellerPda);
    return sellerAccount;
  } catch (error) {
    return null;
  }
};

export const approveListing = async (program, provider, listing, publicKey) => {
  const listingPda = new PublicKey(listing);
  const listingData = await program.account.listing.fetch(listingPda);
  const seller = listingData.seller;
  const sellerPda = await getPda(program, "seller", [seller]);
  const statePda = await getPda(program, "state", []);

  console.log(listingData);
  const listingPda2 = await getDynamicPda(
    program,
    "listing",
    publicKey,
    Number(listingData.id)-1
  );


  const accounts = {
    admin: publicKey,
    seller: sellerPda,
    sellerAccount: seller,
    listing: listingPda,
    state: statePda,
    systemProgram: PROGRAM_ID,
  };

  const itx = await program.instruction.approveListing(
    new anchor.BN(Number(listingData.id) - 1),
    {
      accounts,
    }
  );

  return itx;
};

export const createSellerAccountItx = async (program, provider, publicKey) => {
  try {
    const sellerPda = await getPda(program, "seller", [publicKey]);
    const statePda = await getPda(program, "state", []);

    const accounts = {
      signer: publicKey,
      seller: sellerPda,
      state: statePda,
      systemProgram: PROGRAM_ID,
    };

    const itx = await program.instruction.initSeller({
      accounts,
    });
    console.log("wtf", itx);

    return itx;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getListing = async (program, provider, pda) => {
  const listing = await program.account.listing.fetch(pda);

  return listing;
};

export const getListingAccounts = async (program, provider, publicKey) => {
  try {
    const sellerPda = await getPda(program, "seller", [publicKey]);
    const sellerAccount = await program.account.seller.fetch(sellerPda);

    const listedAmount = Number(sellerAccount.listings);

    const listings = [];

    for (let i = 0; i < listedAmount; i++) {
      const listingPda = await getDynamicPda(program, "listing", publicKey, i);
      const listData = await program.account.listing.fetch(listingPda);
      listData.pda = listingPda;
      listings.push(listData);
    }

    return listings;
  } catch (error) {
    return [];
  }
};

export const createListingItx = async (
  program,
  provider,
  sellerAccount,
  publicKey
) => {
  try {
    let listingsAmount = 0;
    if (sellerAccount) {
      listingsAmount = Number(sellerAccount.listings);
    }

    const sellerPda = await getPda(program, "seller", [publicKey]);
    const statePda = await getPda(program, "state", []);
    const listingPda = await getDynamicPda(
      program,
      "listing",
      publicKey,
      listingsAmount
    );

    const accounts = {
      signer: publicKey,
      seller: sellerPda,
      listing: listingPda,
      state: statePda,
      systemProgram: PROGRAM_ID,
    };

    const listingItx = await program.instruction.createListing(
      "dog",
      publicKey,
      new anchor.BN(10000),
      {
        accounts,
      }
    );

    return { listingItx, listingPda };
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const sendTx = async (program, provider, wallet, tx) => {
  const blockHash = await provider.connection.getRecentBlockhash();
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = await blockHash.blockhash;
  const signed = await wallet.signTransaction(tx);
  const signature = await provider.connection.sendRawTransaction(
    signed.serialize()
  );

  return signature;
};
