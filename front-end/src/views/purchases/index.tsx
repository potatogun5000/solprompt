import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  Keypair,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import {
  getListingFromReceipt,
  useProvider,
  useProgram,
  getBuyerAccount,
} from "../../web3/util";

const ReceiptView = (props): JSX.Element => {
  const { item, publicKey, index } = props as any;

  const [loading, setLoading] = useState(true);

  return (
    <div style={{ width: "100%", border: "1px solid white", padding: 10 }}>
      {loading && "loading"}
      {!loading && "dog"}
    </div>
  );
};
export const PurchasesView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;

  const { program } = useProgram();
  const { provider } = useProvider();

  const [listings, setListings] = useState([]);

  const getOwnedListings = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/buyer/${publicKey}`
    );
    const json = await response.json();

    setListings(json);
  };

  useEffect(() => {
    if (publicKey) {
      getOwnedListings();
    }
  }, [wallet]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="w-full hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Purchases
          </h1>
        </div>

        <div className="flex flex-row">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-center">Purchases</h1>
            <div style={{ padding: 25 }}>
              {listings.map((item, index) => (
                <ListingView item={item} index={index} />
              ))}
            </div>
          </div>
          <div className="flex-1" style={{ padding: 25 }}>
            <h1 className="text-lg font-bold text-center">
              The dog catches the cat
            </h1>
            <h1 className="text-sm font-bold text-center">Mid Journey</h1>
            <h1 className="text-md font-bold">Prompt</h1>
            <p className="text-sm font-weight-normal p-3">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </p>

            <h1 className="text-md font-bold">Instructions</h1>
            <p className="text-sm p-3 ">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </p>

            <h1 className="text-md font-bold">Negative Prompt</h1>
            <p className="text-sm p-3">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book. It has
              survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged. It was
              popularised in the 1960s with the release of Letraset sheets
              containing Lorem Ipsum passages, and more recently with desktop
              publishing software like Aldus PageMaker including versions of
              Lorem Ipsum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
