import type { NextPage } from "next";
import Head from "next/head";
import { PendingView } from "../views";

const Pending: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Promp - Marketplace</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <PendingView/>
    </div>
  );
};

export default Pending;
