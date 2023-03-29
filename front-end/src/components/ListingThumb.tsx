import { FC, useEffect, useState, useRef } from "react";
import styled from 'styled-components';
import Link from "next/link";
import Image from "next/image";
const ListingCard = styled.div`
  width: 250px;
  height: 390px;
  margin-right: 10px;
  background-color: #0a0a0a;
  padding-top: 20px;
  border-radius: 15px;

  .image-holder{
    width: 210px;
    height: 230px;
    position: relative;
    margin: 0 auto;
  }
  .text-holder {
    padding: 20px;
  }

  .title-header{
    height: 23px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    font-size: 13px;
  }

  .price-header{
    margin-top: 5px;
    font-size: 12px;
    color: #8c82ff;
  }

  .grey {
    color: grey;
  }

  .cap {
    text-transform: capitalize;
  }

  hr{
        height: 1px;
        background-color: #545454;
        border: none;
        margin-top:10px;
        margin-bottom: 10px;
  }
  .eye {
    filter: invert(1);
  }
  .eye-h {
    display: flex;
    font-size: 12px;

    div {
      margin-left: 5px;
    }
  }
`;

export const Listing = (props): JSX.Element => {
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
      className="p-1"
      href={`/detail?id=${listingPda}`}
    >
      <ListingCard>
        <div className="image-holder">
          <Image
            key={thumbnail}
            alt="idc"
            src={thumbnail}
            layout="fill"
            objectFit="cover"
            style={{ borderRadius: 15 }}
          />
        </div>
        <div className="text-holder">
          <h1 className="title-header title-font">{unescape(title)}</h1>
          <h1 className="price-header cap">{aiType.split('_').join(' ')} <span className="grey"></span></h1>
          <h1 className="price-header"><span className="grey">price: </span> {price} SOL</h1>
          <hr/>
          <div className="flex flex-row justify-between text-sm grey">
            <h1></h1>
            <div className="eye-h">
              <Image alt="eye" className="eye" src="./eye.svg" width={15} height={15}/>
              <div>{views}</div>
            </div>
          </div>
        </div>
      </ListingCard>
    </Link>
  );
};


