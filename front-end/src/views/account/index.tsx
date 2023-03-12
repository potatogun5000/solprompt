import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  SystemProgram,
  Transaction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from "@solana/web3.js";
import { notify } from "../../utils/notifications";
import {
  useProvider,
  useProgram,
  getSellerAccount,
  createSellerAccountItx,
  sendTx,
  createListingItx,
  getListingAccounts,
} from "../../web3/util";

/*
const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);
approved
: 
false
bump
: 
255
engine
: 
"dog"
id
: 
BN {negative: 0, words: Array(3), length: 1, red: null}
price
: 
BN {negative: 0, words: Array(3), length: 1, red: null}
sales
: 
BN {negative: 0, words: Array(3), length: 1, red: null}
seller
: 
PublicKey {_bn: BN}
token
: 
PublicKey {_bn: BN}
*/

export const AccountView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { program } = useProgram();
  const { provider } = useProvider();

  const [balance, setBalance] = useState(-1);
  const [sales, setSales] = useState(-1);
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const getAccounts = async (program, provider, publicKey) => {
    const lists = await getListingAccounts(program, provider, publicKey);

    setListings(lists);
  };

  const getUser = async (program, provider, publicKey) => {
    try {
      const user = await getSellerAccount(program, provider, publicKey);
      setSales(Number(user.sellerAccount.sales));
      setBalance(Number(user.sellerAccount.balance));
      console.log(user);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (publicKey && provider && program && !loaded) {
      getAccounts(program, provider, publicKey);
      getUser(program, provider, publicKey);

      setLoaded(true);
    }
  }, [publicKey, provider, program, loaded]);

  return (
    <div className="md:hero mx-auto p-4">
      <div className="w-full hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Listings
          </h1>
        </div>
        <div className="mb-5">
          {publicKey && (
            <div className="flex flex-row">
              <div className="flex flex-row mr-10">
                <div>Balance: <br/>Sales:</div>
                <div className="ml-5">
                  {balance === -1 ? "loading" : balance} SOL<br/>
                  {sales === -1 ? "loading" : sales} sold
                </div>
              </div>
              <button className="ml-10 btn">withdraw</button>
            </div>
          )}
        </div>
        <div className="mb-5">
          {publicKey &&
            (listings.length === 0 ? (
              <div>
                No listings yet, create them here <Link href="/sell">sell</Link>
              </div>
            ) : (
              <table style={{ width: 600, textAlign: "left" }}>
                <tr className="table_header">
                  <td>address</td>
                  <td>ai</td>
                  <td>price</td>
                  <td>sales</td>
                  <td>approved</td>
                  <td></td>
                </tr>
                {listings.map((item) => (
                  <>
                    <tr className="table_content">
                      <th>{item.pda.toBase58().slice(0, 7)}</th>
                      <th>{item.engine}</th>
                      <th>{Number(item.price)} SOL</th>
                      <th>{Number(item.sales)}</th>
                      <th>{item.approved ? "Approved" : "Pending"}</th>
                      <th>
                        <Link
                          rel="noreferrer"
                          className="underline"
                          target="_blank"
                          href={`/detail?id=${item.pda.toBase58()}`}
                        >
                          view
                        </Link>
                      </th>
                    </tr>
                  </>
                ))}
              </table>
            ))}
          {!publicKey && <div>Connect wallet to view</div>}
        </div>
      </div>
    </div>
  );
};
