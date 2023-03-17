import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
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
  getListing,
  buyListingItx,
} from "../../web3/util";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

export const DetailView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { program } = useProgram();
  const { provider } = useProvider();

  const [listing, setListing] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const getApi = async (pda) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/listing/${pda}`
    );
    const json = await response.json();

    setImages(json.images);
    console.log(json)
    setListing(json);
    console.log(json);
  };

  const handleListing = async (program, provider, pda) => {
    const item = await getListing(program, provider, pda);
    console.log(item);
    setPrice(Number(item.price));
  };

  const handleBuyListing = async () => {
    setLoading(true);
    try {
      if (!publicKey) {
        return notify({ type: "error", message: "Select wallet first" });
      }

      const listingPda = new PublicKey(window.location.search.split("id=")[1]);
      const buyItx = await buyListingItx(
        program,
        provider,
        listingPda,
        publicKey
      );

      const sig = await sendTx(program, provider, wallet, buyItx);
      await provider.connection.confirmTransaction(sig);

      notify({ type: "success", message: "Purchase successful!", txid: sig });
    } catch (error) {
      notify({ type: "error", message: `Error`, description: error?.message });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (provider && program && !loaded) {
      const pda = window.location.search.split("id=")[1];
      handleListing(program, provider, pda);
      getApi(pda);

      setLoaded(true);
    }
  }, [publicKey, provider, program, loaded]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="flex flex-col sm:flex-row " style={{maxWidth: 800, margin: '0 auto', marginTop: 50}}>
          <div className="flex-1 xs:w-full sm:w-1/2 mt-10">
            <Carousel
              centerMode={true}
              centerSlidePercentage={100}
              showThumbs={true}
            >
              {images.map((image, index) => (
                <div key={`immm-${index}`}>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_SERVER}/static/${image}`}
                  />
                </div>
              ))}
            </Carousel>
          </div>
          <div className="flex-1" style={{padding:40}}>
            {listing && (
              <>
                <h1 className="text-center text-4xl font-bold text-white bg-clip-text mb-4">
                  {unescape(listing.title)}
                </h1>
                <h1 className="text-center text-right text-xs text-white bg-clip-text mb-4">
                  created by <Link style={{color:'#00adff'}} target="_blank" href={`https://solscan.io/account/${listing.owner}`}>{listing.owner.slice(0,5)}...{listing.owner.slice(-5)}</Link>
                </h1>

                <div className="p-4 m-10">
                  {unescape(listing.description)}
                </div>
                <div className="m-5 flex flex-row justify-center">
                  <ul className="p-5 text-right">
                    <li>Word Count:</li>
                    <li>Type:</li>
                    <li>Tested:</li>
                  </ul>
                  <ul className="text-left p-5">
                    <li>?</li>
                    <li>{listing.ai_type.replace('_',' ')}</li>
                    <li>yes</li>
                  </ul>
                </div>

                <div className="flex flex-row justify-center pt-1">
                  <div className="p-3 text-lg">
                    {(price / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </div>
                  <button
                    disabled={loading}
                    onClick={handleBuyListing}
                    className="btn px-10 text-lg"
                    style={{backgroundColor: '#7075d3'}}
                  >
                    {loading ? "loading" : "purchase"}
                  </button>
                </div>
                <h1  style={{fontSize:10, margin:35}}>After purchasing, you will gain access to the prompt in the <Link href="/purchases">purchases</Link> tab.
                You must already have access to Midjourney to use this prompt.</h1>
              </>
            )}
          </div>
        </div>
      </div>
  );
};
