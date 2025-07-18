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
  validateSolanaAddress,
  buyListingItx,
} from "../../web3/util";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { encode, decode } from "b58";


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
    console.log(pda);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/v2/listing/${pda}`
    );
    const json = await response.json();

    console.log(json);
    setImages(json.images);
    setListing(json);
  };

  const handleListing = async (program, provider, pda) => {
    const validated = await validateSolanaAddress(pda);
    let price = 0;
    console.log(validated);
    if (validated) {
      const item = await getListing(program, provider, pda);
      price = parseFloat(item.price);
    }
    setPrice(price);
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

  const downloadFree = async () => {
    const _aiSettings = JSON.parse(
        decode(listing.ai_settings).toString()
      );

    const fileText = JSON.stringify({
      title: unescape(listing.title),
      settings: _aiSettings,
      prompt: unescape(listing.prompt),
      instructions: unescape(listing.instructions)
    }, null, 4);

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileText));
    element.setAttribute('download', `${unescape(listing.title).split(' ').join('-')}-prompt.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

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
      <div
        className="flex flex-col sm:flex-row "
        style={{ maxWidth: 800, margin: "0 auto", marginTop: 50 }}
      >
        <div className="flex-1 xs:w-full sm:w-1/2 mt-10">
          <Carousel
            centerMode={true}
            centerSlidePercentage={100}
            showThumbs={true}
          >
            {images.map((image, index) => (
              <div key={`immm-${index}`}>
                <img
                  src={
                    image.cdn
                      ? image.cdn
                      : `${process.env.NEXT_PUBLIC_API_SERVER}/static/${image}`
                  }
                />
              </div>
            ))}
          </Carousel>
        </div>
        <div className="flex-1" style={{ padding: 40 }}>
          {listing && (
            <>
              <h1 className="text-center text-4xl font-bold text-white bg-clip-text mb-4">
                {unescape(listing.title)}
              </h1>
              <h1 className="text-center text-right text-xs text-white bg-clip-text mb-4">
                created by{" "}
                <Link
                  style={{ color: "#00adff" }}
                  target="_blank"
                  href={`https://solscan.io/account/${listing.owner}`}
                >
                  {listing.owner.slice(0, 5)}...{listing.owner.slice(-5)}
                </Link>
              </h1>

              <div className="p-4 m-10">{unescape(listing.description)}</div>
              <div className="m-5 flex flex-row justify-center">
                <ul className="p-5 text-right">
                  <li>Word Count:</li>
                  <li>Type:</li>
                  <li>Tested:</li>
                </ul>
                <ul className="text-left p-5">
                  <li>?</li>
                  <li>{listing.ai_type.replace("_", " ")}</li>
                  <li>yes</li>
                </ul>
              </div>

              <div className="flex flex-row justify-center pt-1">
                <div className="p-3 text-lg">
                  {price === 0 ? null : `${(price / LAMPORTS_PER_SOL).toFixed(2)} SOL`}
                </div>
            {
              price === 0
                ?
                <button
                  disabled={loading}
                  onClick={downloadFree}
                  className="btn px-10 text-lg"
                  style={{ backgroundColor: "#7075d3" }}
                >
                  Free Download
                </button>
                :
                <button
                  disabled={loading}
                  onClick={handleBuyListing}
                  className="btn px-10 text-lg"
                  style={{ backgroundColor: "#7075d3" }}
                >
                  Purchase
                </button>

                }
              </div>
              <h1 style={{ fontSize: 10, margin: 35 }}>
                {
                  price === 0
                    ?
                      <span></span>
                    :
                    <span>After purchasing, you will gain access to the prompt in the
                <Link href="/purchases">purchases</Link> tab. You must already
                      have access to Midjourney to use this prompt.</span>
                }
              </h1>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
