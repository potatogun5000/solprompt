import { FC, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";
import b58 from "b58";

const Listing = (props): JSX.Element => {
  const {
    views,
    saves,
    thumbnail,
    title,
    listingPda,
    aiSettings,
    price,
    aiType,
  } = props as any;

  return (
    <Link
      target="_blank"
      className="p-1 hover:border-gray-700 border-transparent border-2 hover:border-current pb-5"
      href={`/detail?id=${listingPda}`}
    >
      <div style={{ width: 150, marginRight: 10 }}>
        <div
          style={{
            width: "100%",
            height: 160,
            position: "relative",
          }}
        >
          <Image
            key={thumbnail}
            alt="idc"
            src={thumbnail}
            layout="fill"
            objectFit="cover"
            style={{ borderRadius: 5 }}
          />
          <div
            style={{
              position: "absolute",
              zIndex: 2,
              textAlign: "center",
              width: "100%",
              top: 5,
              fontSize: 11,
              color: "white",
              textShadow: "0 0 15px black, 0 0 15px black, 0 0 15px black",
            }}
          ></div>

          <div
            style={{
              zIndex: 2,
              fontSize: 10,
              textTransform: "uppercase",
              position: "absolute",
              padding: 5,
              paddingBottom: 2,
              bottom: 0,
              width: "100%",
              backgroundColor: "#000000a8",
              textAlign: "center",
            }}
          >
            <div
              className="flex flex-row"
              style={{ fontSize: 12, fontWeight: "bold", float: "left" }}
            >
              <Image
                alt="idc"
                src="/eye.svg"
                width={11}
                height={11}
                style={{ filter: "invert(1)" }}
              />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  float: "right",
                  paddingTop: 2,
                  paddingLeft: 5,
                }}
              >
                {views}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: "bold",
                float: "right",
                paddingTop: 2,
              }}
            >
              {price === "0" ? "FREE" : `${price} SOL`}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const ITEM_LIMIT = 25;

export const getColor = (aiType) => {
  switch (aiType) {
    case "mid_journey":
      return "red";
    case "stable_diffusion":
      return "blue";
    case "dall_e":
      return "green";
  }
};
export const MarketView: FC = ({}) => {
  const [data, setData] = useState([]);

  const [sort, setSort] = useState("views");
  const [aiType, setAiType] = useState("all");
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    if (currentPage > -1) {
      let ac = [];
      const begin = currentPage-2;
      const end = currentPage+2;
      for(let i = begin; i <= end; i++){
        ac.push(i);
      }


      const max = Math.ceil(totalItems/ITEM_LIMIT);

      for(let i = ac.length-1; i >= 0; i--){
        if(ac[i] < 0)
          ac.splice(i, 1);

        if(ac[i] >= max)
          ac.splice(i,1)
      }

      setPages(ac);
      getPromps(currentPage);
    }
  }, [currentPage, totalItems]);

  useEffect( () => {
    getPromps(currentPage);
  }, [sort, aiType])

  useEffect( () => {
    setCurrentPage(0);
  }, [aiType])

  const setLastPage = () => {
    setCurrentPage(Math.floor((totalItems/ITEM_LIMIT)))
  }

  const getPromps = async(page:number) => {
    let aiTypeStr = '';
    if(aiType === 'mid_journey')
      aiTypeStr = '&filter=mid_journey';
    if(aiType === 'stable_diffusion')
      aiTypeStr = '&filter=stable_diffusion';


    const reqUrl = `${process.env.NEXT_PUBLIC_API_SERVER}/prompts?offset=${currentPage*ITEM_LIMIT}&sort=${sort}${aiTypeStr}`;

    console.log(reqUrl);
    const response = await fetch(
      reqUrl
    );
    const json = await response.json();


    setData(json.rows);
    setCurrentPage(page);
    setTotalItems(json.count);
  }

  const getData = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER}/prompts?sort=${sort}`
    );
    const json = await response.json();
    console.log(json);

    setTotalItems(json.count)
    setData(json.rows);
    setCurrentPage(0);
  };

  useEffect(() => {
    getPromps(0);
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
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="" style={{ width: 100, fontSize: 12 }}>
                <div className="h_radio">Sort By</div>
                <div
                  onClick={() => setSort("views")}
                  className={`radio_item ${sort === "views" && "active"}`}
                >
                  Views
                </div>
                <div
                  onClick={() => setSort("newest")}
                  className={`radio_item ${sort === "newest" && "active"}`}
                >
                  Newest
                </div>

                <div className="h_radio">Type</div>
                <div className="radio_item active"> Images</div>
                <div className="radio_item disabled"> Text</div>

                <div className="h_radio">Generators</div>
                <div
                  onClick={() => setAiType("all")}
                  className={`radio_item ${aiType === "all" && "active"}`}
                >
                  All
                </div>
                <div
                  onClick={() => setAiType("mid_journey")}
                  className={`radio_item ${
                    aiType === "mid_journey" && "active"
                  }`}
                >
                  Mid Journey
                </div>
                <div
                  onClick={() => setAiType("stable_diffusion")}
                  className={`radio_item ${
                    aiType === "stable_diffusion" && "active"
                  }`}
                >
                  Stable Diffusion
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="flex flex-row justify-center"
                style={{ flexWrap: "wrap" }}
              >
                {data.map((item, index) => (
                  <Listing
                    className="flex"
                    aiType={item.ai_type}
                    views={item.views}
                    saves={item.saves}
                    thumbnail={item.thumbnail}
                    title={item.title}
                    listingPda={item.listing_pda}
                    aiSettings={item.ai_settings}
                    price={item.price}
                  />
                ))}
              </div>
              <div className="justify-center flex flex-row" style={{
                  marginTop: 25,
                }}>
                <div
                onClick={() => setCurrentPage(0)}
                className={`page ${currentPage === 0 && 'page-disable'}`}>
                  First
                </div>
                {pages.map((p, index) => (
                  <div
                    onClick={() => setCurrentPage(p)}
                    className={`page ${p === currentPage && "active"}`}
                  >
                    {p + 1}
                  </div>
                ))}
                <div
                  onClick={() => setCurrentPage(Math.floor(totalItems/ITEM_LIMIT))}
                  className={`page ${currentPage === Math.floor(totalItems/ITEM_LIMIT) && 'page-disable'}`}>
                  Last
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
