import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as b58 from "b58";

const urls = `https://www.solprompt.io/detail?id=0451c7121e8bab80588bf40b2598733b6b3138e8873d63e1e021ca5a6cb5238f
https://www.solprompt.io/detail?id=3c8b22ee19ea233f1bed3854b790d85b2aaf67052e7a448cabb65e0299e23b9a
https://www.solprompt.io/detail?id=cd3049e6396ed99424a6acc73ff40ad7c12cf786c9ff9f5812dcf5498ca57215
https://www.solprompt.io/detail?id=3764d6a5cd40f5dc3f35d90414fe9e680bef01bdd563e843c505d6d89149592b
https://www.solprompt.io/detail?id=d17ff00081bb976813776d2957dd489fcc5a82baa13dbba9da3d711e8112fa7d
https://www.solprompt.io/detail?id=8e4626528c48bf1a9eb710cae50f777d6be2482b4d468fb2861dc18911cf1996
https://www.solprompt.io/detail?id=b01b14aaa4653515c8c6f101946a115fc9eddd2df435603fe719a1de1df562ce
https://www.solprompt.io/detail?id=042af44fe6890a4f1a49bfa8f9ac6b275b6431e3e2ec12cb3a609a4e1bde6141
https://www.solprompt.io/detail?id=f63a8020da7fed067e92d258375d021d596235f24ec59bd4394fbe75ea958172
https://www.solprompt.io/detail?id=5eb0f1a01b14363fffa17d4fdbcb443207fa0f74ef0bfa2c2f45f651e1cfd974
https://www.solprompt.io/detail?id=14ea6fae962f7dbb124b9f86bfe7069eefa9409559fdb94a58e404e885972b67
https://www.solprompt.io/detail?id=c2a8b46816de1be629222b13cfc7cc967456fef84312892a58e68fc8339e3c59
https://www.solprompt.io/detail?id=f6eaf0aec654e51c6420b8f9d3b5cd55d30dcf2e20eac9d3b57412c9be614c0a
https://www.solprompt.io/detail?id=29d33a4858ceebf6f4ec6c8169f0be1b578972ee3c5914fdff587f1cde947e5c
https://www.solprompt.io/detail?id=350d2b284c7e96c732462256054bb298ccb11f7e04d607e409d261bac439a7f6
https://www.solprompt.io/detail?id=1374efdb32c557299cd5c55b9a72ce73e7a76fce6d20edb5f7eef1f0d23ca970
https://www.solprompt.io/detail?id=f557538679d6841ba6a04a5af0147f097ec9314601c5a474ccdbbbeb48738b8f
https://www.solprompt.io/detail?id=e100ca7059184e5c25d5f8401df25482ddf17e9c941e255eb8045c0088318faa
https://www.solprompt.io/detail?id=49ae966583892b31e21cf9ac6cc070acea7bc0efa2d1831e9ea75f27ca5b285f
https://www.solprompt.io/detail?id=1ea4105065296e571d9490ad47bb9cae175c1ace2d4d33daa552aa8b791b1804
https://www.solprompt.io/detail?id=8221aaccb9e973cf1705a78cb5112611a84d139e134add99bf1cb6b4a94567c5
https://www.solprompt.io/detail?id=e5f7ddae0c690c739ac449c096abbae701bfc731e33bf1106ede796895d033c9
https://www.solprompt.io/detail?id=8795f235d28d462304ec3e070be243734296a5200943ee79d59e9abfda09cb04
https://www.solprompt.io/detail?id=2b9c5ae16bcfe8f00c93d6ba8c6bee094eb0191e1458e3a705cfced6ec7108c7
https://www.solprompt.io/detail?id=5d70c8be165a8a754c5bb484ff57f531f2f9e63f4b52c2c38f4efc540083ac5d
https://www.solprompt.io/detail?id=febfef3ca418a0f18b7d9690a9a89934a1269898be92af0fc556945284f54b46
https://www.solprompt.io/detail?id=77025f4d301c04dd039d55651dd42be41a7a47342d2bda2218c352f8c80751af
https://www.solprompt.io/detail?id=06fed51af53d5a2b108cca217ffb8ccf54d9e756a58b700ce9c596fd530feae0
https://www.solprompt.io/detail?id=41bd6b3e9780c940a6d5030f00bcd7236b0c3526e2e8291d3c48ca5e0798a58c
https://www.solprompt.io/detail?id=b2ec752039c5bbd43dbe796df828e54add7701e75d83684b42bbe1c700d58968
https://www.solprompt.io/detail?id=d215d43e93741aa04bc1f45a931d16629dda5095f2f02f5b80053ba265622fe7
https://www.solprompt.io/detail?id=775943a8547486c4430777c848bbb5d72cca5c15405ef23a88796c1e72197366
https://www.solprompt.io/detail?id=ad2d00eac5a0354a05697988f2a5230aebfe49533629caf9d899f1832981980b
https://www.solprompt.io/detail?id=caadbad0e8026b6314ab413a5a2512aca910cd22175d98f956ce55ac24655009
https://www.solprompt.io/detail?id=77da9125129fb893d384689888f1fafb84be80d7cd92f2cb8d4ae08f6b1881c6
https://www.solprompt.io/detail?id=352b16719e1b90b20f6b872083f309bfd3132498a99cc4a2c40d6026a8a6dced
https://www.solprompt.io/detail?id=44a342e063eccf3e161e48b67d7d0ac3ac30a01035ff3d3a3b5faeec8c1ae829
https://www.solprompt.io/detail?id=a67618ac03e1ed5b25d70edc5240f9ab8474130d16d614b724d17b3a8e5f0556
https://www.solprompt.io/detail?id=9a415bd4de8ab30946b4c54e7427e663231050ab2931a4c7e68a6d8390436098
https://www.solprompt.io/detail?id=67015d4486512c557977b86fe709d774dfdc8212e51412c425e784d3a9ceedb1
https://www.solprompt.io/detail?id=2495f3d048d57dd4415fa2c5b8550096948855c5d81f3293402cb3a9b94c65b8
https://www.solprompt.io/detail?id=3b6c96f467d8006ebf8a125e07a41b4b784e22c4e5349f5e9b43cdaa89ae0e83
https://www.solprompt.io/detail?id=dd2fe5467006cae96d0966e60a9e5ca9c70b0f37c7cce66a51aebe633385885d
https://www.solprompt.io/detail?id=3920b7405e299e05e92f07c8152227f5da7532c524817ce9a0eb971dd60401c2
https://www.solprompt.io/detail?id=11f00d229233e71e21ed961185231051559ae155d65ba13e4122d329f9c77b39
https://www.solprompt.io/detail?id=c0e6d1ee6c38f37382e387cd431074054931c2fdf1784d83f59fbf3fb059fa57
https://www.solprompt.io/detail?id=971628c465e1cb09f9e020532088fb98f705434f4405989b730fb01d261a6123
https://www.solprompt.io/detail?id=1ae5bc5a7ff4a49a10e6cbd3e5f40e38c9db19a13be7c6ec75c120360c94b119
https://www.solprompt.io/detail?id=6dc4acd988c4227073046e09ff9839bf9b87e2bbe455366d05fe6e9b7b3aeb78
https://www.solprompt.io/detail?id=74e3fd6a81c614165f0b737a7ca34cf5b0a307972a3387ed7809faf78b1bf4b9
https://www.solprompt.io/detail?id=2b346b767a61375281d60bb802549f53586abd9f9583a2feee4b68d42c918320
https://www.solprompt.io/detail?id=788e68942b8112d70909bffbeb6b295228f8ad91674f78b91c9bdc8d5c37a068
https://www.solprompt.io/detail?id=9b8d4d60938508e2ec2ede88e4f1b649c2b2bd5ea1e148d91e445c4a14632f22
https://www.solprompt.io/detail?id=61029c1f8815b4a3aa6ce6aab72bf86b8e422f21358965fcc06be4e877b49192
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
