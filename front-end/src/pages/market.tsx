import type { NextPage } from "next";
import Head from "next/head";
import { MarketView } from "../views";

const Market: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Prompt - Marketplace</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <MarketView/>
    </div>
  );
};

export default Market;
