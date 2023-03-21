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
  const { images, title, listingPda, aiSettings, price, aiType } = props as any;

  return (
    <Link
      className="hover:border-gray-700 border-transparent border-2 hover:border-current"
      href={`/detail?id=${listingPda}`}
      style={{margin: 10}}
    >
      <div style={{ width: "100%" }}>
        <div
          style={{
            width: "200px",
            height: "200px",
            position: "relative",
          }}
        >
          <Image
            alt="idc"
            src={
              images[0].cdn
                ? images[0].cdn
                : `${process.env.NEXT_PUBLIC_API_SERVER}/static/${images[0].filename}`
            }
            layout="fill"
            objectFit="cover"
            style={{borderTopRightRadius:10}}
          />
          <div style={{zIndex: 3, fontSize:12,  textTransform: 'uppercase', position: 'absolute', padding: 5, paddingBottom:2, top: 0, width: 100, textAlign: 'right', borderRadius: 5, right: 0, textShadow:'0px 0px 20px #000, 0px 0px 6px #000, 0px 0px 20px #000, 0px 0px 6px #000'}}>{price} SOL</div>

        <div style={{zIndex: 2, fontSize:12,  textTransform: 'uppercase', position: 'absolute', padding: 5, paddingBottom:2, bottom: 0, width: '100%', backgroundColor: '#000000a8', textAlign: 'center'}}>{aiType.replace('_', ' ')}</div>

        </div>
      </div>
    </Link>
  );
};

const bgImages = [
  "bg0.png",
  "bg1.png",
  "bg2.png",
  "bg3.png",
  "bg4.png",
  "bg5.png",
];

const comicImages = [
  {
    img: "https://media.discordapp.net/attachments/1083449288660635760/1087634386826043392/fei_futuristic_comic_purple_and_black_man_writes_on_paper_17058aff-10ce-4827-8f42-5c167a7c6156.png?width=1250&height=714",
    text: "Craft AI Prompts",
  },
  {
    img: "https://media.discordapp.net/attachments/1083449288660635760/1087635152815013919/fei_futuristic_comic_purple_and_black_man_is_in_a_art_gallery_60f56388-7ba9-463a-ba36-95b613769838.png?width=1253&height=716",
    text: "List for Sale",
  },
  {
    img: "https://media.discordapp.net/attachments/1083449288660635760/1087633214660677652/fei_futuristic_comic_purple_and_black_man_shakes_hand_e28408d5-f14a-4622-a5d0-b2b63e146cc4.png?width=1250&height=714",
    text: "Attract Buyers",
  },
  {
    img: "https://media.discordapp.net/attachments/1083449288660635760/1087633117109571594/fei_futuristic_comic_purple_and_black_man_holds_money_f6c9c9f7-26d2-4d1f-94b8-bd9700f87ae8.png?width=1250&height=714",
    text: "Earn in Sol",
  },
];

