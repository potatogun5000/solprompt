import { FC, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";
import b58 from "b58";

const Listing = (props): JSX.Element => {
  const { images, title, listingPda, aiSettings, price } = props as any;

  return (
    <Link
      className="p-5 hover:border-gray-700 border-transparent border-2 hover:border-current pb-2"
      href={`/detail?id=${listingPda}`}
      style={{ width: "100%" }}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            width: "100%",
            height: "260px",
            position: "relative",
          }}
        >
          <Image
            alt="idc"
            src={`${process.env.NEXT_PUBLIC_API_SERVER}/static/${images[0].filename}`}
            layout="fill"
            objectFit="cover"
            style={{ borderRadius: 5 }}
          />
        </div>
        <div className="pl-2 pr-2">
      <div
        style={{
          width: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: 12,
          fontWeight: "bold",
          textAlign: "left",
          marginTop: 15,
        }}
      >
        {unescape(title)}
      </div>

          <div
            style={{
              fontSize: 12,
              float: "left",
              marginTop: 5,
              fontWeight: "normal",
            }}
          >
            Mid Journey
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: "bold",
              float: "right",
              marginTop: 5,
            }}
          >
            ◎ {price}
          </div>
        </div>
      </div>
    </Link>
  );
};

export const HomeView: FC = ({}) => {
  const [data, setData] = useState([]);

  const getData = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/listing/approved`
    );
    const json = await response.json();

    console.log(json);
    setData(json);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div style={{backgroundColor:'#121418'}}>
      <div
        className="mx-auto"
        style={{
          backgroundColor: "rgb(14 14 14)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            position: "relative",
            width: "100%",
            height: "600px",
            textAlign: "center",
          }}
        >
          <Image
            className="tint"
            src="https://media.discordapp.net/attachments/1083449288660635760/1085900244883099668/polus_cyberpunkbillboard_c13799d8-eaa0-4967-865f-9e2b0736280c.png?width=1224&height=699"
            objectFit="cover"
            fill={true}
            alt="idc"
          />

          <div
            style={{
              position: "absolute",
              top: "45%",
              left: "35%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <h1 className="cursive_font text-left text-lg ml-1 text-white bg-clip-text text-left font-light">
              The #1 prompt marketplace
            </h1>
            <h1 className="title_font text-left text-5xl font-bold text-white bg-clip-text mb-1 text-left">
              Marketplace of the Future
            </h1>
            <h1 className="cursive_font text-left text-lg ml-1 text-white bg-clip-text mb-4 text-left font-light">
              Built on Solana
            </h1>
            <p className="cursive_font text-left pt-10 text-2xl text-white bg-clip-text mb-4 text-left font-light">
              We support DALL·E, GPT, Midjourney, Stable Diffusion, ChatGPT
            </p>
            <div className="flex flex-col mt-2">
              <div className="flex flex-row justify-center">
                <Link href={"./market"}>
                  <button
                    className="px-8 m-2 btn text-black bg-white border-none"
                    onClick={() => {}}
                  >
                    <span>Purchase a Prompt</span>
                  </button>
                </Link>
                <Link href={"./sell"}>
                  <button
                    className="px-8 m-2 btn text-white bg-teal-700 border-none"
                    onClick={() => {}}
                  >
                    <span>Sell a Prompt</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:hero-content flex flex-col" style={{margin: '0 auto', marginTop: 30}}>
        <div className="w-full text-left font-bold">
          <h1 style={{textAlign: 'center',letterSpacing: 1}}>Featured Listings</h1>
          <div className="flex flex-row justify-center pt-5">
            {data.slice(0, 5).map((item, index) => (
              <Listing
                images={item.images}
                title={item.title}
                listingPda={item.listing_pda}
                aiSettings={item.ai_settings}
                price={item.price}
              />
            ))}
          </div>
          <div className="flex flex-row justify-center pt-5">
            {data.slice(5, 10).map((item, index) => (
              <Listing
                images={item.images}
                title={item.title}
                listingPda={item.listing_pda}
                aiSettings={item.ai_settings}
                price={item.price}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
