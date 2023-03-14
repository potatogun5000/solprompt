import * as anchor from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import idl from "./prompt3.json";

const { Wallet, web3, BN } = anchor;
const { PublicKey, Transaction } = web3;
const CONTRACT_ID = "F6X97TzFoSyRAsMCVEjRncxAqNNmDqGoaq5ESFKvCzWZ";
const SYSVAR_RENT_PUBKEY = web3.SYSVAR_RENT_PUBKEY;
const PROGRAM_ID = web3.SystemProgram.programId;
const LAMPORTS_PER_SOL = web3.LAMPORTS_PER_SOL;

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

export const getBuyerAccount = async (program, provider, publicKey) => {
  const buyerPda = await getPda(program, "buyer", [publicKey]);

  try {
    const buyerAccount = await program.account.buyer.fetch(buyerPda);
    return buyerAccount;
  } catch (error) {
    return null;
  }
};

export const getSellerAccount = async (program, provider, publicKey) => {
  const sellerPda = await getPda(program, "seller", [publicKey]);

  try {
    const sellerAccount = await program.account.seller.fetch(sellerPda);
    return sellerAccount;
  } catch (error) {
    return null;
  }
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

export const withdrawSellerItx = async (program, provider, signer) => {
  const seller = await getPda(program, "seller", [signer]);
  const accounts = {
    signer,
    seller,
    systemProgram: PROGRAM_ID,
  };
  const tx = new Transaction();
  const itx = await program.instruction.withdrawBalance({
    accounts,
  });
  tx.add(itx);
  return tx;
};

export const buyListingItx = async (program, provider, listing, signer) => {
  try {
    const buyer = await getPda(program, "buyer", [signer]);
    const state = await getPda(program, "state", []);
    const listingData = await program.account.listing.fetch(listing);
    const sellerAccount = listingData.seller;
    const seller = await getPda(program, "seller", [sellerAccount]);

    let buyerData;
    let receiptId = 0;
    let tx = new Transaction();
    try {
      buyerData = await program.account.buyer.fetch(buyer);
      receiptId = buyerData.purchases;
    } catch (error) {}

    if (!buyerData) {
      const accounts1 = {
        signer,
        buyer,
        state,
        systemProgram: PROGRAM_ID,
      };

      const itx1 = await program.instruction.initBuyer({
        accounts: accounts1,
      });

      tx.add(itx1);
    }

    const receipt = await getDynamicPda(program, "receipt", signer, receiptId);

    const accounts2 = {
      signer,
      sellerAccount,
      seller,
      listing,
      buyer,
      receipt,
      state,
      systemProgram: PROGRAM_ID,
    };

    const itx2 = await program.instruction.purchaseListing(
      new BN(Number(listingData.id) - 1),
      {
        accounts: accounts2,
      }
    );

    tx.add(itx2);

    return tx;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getListing = async (program, provider, pda) => {
  const listing = await program.account.listing.fetch(pda);

  return listing;
};

export const getListingPda = async (program, provider, publicKey, id) => {
  const sellerPda = await getPda(program, "seller", [publicKey]);
  const listingPda = await getDynamicPda(program, "listing", publicKey, id);
  return listingPda.toBase58();
};

export const getListingAccount = async (program, provider, publicKey, id) => {
  const sellerPda = await getPda(program, "seller", [publicKey]);
  const listingPda = await getDynamicPda(program, "listing", publicKey, id);
  const listData = await program.account.listing.fetch(listingPda);
  return listData;
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
  publicKey,
  aiType,
  price
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
      aiType,
      publicKey,
      new anchor.BN(price * LAMPORTS_PER_SOL),
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
