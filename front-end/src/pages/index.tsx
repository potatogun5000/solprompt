import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Prompt3.ai</title>
        <meta
          name="description"
          content="prompt3.ai"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
