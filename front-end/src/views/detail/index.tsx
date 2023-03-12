import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import {
  useProvider,
  useProgram,
  getSellerAccount,
  createSellerAccountItx,
  sendTx,
  createListingItx,
  getListingAccounts,
  getListing
} from "../../web3/util";

export const DetailView : FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { program } = useProgram();
  const { provider } = useProvider();

  const [listing, setListing] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const handleListing = async (program, provider, pda) => {
    const item = await getListing(program, provider, pda);
    console.log(item);
    setListing(item);
  }

  useEffect(() => {
    if (provider && program && !loaded) {
        const pda = window.location.search.split('id=')[1];
        handleListing(program, provider, pda);

        setLoaded(true);
    }
  }, [publicKey, provider, program, loaded]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="w-full hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Detail
          </h1>
        </div>
        <div className="mb-5">
          {
            listing &&
              <>
                <div>title</div>
                <div>price: {Number(listing.price)} SOL</div>
                <div>description</div>
                <div>pics</div>
                <div>ai: {listing.engine}</div>
                <div>seller: {listing.seller.toBase58()}</div>
                <div><button className="btn">buy</button></div>
              </>
          }
        </div>
      </div>
    </div>
  );
};
