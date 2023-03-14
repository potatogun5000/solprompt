import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
  useProvider,
  useProgram,
  getSellerAccount,
  createSellerAccountItx,
  sendTx,
  createListingItx,
  getListingAccounts,
  getListing
} from "../../web3/util";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';


export const DetailView : FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { program } = useProgram();
  const { provider } = useProvider();

  const [listing, setListing] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [images, setImages] = useState([]);
  const [price, setPrice] = useState(0);

  const getApi = async (pda) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/listing/${pda}`)
    const json = await response.json();

    setImages(json.images);
    setListing(json);
    console.log(json);
  }

  const handleListing = async (program, provider, pda) => {
    const item = await getListing(program, provider, pda);
    console.log(item);
    setPrice(Number(item.price));
  }

  useEffect(() => {
    if (provider && program && !loaded) {
        const pda = window.location.search.split('id=')[1];
        handleListing(program, provider, pda);
        getApi(pda);

        setLoaded(true);
    }
  }, [publicKey, provider, program, loaded]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="w-full hero-content flex flex-col max-w-lg">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            { listing && unescape(listing.title)}
          </h1>
        </div>
          <Carousel centerMode={true}  centerSlidePercentage={50} showThumbs={false}>
          {
            images.map( (image , index)=> (
            <div key={`immm-${index}`}>
                <img alt="idc" src={`${process.env.NEXT_PUBLIC_API_SERVER}/static/${image}`} />
            </div>
            ))
          }
        </Carousel>
          <div className="mb-5">
          {
            listing &&
              <div className="flex flex-row">
                <div>
                  <div>{(price/LAMPORTS_PER_SOL).toFixed(2)} SOL</div>
                  <div>{listing && listing.description}</div>
                  <div>Mid Journey</div>
                </div>
                <div><button className="btn">purchase</button></div>
              </div>
          }
        </div>
      </div>
    </div>
  );
};
