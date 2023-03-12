import type { NextPage } from "next";
import Head from "next/head";
import { AccountView} from "../views";

const Account: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>prompt3.ai</title>
        <meta
          name="description"
          content="Basic Functionality"
        />
      </Head>
      <AccountView/>
    </div>
  );
};

export default Account;
