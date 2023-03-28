import { FC, useState, useCallback, useEffect, useRef } from "react";
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
import { useProvider, useProgram, getBuyerAccount } from "../../web3/util";
import { encode, decode } from "b58";

export const PurchasesView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, signMessage } = wallet;

  const { program } = useProgram();
  const { provider } = useProvider();

  const [listings, setListings] = useState([]);
  const [select, setSelected] = useState(0);
  const [aiSettings, setAiSettings] = useState({});
  const didLogRef = useRef(false);

  const getOwnedListings = async () => {
    try {
      //not really secure but good for now

      let signedMsg;
      try {
        signedMsg = localStorage.getItem(`${publicKey.toBase58()}-signed`);
        console.log("wtf", signedMsg);
        if (!signedMsg) throw new Error("couldnt get or doesnt have");
      } catch (error) {
        console.log(error);
        signedMsg = encode(
          await signMessage(new TextEncoder().encode("sign in solprompt"))
        );

        try {
          localStorage.setItem(`${publicKey.toBase58()}-signed`, signedMsg);
        } catch (error) {
          console.log(error.message);
          console.log("couldnt save signedMsg to local storage");
        }
      }

      console.log(
        `${process.env.NEXT_PUBLIC_API_SERVER}/buyer/${publicKey}/${signedMsg}`
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER}/buyer/${publicKey}/${signedMsg}`
      );
      const json = await response.json();
      setListings(json);
    } catch (err) {
      notify({ type: "error", message: err.message });
    }
  };

  useEffect(() => {
    if (listings.length) {
      const _aiSettings = JSON.parse(
        decode(listings[select].ai_settings).toString()
      );
      delete _aiSettings.aiType;
      setAiSettings(_aiSettings);
    }
  }, [listings, select]);

  useEffect(() => {
    if (publicKey && !didLogRef.current) {
      didLogRef.current = true;
      getOwnedListings();
    }
  }, [wallet]);

  const downloadPrompt = async (item) => {
    const _aiSettings = JSON.parse(
        decode(listings[select].ai_settings).toString()
      );

    const fileText = JSON.stringify({
      title: unescape(item.title),
      settings: _aiSettings,
      prompt: unescape(item.prompt),
      instructions: unescape(item.instructions)
    }, null, 4);

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileText));
    element.setAttribute('download', `${unescape(item.title).split(' ').join('-')}-prompt.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <div className="md:hero mx-auto p-4">
      <div className="w-full hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Purchase History
          </h1>
        </div>
        <div className="flex flex-col" style={{ width: "100%", padding: 50, paddingTop: 20 }}>
          <div className="flex flex-row mb-5">
            <h1 style={{width:150}}></h1>
            <h1 className="flex-1">Title</h1>
            <h1 className="flex-1">Seller</h1>
            <h1 className="flex-1">Price</h1>
            <h1 className="flex-1 text-right">Options</h1>
          </div>
          <hr />
          {listings.length ?
            listings.map((item, index) => (
              <div key={`ite2-${index}`} className="flex flex-row mt-5" style={{ height: 100}} >
                  <Image src={item.thumbnail} alt="idc" width={100} height={30} style={{marginRight:50}} />
                <h1 className="flex-1">{unescape(item.title)}</h1>
                <h2 className="flex-1">
                  <Link style={{color:'#00adff', textDecoration: 'underline'}} target="_blank" href={`https://solscan.io/account/${item.owner}`}>{item.owner.slice(0,5)}...{item.owner.slice(-5)}</Link>
                </h2>
                <h2 className="flex-1">{item.price} SOL</h2>
                <h2 className="flex-1 flex flex-col text-right">
                  <h3 style={{textDecoration:'underline', color:'#00adff', cursor: 'pointer'}} onClick={()=>downloadPrompt(item)}>Download Prompt</h3>
                </h2>
              </div>
            ))
            :
              <div></div>
          }
        </div>
      </div>
    </div>
  );
};
