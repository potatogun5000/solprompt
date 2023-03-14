import { FC, useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import b58 from "b58";
import {
  useProgram,
  useProvider,
  approveListing,
  sendTx,
} from "../../utils/util";
import { Transaction } from "@solana/web3.js";

const ShowSettings: FC = ({ data }) => {
  const _data = JSON.parse(b58.decode(data).toString());
  return (
    <table id="customers" style={{}}>
      <tr>
        {Object.keys(_data).map((key, index) => (
          <th key={`kaey-${index}`}>{key}</th>
        ))}
      </tr>
      <tr>
        {Object.keys(_data).map((key, index) => (
          <td key={`key-${index}`}>{unescape(_data[key])}</td>
        ))}
      </tr>
    </table>
  );
};

export const HomeView: FC = ({}) => {
  const { connection } = useConnection();
  const { program } = useProgram();
  const { provider } = useProvider();
  const wallet = useWallet();
  const { publicKey } = wallet;

  const [pw, setPw] = useState(null);
  const didLogRef = useRef(false);
  const [data, setData] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  const handleApprove = async () => {
    try {
      const ix = await approveListing(
        program,
        provider,
        data[selectedPrompt].listing_pda,
        publicKey
      );
      const tx = new Transaction();
      tx.add(ix);
      const sig = await sendTx(program, provider, wallet, tx);

      await provider.connection.confirmTransaction(sig);
      alert("approved");
    } catch (error) {
      alert("already approved or you didnt sign in wallet");
    }
  };

  const getPending = async (_pw) => {
    const response = await fetch(
      `https://api.solprompt.io/listing/pending?pw=${_pw}`
    );
    const json = await response.json();

    console.log(json);
    setData(json);
  };

  useEffect(() => {
    if (didLogRef.current === false) {
      didLogRef.current = true;
      let _pw = prompt("hey");
      setPw(_pw);
      getPending(_pw);
    }
  }, []);
  return (
    <div className="App">
      <header style={{ textAlign: "center", margin: 50, fontSize: 20 }}>
        admin panel
      </header>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {data.map((item, index) => (
          <button
            onClick={() => setSelectedPrompt(index)}
            style={{
              backgroundColor: selectedPrompt === index ? "blue" : "yellow",
              color: selectedPrompt === index ? "white" : "black",
              width: 25,
              height: 25,
            }}
          >
            {index}
          </button>
        ))}
      </div>
      <div style={{ margin: 50 }}>
        <h3>selected id: {selectedPrompt}</h3>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        {data.length &&
          data[selectedPrompt].images.map((item, index) => (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
              key={`im-${index}`}
            >
              <img
                src={`https://api.solprompt.io/static/${item.filename}`}
                key={`image-${index}`}
              />
              <a
                href={`https://api.solprompt.io/static/${item.filename}`}
                key={`iamage-${index}`}
                target="_blank"
                style={{ textDecoration: "underline", color: "blue" }}
              >
                open image
              </a>
            </div>
          ))}
      </div>
      <ul style={{ textAlign: "center" }}>
        {data.length &&
          Object.keys(data[selectedPrompt]).map((key, index) => (
            <>
              <li
                key={`ikey-${index}`}
                style={{ fontWeight: "bold", listStyleType: "none" }}
              >
                {key}
              </li>
              <li key={`key-${index}`} style={{ listStyleType: "none" }}>
                {key === "ai_settings" ? (
                  <ShowSettings data={data[selectedPrompt][key]} />
                ) : (
                  unescape(data[selectedPrompt][key])
                )}
              </li>
              <li style={{ listStyleType: "none", marginBottom: 20 }}></li>
            </>
          ))}
      </ul>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <button
          style={{
            backgroundColor: "green",
            color: "white",
            margin: 50,
            width: 100,
            height: 50,
          }}
          onClick={handleApprove}
        >
          Accept
        </button>
        <button
          style={{
            backgroundColor: "red",
            color: "white",
            margin: 50,
            width: 100,
            height: 50,
          }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};
