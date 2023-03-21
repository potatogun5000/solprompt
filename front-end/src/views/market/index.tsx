import { FC, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";
import b58 from "b58";

const Listing = (props): JSX.Element => {
  const { views, saves, images, title, listingPda, aiSettings, price, aiType } = props as any;

  return (
    <Link
      target="_blank"
      className="p-1 hover:border-gray-700 border-transparent border-2 hover:border-current pb-5"
      href={`/detail?id=${listingPda}`}>
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
        <div style={{zIndex: 2, fontSize:10,  textTransform: 'uppercase', position: 'absolute', padding: 5, paddingBottom:2, bottom: 0, width: '100%', backgroundColor: '#000000a8', textAlign: 'center'}}>{aiType.replace('_', ' ')}</div>
      </div>
      <div className="pl-2 pr-2 mt-3">
        <div className="flex flex-row" style={{fontSize:12, fontWeight: 'bold', float:'left'}}>
          <Image alt="idc" src="/eye.svg" width={15} height={15} style={{filter:'invert(1)'}}/>
          <div style={{fontSize:12, fontWeight: 'bold', float:'right', paddingTop: 2, paddingLeft: 5}}>{views}</div>
        </div>
        <div style={{fontSize:12, fontWeight: 'bold', float:'right', paddingTop: 2}}>{price} SOL</div>
      </div>
    </div>
    </Link>
  );
};

export const MarketView: FC = ({}) => {
  const [data, setData] = useState([]);

  const getData = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER}/listing/approved`);
    const json = await response.json();
    json.sort((a,b)=>b.views-a.views);
    setData(json);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-4xl font-bold text-white bg-clip-text mb-4">
            Marketplace
          </h1>
        </div>
        <div className="w-full text-left font-bold">
          <div
            className="flex flex-row justify-center pt-5"
            style={{ flexWrap: "wrap" }}
          >
            {data.map((item, index) => (
              <Listing className="flex" aiType={item.ai_type} views={item.views} saves={item.saves} images={item.images} title={item.title} listingPda={item.listing_pda} aiSettings={item.ai_settings} price={item.price}/>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
