import type { NextPage } from "next";
import Head from "next/head";
import { PurchasesView } from "../views";

const Purchases: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Prompt - Marketplace</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <PurchasesView/>
    </div>
  );
};

export default Purchases;
