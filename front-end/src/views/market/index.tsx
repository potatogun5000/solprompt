import { FC, useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import pkg from "../../../package.json";
import Text from "../../components/Text";
import b58 from "b58";
import styled from 'styled-components';
import {
  Listing
} from "../../components/ListingThumb";
const ItemAmountLabel = styled.h1`
  text-align: center;
  font-weight: normal;
  font-size: 12px;
  margin-bottom: 15px;
`;

const HeaderM = styled.div`
  font-size: 25px;
  padding-top: 25px;
  padding-bottom: 25px;
  margin-left: 155px;
  font-weight: bold;
`;

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
  }, [sort])

  useEffect( () => {
    getPromps(0);
  }, [aiType])

  const getPromps = async(page:number) => {
    let aiTypeStr = '';
    if(aiType === 'mid_journey')
      aiTypeStr = '&filter=mid_journey';
    if(aiType === 'stable_diffusion')
      aiTypeStr = '&filter=stable_diffusion';


    const reqUrl = `${process.env.NEXT_PUBLIC_API_SERVER}/prompts?offset=${page*ITEM_LIMIT}&sort=${sort}${aiTypeStr}`;

    console.log(reqUrl);
    const response = await fetch(
      reqUrl
    );
    const json = await response.json();


    setCurrentPage(page);
    setData(json.rows);
    setTotalItems(json.count);
  }

  useEffect(() => {
    getPromps(0);
  }, []);

  return (
    <div className="p-4">
      <div className="flex flex-col">
        <HeaderM className="title-font">
          Marketplace
        </HeaderM>
        <div className="w-full text-left font-bold">
          <div className="flex flex-row">
            <div className="flex flex-col">
              <div className="" style={{ width: 150, fontSize: 12, padding: 20 }}>
                <div className="h_radio">Sort By</div>
                <div
                  onClick={() => setSort("views")}
                  className={`bord-top radio_item ${sort === "views" && "active"}`}
                >
                  Views
                </div>
                <div
                  onClick={() => setSort("newest")}
                  className={`bord-bot radio_item ${sort === "newest" && "active"}`}
                >
                  Newest
                </div>

                <div className="h_radio">Type</div>
                <div className="bord-top radio_item active"> Images</div>
                <div className="bord-bot radio_item disabled"> Text</div>

                <div className="h_radio">Generators</div>
                <div
                  onClick={() => setAiType("all")}
                  className={`radio_item bord-top ${aiType === "all" && "active"}`}
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
                  className={`bord-bot radio_item ${
                    aiType === "stable_diffusion" && "active"
                  }`}
                >
                  Stable Diffusion
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="flex flex-row "
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
              <div className="font-bold justify-center flex flex-row justify-between" style={{
                  width: 300,
                  margin: '0 auto',
                  marginTop:50
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