export const HomeView: FC = ({}) => {
  const [featured, setFeatured] = useState([]);
  const [hottest, setHottest] = useState([]);

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

    const featured= [
      json[0],
      json[2],
      json[5],
      json[6],
      json[7]];
    const hottest = [
      json[8],
      json[11],
      json[13],
      json[14],
      json[15],
      /*json[18],
      json[21],*/
    ];

    setFeatured(featured);
    setHottest(hottest);
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
              textShadow: '0 0 11px black'
            }}
          >
            <h1 className="cursive_font text-center text-lg ml-1 text-white bg-clip-text text-left font-light">
              The #1 prompt marketplace
            </h1>
            <h1 className="title_font text-center text-5xl font-bold text-white bg-clip-text mb-1 ">
              Marketplace of the Future
            </h1>
            <h1
              className="cursive_font text-center text-lg ml-1 text-white bg-clip-text mb-4 text-left font-light"
              style={{
                textShadow: "rgb(225 0 176) 3px 2px 5px",
              }}
            >
              Built on Solana
            </h1>
            <p className="cursive_font text-center pt-10 text-2xl text-white bg-clip-text mb-4 text-left font-light hidden md:block">
              We support DALL·E, GPT, Midjourney, Stable Diffusion, ChatGPT
            </p>
          </div>
          {isDesktop ? (
            <Carousel
              centerMode={true}
              centerSlidePercentage={50}
              swipeable={false}
              autoPlay={true}
              infiniteLoop={true}
              showArrows={false}
              showThumbs={false}
              useKeyboardArrows={false}
              showStatus={false}
              showIndicators={false}
              interval={1000*15}
            >
              {bgImages.map((item, index) => (
                <div key={index} style={{height:450, width: '100%', backgroundPosition: 'bottom', backgroundSize: 'cover', backgroundImage: `url("${item}")`, 
  backgroundColor: 'rgba(0,0,0,.4)',
  backgroundBlendMode: 'multiply'
                  }}>
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
              interval={1000*15}
            >
              {bgImages.map((item, index) => (
                <div key={index} style={{height:450, width: '100%', backgroundPosition: 'bottom', backgroundSize: 'cover', backgroundImage: `url("${item}")`, 
  backgroundColor: 'rgba(128,0,128,0.4)',
  backgroundBlendMode: 'multiply'
                  }}>
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          margin: "0 auto",
          display: 'flex',
          flexDirection: 'row',
          marginTop: 50
        }}
      >
        <div style={{width:'50%', paddingBottom: 40}}>
        <h1
            style={{
            textAlign: "center",
            fontSize: 20,
            letterSpacing: 1,
            marginTop: 30,
            fontWeight: "bold",
          }}
        >
          Why Sell With Us
        </h1>
          <ul style={{padding:25, display:'flex', flexDirection:'column', justifyContent: 'space-around', height:'100%'}}>
            <li><strong>Reach diverse customers:</strong> Access a vast, varied audience within the web3 ecosystem.</li>
            <li><strong>Easy listing creation:</strong> Quickly showcase your AI prompts with user-friendly tools.</li>
            <li><strong>Instant earnings:</strong> Sell prompts and effortlessly withdraw your cryptocurrency earnings.</li>
            <li><strong>Web3 transparency:</strong> Experience 100% transparency in all transactions with web3 integration.</li>
            <li><strong>Hassle-free payments:</strong> Accept cryptocurrencies seamlessly without complex payment systems.</li>
            <li><strong>Global community:</strong> Connect, collaborate, and learn from AI enthusiasts worldwide.</li>
          </ul>
        </div>
        <div style={{width:'50%'}}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            paddingTop: 25
          }}
        >
          {comicImages.slice(0,2).map((item, index) => (
            <div style={{ flex: 1, margin: 10 }}>
              <img
                src={item.img}
                style={{ width: "100%", borderTopRightRadius: 10, filter: 'brightness(0.7)'}}
              />
              <div
                style={{
                  textAlign: "center",
                  padding: 10,
                  backgroundColor: "rgb(77 5 122)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 13,
                  letterSpacing: 1,
                  borderBottomLeftRadius: 10,
                }}
              >
                {index + 1}. {item.text}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginTop: 20,
          }}
        >
          {comicImages.slice(2,4).map((item, index) => (
            <div style={{ flex: 1, margin: 10 }}>
              <img
                src={item.img}
                style={{ width: "100%", borderTopRightRadius: 10, filter: 'brightness(0.7)'}}
              />
              <div
                style={{
                  textAlign: "center",
                  padding: 10,
                  backgroundColor: "rgb(77 5 122)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 13,
                  letterSpacing: 1,
                  borderBottomLeftRadius: 10,
                }}
              >
                {index + 3}. {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      </div>
      <div
        className="flex flex-col"
        style={{
          margin: "0 auto",
          marginTop: 50,
          width: "100%",
          maxWidth: 1000,
        }}
      >
        <div className="w-full text-left font-bold">
          <h1 style={{ textAlign: "center", fontSize: 20, letterSpacing: 1 }}>
            <span style={{fontSize:12, color:'purple', marginRight: 10, visibility:'hidden'}}>(view all)</span>
            Featured
            <Link href="/market" style={{fontSize:12, marginLeft: 10, color:'#1c86c5'}}>(view all)</Link>
          </h1>
          <div
            className="flex flex-row justify-center pt-5"
            style={{  }}
          >
            {featured.slice(0, 12).map((item, index) => (
              <Listing
                images={item.images}
                title={item.title}
                listingPda={item.listing_pda}
                aiSettings={item.ai_settings}
                price={item.price}
                aiType={item.ai_type}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex flex-col"
        style={{
          margin: "0 auto",
          marginTop: 50,
          width: "100%",
          maxWidth: 1000,
        }}
      >
        <div className="w-full text-left font-bold">
          <h1 style={{ textAlign: "center", fontSize: 20, letterSpacing: 1 }}>
            <span style={{fontSize:12, color:'purple', marginRight: 10, visibility:'hidden'}}>(view all)</span>
            Hottest
            <Link href="/market" style={{fontSize:12, marginLeft: 10, color:'#1c86c5'}}>(view all)</Link>
          </h1>
          <div
            className="flex flex-row justify-center pt-5"
            style={{  }}
          >
            {hottest.slice(0, 12).map((item, index) => (
              <Listing
                images={item.images}
                title={item.title}
                listingPda={item.listing_pda}
                aiSettings={item.ai_settings}
                price={item.price}
                aiType={item.ai_type}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
