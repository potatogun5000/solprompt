import { FC, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from 'next/router'
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

function getOffsetFromUrl(url) {
  const regex = /offset=(\d+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  } else {
    return 0;
  }
}

function getFilterFromUrl(url) {
  const regex = /filter=([^&]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return "all";
  }
}


function getTagFromUrl(url) {
  const regex = /tag=([^&]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return "all";
  }
}

function getSortFromUrl(url) {
  const regex = /sort=([^&]+)/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return "views";
  }
}

const categories = `Photography
Art
Graphics
Cartoons
Environment
Animals
Plants
Technology
Interior
Architecture
Transportation
Fashion
Colors
Entertainment
Anatomy
Materials
Food
Activities
Objects
Expressions
Miscellaneous`.split('\n');

export const MarketView: FC = ({}) => {
  const [data, setData] = useState([]);
  const router = useRouter();
  const [sort, setSort] = useState("views");
  const [aiType, setAiType] = useState("all");
  const [tag, setTag] = useState("all");
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const lastUrl = useRef("");

  useEffect(() => {
    if (data.length) {
      console.log('wtf4');
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

      for(let i = ac[ac.length-1]+1; i < max; i++){
        if(i<5){
          ac.push(i);
        }else{
          break;
        }
      }

      for(let i = ac[0]; i > 0; i--){
        if(ac.length < 5){
          ac = [i, ...ac];
        }else{
          break;
        }
      }


      setPages(ac);
      getPromps(currentPage);
    }
  }, [currentPage, totalItems]);

  useEffect( () => {
    if(data.length){
      console.log('wtf2');
      getPromps(currentPage);
    }
  }, [sort])

  useEffect( () => {
    if(data.length){
      console.log('wtf5');
      getPromps(0);
    }
  }, [tag])


  useEffect( () => {
    if(data.length){
      console.log('wtf3');
      getPromps(currentPage);
    }
  }, [aiType])

  const getPromps = async(page:number) => {
    let reqUrl;

    reqUrl = `${process.env.NEXT_PUBLIC_API_SERVER}/prompts?offset=${page*ITEM_LIMIT}&sort=${sort}&filter=${aiType}&tag=${tag}`;

    console.log('wtf', page, reqUrl, lastUrl.current);
    if(lastUrl.current === reqUrl){
      return;
    }
    lastUrl.current = reqUrl;


    const response = await fetch(
      reqUrl
    );
    const json = await response.json();


    setCurrentPage(page);
    setData(json.rows);
    setTotalItems(json.count);

    const search = reqUrl.split("?")[1];
    const obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    router.query = {};
    for(const key in obj){
      router.query[key] = obj[key];
    }
    router.push(router);
  }

  const getPromptsFromUrl = async () => {
    const reqUrl = `${process.env.NEXT_PUBLIC_API_SERVER}/prompts${window.location.search}`;
    lastUrl.current = reqUrl;

    const response = await fetch(
      reqUrl
    );
    const json = await response.json();

    const offset = getOffsetFromUrl(window.location.search);
    const sort = getSortFromUrl(window.location.search);
    const filter = getFilterFromUrl(window.location.search);
    const tag = getTagFromUrl(window.location.search);

    setTag(tag);
    setSort(sort);
    setAiType(filter);
    setCurrentPage(offset === 0 ? 0 : offset/ITEM_LIMIT);
    setData(json.rows);
    setTotalItems(json.count);

    const search = reqUrl.split("?")[1];
    const obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    router.query = {};
    for(const key in obj){
      router.query[key] = obj[key];
    }
    router.push(router);

  }

  useEffect(() => {
    if(!window.location.search){
      console.log('wtf1');
      getPromps(0);
    }else{
      console.log('wtf2');
      getPromptsFromUrl();
    }
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
                  onClick={() => {setCurrentPage(0);setAiType("all");}}
                  className={`radio_item bord-top ${aiType === "all" && "active"}`}
                >
                  All
                </div>
                <div
                  onClick={() => {setCurrentPage(0);setAiType("mid_journey");}}
                  className={`radio_item ${
                    aiType === "mid_journey" && "active"
                  }`}
                >
                  Mid Journey
                </div>
                <div
                  onClick={() => {setCurrentPage(0); setAiType("stable_diffusion");}}
                  className={`bord-bot radio_item ${
                    aiType === "stable_diffusion" && "active"
                  }`}
                >
                  Stable Diffusion
                </div>
                <div className="h_radio">Tags</div>
                <div
                  onClick={() => setTag("all")}
                  className={`bord-top radio_item ${tag=== "all" && "active"}`}
                >
                  All
                </div>
                 
                {
                  categories.map( c => (
                <div
                  onClick={() => setTag(c)}
                  className={`bord-top radio_item ${tag=== c && "active"}`}
                >
                  {c}
                </div>
                  ))}


              </div>
            </div>
            <div className="flex flex-col">
              <div
                className="flex flex-row "
                style={{ flexWrap: "wrap" }}
              >
                {data.map((item, index) => (
                  <Listing
                    key={`listingggg-${index}`}
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
              <div className="font-bold justify-center flex flex-row " style={{
                  width: 300,
                  margin: '0 auto',
                  marginTop:50
                }}>
                <div
                onClick={() => setCurrentPage(0)}
                className={`page ${pages[0] === 0 && 'page-disable'}`}>
                  1
                </div>
                <div
                onClick={() => setCurrentPage(0)}
                className={`pagespacer ${pages[0] === 0 && 'page-disable'}`}>
                  ...
                </div>

                {pages.map((p, index) => (
                  <div
                    key={`kkkk-${index}`}
                    onClick={() => setCurrentPage(p)}
                    className={`page ${p === currentPage && "active"}`}
                  >
                    {p + 1}
                  </div>
                ))}
                <div
                  className={`pagespacer ${pages[pages.length-1] === Math.floor(totalItems/ITEM_LIMIT) && 'page-disable'}`}>
                  ...
                </div>
                <div
                  onClick={() => setCurrentPage(Math.floor(totalItems/ITEM_LIMIT))}
                  className={`page ${pages[pages.length-1] === Math.floor(totalItems/ITEM_LIMIT) && 'page-disable'}`}>
                  {Math.floor(totalItems/ITEM_LIMIT)+1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
