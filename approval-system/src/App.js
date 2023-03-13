import { useEffect, useState, useRef } from "react";
import b58 from "b58";

const ShowSettings = (props) => {
  const data = JSON.parse(b58.decode(props.data).toString());
  return (
    <table
      id="customers"
      style={{
      }}
    >
      <tr>
        {Object.keys(data).map((key, index) => (
          <th key={`kaey-${index}`}>{key}</th>
        ))}
      </tr>
      <tr>
        {Object.keys(data).map((key, index) => (
          <td key={`key-${index}`}>{unescape(data[key])}</td>
        ))}
      </tr>
    </table>
  );
};

function App() {
  const [pw, setPw] = useState(null);
  const didLogRef = useRef(false);
  const [data, setData] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(0);

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
            >
              <img
                src={`https://api.solprompt.io/static/${item.filename}`}
                key={`image-${index}`}
              />
              <a
                href={`https://api.solprompt.io/static/${item.filename}`}
                key={`iamage-${index}`}
                target="_blank"
              >
                open
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
            backgroundColor: "red",
            color: "black",
            margin: 50,
            width: 100,
            height: 50,
          }}
        >
          Reject
        </button>
        <button
          style={{
            backgroundColor: "blue",
            color: "white",
            margin: 50,
            width: 100,
            height: 50,
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}

export default App;
