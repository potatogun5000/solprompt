import { FC, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";

const Listing: FC = ({ images, title, listingPda}) => {
  return (
    <Link href={`/detail?id=${listingPda}`} style={{width:'100%', margin: 5}}>
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
          src={`https://api.solprompt.io/static/${images[0].filename}`}
          layout="fill"
          objectFit="cover"
          style={{borderRadius:5}}
        />
        <div style={{color: 'white', fontSize: 14, padding: 5, letterSpacing: 0.7, fontWeight:'normal', zIndex:10, position:'absolute', bottom: 0, width:'100%', textAlign: 'center', backgroundColor: '#00000094'}}>1.392 SOL</div>
      </div>
      <div style={{fontSize:13, textDecoration: 'underline', fontWeight: 'bold', letterSpacing: 1,  textAlign:'center', marginTop: 5}}>{unescape(title)}</div>
    </div>
    </Link>
  );
};

export const HomeView: FC = ({}) => {
  const [data, setData] = useState([]);

  const getData = async () => {
    const response = await fetch("https://api.solprompt.io/listing/approved");
    const json = await response.json();

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
            {data.slice(0, 6).map((item, index) => (
              <Listing images={item.images} title={item.title} listingPda={item.listing_pda}/>
            ))}
          </div>
        </div>
        <div className="w-full text-left font-bold">
          <Text variant="paragraph">Best Prompts</Text>
          <hr />
          <div className="flex flex-row justify-center pt-5">
            {data.slice(6, 12).map((item, index) => (
              <Listing images={item.images} title={item.title} listingPda={item.listing_pda}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
