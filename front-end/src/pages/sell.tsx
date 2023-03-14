import type { NextPage } from "next";
import Head from "next/head";
import { SellView } from "../views";

const Sell: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Prompt - Marketplace</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <SellView />
    </div>
  );
};

export default Sell;
