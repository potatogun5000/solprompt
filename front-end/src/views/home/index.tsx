import { FC, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";
import b58 from "b58";

const Listing = (props): JSX.Element => {
  const { images, title, listingPda, aiSettings, price} = props as any;

  return (
    <Link
      className="p-1 hover:border-gray-700 border-transparent border-2 hover:border-current pb-2"
      href={`/detail?id=${listingPda}`} style={{width:'100%'}}>
      <div style={{width: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace:'nowrap', padding:5, fontSize:12, fontWeight: 'bold',  textAlign:'left', marginTop: 5}}>{unescape(title)}</div>

    <div style={{ width: "100%"}}>
      <div
        style={{
          width: "100%",
          height: "150px",
          position: "relative",
        }}
      >
        <Image
          alt="idc"
          src={`${process.env.NEXT_PUBLIC_API_SERVER}/static/${images[0].filename}`}
          layout="fill"
          objectFit="cover"
          style={{borderRadius:5}}
        />
      </div>
      <div className="pl-2 pr-2">
        <div style={{fontSize:12,  float:'left', marginTop: 5, fontWeight: 'normal', textTransform: 'uppercase'}}>Mid Journey</div>
        <div style={{fontSize:12, fontWeight: 'bold', float:'right', marginTop: 5}}>◎ {price}</div>
      </div>
    </div>
    </Link>
  );
};

export const HomeView: FC = ({}) => {
  const [data, setData] = useState([]);

  const getData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/listing/approved`);
    const json = await response.json();

    console.log(json);
    setData(json);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Prompt Marketplace of the Future
          </h1>
          <h1 className="text-right text-3xl md:pl-12 font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-teal-500">
              built on Solana
            </span>
          </h1>
        </div>
        <h4 className="md:w-full text-2x1 md:text-xl text-center text-slate-300 my-2 font-bold">
          <p>
            Buy Powerful Prompts
            <br />
            Earn SOL with creativity
          </p>
        </h4>
        <div className="flex flex-col mt-2">
          <div className="flex flex-row justify-center">
            <Link href={"./market"}>
              <button
                className="px-8 m-2 btn text-black bg-white"
                onClick={() => {}}
              >
                <span>Purchase a Prompt</span>
              </button>
            </Link>
            <Link href={"./sell"}>
              <button
                className="px-8 m-2 btn text-white bg-teal-700"
                onClick={() => {}}
              >
                <span>Sell a Prompt</span>
              </button>
            </Link>
          </div>
        </div>
        <div className="w-full text-left font-bold">
          <Text variant="paragraph">Featured Prompts</Text>
          <hr />
          <div className="flex flex-row justify-center pt-5">
            {data.slice(0, 5).map((item, index) => (
              <Listing images={item.images} title={item.title} listingPda={item.listing_pda} aiSettings={item.ai_settings} price={item.price}/>
            ))}
          </div>
        </div>
        <div className="w-full text-left font-bold">
          <Text variant="paragraph">Best Prompts</Text>
          <hr />
          <div className="flex flex-row justify-center pt-5">
            {data.slice(5, 10).map((item, index) => (
              <Listing images={item.images as any} title={item.title} aiSettings={item.ai_settings} listingPda={item.listing_pda} price={item.price}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
