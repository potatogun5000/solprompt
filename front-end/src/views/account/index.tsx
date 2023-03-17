import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
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
  getListingAccount,
  getListingPda,
  withdrawSellerItx,
} from "../../web3/util";

const ItemView = (props): JSX.Element => {
  const { item, program, provider, publicKey } = props as any;
  const [loaded, setLoaded] = useState(false);
  const [data, setData] = useState(null);
  const [image, setImage] = useState(null);
  const [listingPda, setListingPda] = useState(null);

  const loadIt = async () => {
    try {
      const data = await getListingAccount(program, provider, publicKey, item);
      console.log('wtf', data);
      setData(data);
    } catch (error) {
      console.log('wtf', error);
    }
  };

  const getImages = async () => {
    try {
      const listingPda = await getListingPda(
        program,
        provider,
        publicKey,
        item
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_SERVER}/listing/${listingPda}`
      );
      const json = await response.json();

      if (json?.images.length) setImage(json.images[0]);
      setListingPda(listingPda);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (!loaded) {
      setLoaded(true);
      loadIt();
      getImages();
    }
  }, []);

  return (
    <tr key={`iiitji-${item}`}>
      {!loaded && (
        <>
          <th>{item}</th>
          <th colSpan={5} className="text-center">
            loading...
          </th>
        </>
      )}
      {data && (
        <>
          <th>{item}</th>
          <th>{data.engine}</th>
          <th>{(Number(data.price) / LAMPORTS_PER_SOL).toFixed(2)}</th>
          <th>{Number(data.sales)}</th>
          <th>{Number(data.approved) ? "approved" : "pending"}</th>
          <th>
            {image && (
              <Image
                alt="idc"
                src={`${process.env.NEXT_PUBLIC_API_SERVER}/static/${image}`}
                height={50}
                width={50}
              />
            )}
          </th>
          <th>
            {listingPda && (
              <Link
                style={{ textDecoration: "underline" }}
                target="_blank"
                href={`/detail?id=${listingPda}`}
              >
                open
              </Link>
            )}
          </th>
        </>
      )}
      {loaded && !data && (
        <>
          <th>{item}</th>
          <th colSpan={5} className="text-center">
            error loading listing
          </th>
        </>
      )}
    </tr>
  );
};

export const AccountView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { program } = useProgram();
  const { provider } = useProvider();

  const [balance, setBalance] = useState(-1);
  const [sales, setSales] = useState(-1);
  const [listings, setListings] = useState([]);
  const [imageMap, setImageMap] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const getUser = async (program, provider, publicKey) => {
    try {
      const user = await getSellerAccount(program, provider, publicKey);

      if(!user){
        setSales(0);
        setBalance(0);
        setBalance([]);
      }else{
        setSales(Number(user.sales));
        setBalance(Number(user.balance));
        setListings([...Array(Number(user.listings)).keys()].reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      const tx = await withdrawSellerItx(program, provider, publicKey);
      const sig = await sendTx(program, provider, wallet, tx);
      await provider.connection.confirmTransaction(sig);

      setBalance(0);
      notify({ type: 'success', message: 'Withdraw successful!', txid: sig});
    } catch (error) {
      notify({ type: 'error', message: `Error`, description: error?.message});
    }
    setLoading(false);
  };

  useEffect(() => {
    if (publicKey && provider && program && !loaded) {
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
                <div className="text-lg">
                  Balance: <br />
                  Sales:
                </div>
                <div className="ml-5 text-lg">
                  {balance === -1
                    ? "loading"
                    : (balance / LAMPORTS_PER_SOL).toFixed(1)}{" "}
                  SOL
                  <br />
                  {sales === -1 ? "loading" : sales} sold
                </div>
              </div>
              <button disabled={loading} onClick={handleWithdraw} className="ml-10 btn">
                {loading ? 'loading' : 'withdraw'}
              </button>
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
                  <td>id</td>
                  <td>type</td>
                  <td>price</td>
                  <td>sales</td>
                  <td>approved</td>
                  <td>thumbnail</td>
                  <td>view</td>
                </tr>
                {listings.map((item, index) => (
                  <ItemView
                    item={item}
                    publicKey={publicKey}
                    program={program}
                    provider={provider}
                  />
                ))}
              </table>
            ))}
          {!publicKey && <div>Connect wallet to view</div>}
        </div>
      </div>
    </div>
  );
};
