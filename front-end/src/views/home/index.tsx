import { FC, useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";
import b58 from "b58";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";

const Listing = (props): JSX.Element => {
  const { images, title, listingPda, aiSettings, price } = props as any;

  return (
    <Link
      className="p-5 hover:border-gray-700 border-transparent border-2 hover:border-current pb-2"
      href={`/detail?id=${listingPda}`}
      style={{}}
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

const bgImages = [
  "https://media.discordapp.net/attachments/1083449288660635760/1085900244883099668/polus_cyberpunkbillboard_c13799d8-eaa0-4967-865f-9e2b0736280c.png",
  "https://media.discordapp.net/attachments/1083449288660635760/1085917259538636830/polus_cyberpunkbillboard_9c75ccc1-b880-4928-87a5-28fadcd13f4d.png",
  "https://media.discordapp.net/attachments/1083449288660635760/1085917298168184883/polus_cyberpunkbillboard_c355f474-932f-4cd4-81d8-8cd3220d880c.png",
  "https://media.discordapp.net/attachments/1083449288660635760/1085917481719316502/polus_cyberpunkbillboard_e1dc33da-503b-4bae-a6d2-667f7f5f6e78.png",
  "https://media.discordapp.net/attachments/1083449288660635760/1085917541257449493/polus_cyberpunkbillboard_33f85c27-7389-4bfa-9529-c9a8ec3ab745.png",
  "https://media.discordapp.net/attachments/1083449288660635760/1085917588644708372/polus_cyberpunkbillboard_c1ec4640-bce9-48ef-9670-e6b1c2d671e3.png",
];

export const HomeView: FC = ({}) => {
  const [data, setData] = useState([]);

  const [isDesktop, setDesktop] = useState(window.innerWidth > 1450);

  const updateMedia = () => {
    setDesktop(window.innerWidth > 1450);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

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
    <div style={{ backgroundColor: "#121418" }}>
      <div
        className="mx-auto"
        style={{
          backgroundColor: "rgb(14 14 14)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              zIndex: 1,
              top: "35%",
              left: "50%",
              width: "100%",
              transform: "translate(-50%, -50%)",
              padding: 30,
              paddingTop: 130,
            }}
          >
            <h1 className="cursive_font text-center text-lg ml-1 text-white bg-clip-text text-left font-light">
              The #1 prompt marketplace
            </h1>
            <h1 className="title_font text-center text-5xl font-bold text-white bg-clip-text mb-1 ">
              Marketplace of the Future
            </h1>
            <h1 className="cursive_font text-center text-lg ml-1 text-white bg-clip-text mb-4 text-left font-light" style={{
              textShadow: 'rgb(225 0 176) 3px 2px 0px'
              }}>
              Built on Solana
            </h1>
            <p className="cursive_font text-center pt-10 text-2xl text-white bg-clip-text mb-4 text-left font-light" >
              We support DALL·E, GPT, Midjourney, Stable Diffusion, ChatGPT
            </p>
            <div className="flex flex-col mt-2">
              <div className="flex flex-row justify-center">
                <Link href={"./market"}>
                  <button
                    className="px-8 m-2 btn text-black bg-white border-none hover:bg-purple-400"
                    onClick={() => {}}
                  >
                    <span>Purchase a Prompt</span>
                  </button>
                </Link>
                <Link href={"./sell"}>
                  <button
                    className="px-8 m-2 btn text-white border-none hover:bg-teal-200"
                    style={{backgroundColor: '#7075d3'}}
                    onClick={() => {}}
                  >
                    <span>Sell a Prompt</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
          {isDesktop ? (
            <Carousel
              centerMode={true}
              centerSlidePercentage={60}
              swipeable={false}
              autoPlay={true}
              infiniteLoop={true}
              showArrows={false}
              showThumbs={false}
              useKeyboardArrows={false}
              showStatus={false}
              showIndicators={false}
            >
              {bgImages.map((item, index) => (
                <div key={index}>
                  <img className="tint" alt="idc" src={item} />
                </div>
              ))}
            </Carousel>
          ) : (
            <Carousel
              centerMode={true}
              centerSlidePercentage={100}
              swipeable={false}
              autoPlay={true}
              infiniteLoop={true}
              showArrows={false}
              showThumbs={false}
              useKeyboardArrows={false}
              showStatus={false}
              showIndicators={false}
            >
              {bgImages.map((item, index) => (
                <div key={index}>
                  <img className="tint" alt="idc" src={item} />
                </div>
              ))}
            </Carousel>
          )}
        </div>
        {/*<div
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
        </div>*/}
      </div>
      <div
        className="flex flex-col"
        style={{
          margin: "0 auto",
          marginTop: 30,
          width: "100%",
          maxWidth: 800,
        }}
      >
        <div className="w-full text-left font-bold">
          <h1 style={{ textAlign: "center", letterSpacing: 1 }}>
            Featured Listings
          </h1>
          <div
            className="flex flex-row justify-center pt-5"
            style={{ flexWrap: "wrap" }}
          >
            {data.slice(0, 10).map((item, index) => (
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
