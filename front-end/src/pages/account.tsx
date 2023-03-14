import type { NextPage } from "next";
import Head from "next/head";
import { AccountView} from "../views";

const Account: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Sol Prompt - Marketplace</title>
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
