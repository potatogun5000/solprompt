import { useEffect, useState, useRef } from "react";

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
              width:25,
              height:25
            }}
          >
            {index}
          </button>
        ))}
      </div>
      <div style={{ margin: 50 }}>
        <h3>selected id: {selectedPrompt}</h3>
      </div>
      <div>
        {
          images.map( (image, index) => (
            <img src={image} key={`image-${index}`}/>
          ))
        }
      </div>
      <ul style={{textAlign: 'center'}}>
        {data.length &&
          Object.keys(data[selectedPrompt]).map((key, index) => (
            <>
              <li key={`ikey-${index}`} style={{ fontWeight: "bold", listStyleType: 'none'}}>
                {key}
              </li>
              <li key={`key-${index}`} style={{ listStyleType: "none" }}>
                {unescape(data[selectedPrompt][key])}
              </li>
              <li style={{ listStyleType: "none", marginBottom: 20}}></li>
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
      {/*
      <table
        id="customers"
        style={{
          display: "block",
          maxWidth: "100%",
          overflow: "scroll",
          height: 1000,
          width: "100%",
        }}
      >
        <tr style={{backgroundColor:'black', color:'white', marginBottom:20}}>
          {data.length &&
            Object.keys(data[0]).map((key, index) => (
              <th key={`kaey-${index}`}>{key}</th>
            ))}
        </tr>
        {data.map((item, index) => (
          <tr key={`item-${index}`}>
            {Object.keys(item).map((key, index) => (
              <th key={`key-${index}`}>{unescape(item[key])}</th>
            ))}
          </tr>
        ))}
      </table>*/}
    </div>
  );
}

export default App;
