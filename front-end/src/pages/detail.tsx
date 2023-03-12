import type { NextPage } from "next";
import Head from "next/head";
import { DetailView } from "../views";

const Detail: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>prompt3.ai</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <DetailView/>
    </div>
  );
};

export default Detail;
