import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as b58 from "b58";

const urls = `https://www.solprompt.io/detail?id=d304aa2581a5f2d6ce07f85a99d0258101eff02f4dd7e21fd3b64d593df92b1a
https://www.solprompt.io/detail?id=a077e9a2b9168ba40478a4e7c2706abe6de8e308c9910b8de870182e23b63792
https://www.solprompt.io/detail?id=99db954bd9abb7b0d18e8e136f9b440e55c1c4589ac8b4ca465d736d04993790
https://www.solprompt.io/detail?id=1783a75e41c853fbdd302d7e6c4e9bafb66d3978b230cafc8af40edfec02878e
https://www.solprompt.io/detail?id=e97cbe8395efc9b95fec2f8c46e1181905ae79cd76c04ea45638d50b0cf872b5
https://www.solprompt.io/detail?id=540dd0d2ff7de8dab7b58e93e399d2b5e4cdb598b2ac8d909f093c6a497fdc13
https://www.solprompt.io/detail?id=0ce82028d89f6f51bb86c08c508f229d49c13733b53fb58112adc4dc90161a59
https://www.solprompt.io/detail?id=a2aa611d4abadb7cdfdae037008b3a9e7d5e95065aae10b5a47411708b20f231
https://www.solprompt.io/detail?id=42250b4ba77e3d71d8545d853b79b5bb92180dd60dc4db369d295a66aff8acce
https://www.solprompt.io/detail?id=b02e0f8f2f60b586519255688c3d56eca7a05302240ab06c3d339106af16a28f
https://www.solprompt.io/detail?id=076ad18ffb946f57d3f23d5801509085f46514e086aff1cedf55ec8ba9a425ff
https://www.solprompt.io/detail?id=99dd5ee5c44b2ace43b842d831423d466b9bcdfdcfddd77ec28a7e686ddc6c3e
https://www.solprompt.io/detail?id=cc5b496cadac6804b346f0575f8a5f53df12423d0b505d1d7cca0f5ccfa18c47
https://www.solprompt.io/detail?id=076ad18ffb946f57d3f23d5801509085f46514e086aff1cedf55ec8ba9a425ff
https://www.solprompt.io/detail?id=99dd5ee5c44b2ace43b842d831423d466b9bcdfdcfddd77ec28a7e686ddc6c3e
https://www.solprompt.io/detail?id=c33510029186ecff99b10667f8fe00ef387f2419cfe98c40823f5d47ccb5ec13
https://www.solprompt.io/detail?id=a4b39b01ce6d58cac469080985a8688b315dbcaaaaca1d739c30ce4e42a221cb
https://www.solprompt.io/detail?id=1ba4a2feb658ad5b48fdd98d7f0a033214510ac1bd67ef8b927bb1f58a169538
https://www.solprompt.io/detail?id=540dd0d2ff7de8dab7b58e93e399d2b5e4cdb598b2ac8d909f093c6a497fdc13
https://www.solprompt.io/detail?id=3434c207b75e966715cba9f1ae3f1be2f0f1c4e8690afe9647b990bfce6e794a
https://www.solprompt.io/detail?id=234898f07914c0c13518845ee53cd3dcb689f9aa4305c0a7901a2507f178eb63
https://www.solprompt.io/detail?id=5a5d882cdc35dc5c10c09a51f1ade82de4e641c25a37e0f9409f4d7f2475f4a3
https://www.solprompt.io/detail?id=3c0e7bc8702cdb018089ebfd8b2ac42db8f957f1cc23f1bc57d8cbdb6709d614
https://www.solprompt.io/detail?id=07df410fb042c410d6cb67f5242ab33771c44aab9f9d2ea8326ffafa0373cb8a
https://www.solprompt.io/detail?id=3cf439ca9b4eba69ef54247fe3ecad890d0dd6aad60d918c49d99afbbfa2072c
https://www.solprompt.io/detail?id=a8f8272acbd8a468c8bf9edacf57298a5b46cb0f37778ee5fd1a6675f4ca49aa
https://www.solprompt.io/detail?id=1673f5f90ce92b2a3cbba9baf8f147acbe7bf03184e9587635837bea0fc0a269
https://www.solprompt.io/detail?id=b960b9dd7b3818cd738342e8e79ae1087c2f98ad2912275f3c2db6a6f4bbd84a
https://www.solprompt.io/detail?id=ca6a5853eee519bf0aab0808a43a42b98a6d1dac389b1d733c2a51d936cc2fcd
https://www.solprompt.io/detail?id=d9a264092ea1133baf3c49dc069ca149d599196102793efcfb2c2c0232f1d0ce
https://www.solprompt.io/detail?id=f5e6a61f5549229576cc743d7cba266040219a7ded9f541018747e4719e9b358
https://www.solprompt.io/detail?id=b08cd13b40efcaf5e5946f88c73e6497109c5560fdfd70a2005da497d5364114
https://www.solprompt.io/detail?id=ed6fdfcdf7d15a8f7740253d09db14779f93ab193b5aef4aa6de6a51e47404a0
https://www.solprompt.io/detail?id=eb847b31db90d19c931ec19c8015d8a9f7b74d751d1b78f3319e3177b569257a
https://www.solprompt.io/detail?id=c33510029186ecff99b10667f8fe00ef387f2419cfe98c40823f5d47ccb5ec13
https://www.solprompt.io/detail?id=edf799b3a92fc402b824775307519727705b3695eb48c2b07586b547ef661e4a
https://www.solprompt.io/detail?id=08af969ca399f8c23e0654022ae78c699997ff7c2b665f50d2b8bfc2c58a50ac
https://www.solprompt.io/detail?id=5a22049c24b264633e839e7510ba0bd3e7cf2e47b26fb6e7b9028c1a61fe688c
https://www.solprompt.io/detail?id=912099abbe3cade2e0bc01e107d09a5ae4901a82216cd0f8ffdb7c801e70b628`;

function getIdFromUrl(url) {
  const regex = /id=([\w\d]+)/;
  const match = url.match(regex);
  if (match && match.length > 1) {
    return match[1];
  }
  return null;
}

(async () => {
  const db = await open({
    filename: "./db",
    driver: sqlite3.Database,
  });

  const urlArr = urls.split("\n");

  console.log(urlArr);

  for (let i = 0; i < urlArr.length; i++) {
    console.log(i);
    const id = getIdFromUrl(urlArr[i]);
    await db.run("DELETE FROM prompts WHERE listing_pda = ?", id);
  }
})();
