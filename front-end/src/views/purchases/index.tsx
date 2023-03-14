import { FC, useState, useCallback, useEffect, useRef} from "react";
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
  useProvider,
  useProgram,
  getBuyerAccount,
} from "../../web3/util";
import {encode, decode} from "b58";

const ListingView = (props): JSX.Element => {
  const { item, publicKey, index, select, setSelected} = props as any;

  return (
    <div className="flex flex-col" style={{ width: "100%", border: "1px solid white", padding: 10 }}>
      <h1 className="text-sm p-2 text-center mb-3">{unescape(props.title)}</h1>
      <div className="flex flex-row">
    {
      select === index
        ?
        <button className="opacity-50 cursor-not-allowed bg-transparent hover:bg-blue-500 text-grey-700 font-semibold hover:text-white py-2 px-4 border border-grey-500 hover:border-transparent rounded">
        select
      </button>
      :
      <button onClick={() => setSelected(index)} className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        select
      </button>
    }
      <Link className="ml-3 pt-3 underline text-blue-300 flex-1 text-right" href={`/detail?id=${props.listing_pda}`} target="_blank" style={{float:'right'}}>view</Link>
      </div>
    </div>
  );
};

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
    const signature = encode(
      await signMessage(new TextEncoder().encode('sign in solprompt'))
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/buyer/${publicKey}/${signature}`
    );
    const json = await response.json();
    setListings(json);
  };

  useEffect(() => {
    if(listings.length){
      const _aiSettings = JSON.parse(decode(listings[select].ai_settings).toString());
      delete _aiSettings.aiType;
      setAiSettings(_aiSettings);
    }
  },[listings, select])

  useEffect(() => {
    if (publicKey && !didLogRef.current) {
      didLogRef.current = true;
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

    {
      listings.length ?
        <div className="flex flex-row" style={{width:'100%', padding:50}}>
          <div className="flex-1" style={{width:'50%'}}>
            <h1 className="text-lg font-bold text-center">History</h1>
            <div style={{ padding: 25 }}>
              {listings.map((item, index) => (
                <ListingView {...item} index={index} select={select} setSelected={setSelected}/>
              ))}
            </div>
          </div>
          <div className="flex-1" style={{width:'50%', padding:0}}>
            <h1 className="text-lg font-bold text-center">
              { unescape(listings[select].title)}
            </h1>
            <h1 className="text-xs font-bold text-center uppercase">
              { listings[select].ai_type.replace('_', ' ')}
            </h1>
            <h1 className="text-md font-bold">Prompt</h1>
            <p className="text-sm font-weight-normal p-3 m-3 text-black bg-white">
              { unescape(listings[select].prompt)}
            </p>

            <h1 className="text-md font-bold">Instructions</h1>
            <p className="text-sm font-weight-normal p-3 m-3 text-black bg-white">
              { unescape(listings[select].instructions)}
            </p>
            {
              Object.keys(aiSettings).map( a => (
                <>
                  <h1 className="text-md font-bold">{a}</h1>
                  <p className="text-sm font-weight-normal p-3 m-3 text-black bg-white">
                  { aiSettings[a] }
                  </p>
                </>
              ))
            }
          </div>
        </div>
        :
        <div>
          {
            publicKey ? 'loading' : 'Connect your wallet'
          }
        </div>
      }
      </div>
    </div>
  );
};
