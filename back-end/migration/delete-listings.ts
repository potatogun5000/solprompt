import sqlite3 from "sqlite3";
import { open } from "sqlite";
import * as b58 from "b58";

const urls = `https://www.solprompt.io/detail?id=0451c7121e8bab80588bf40b2598733b6b3138e8873d63e1e021ca5a6cb5238f
https://www.solprompt.io/detail?id=b3e2fa2e216e0f402008cf857eb3e98c19a45da3263fad5e5ecf84d8133b990b
https://www.solprompt.io/detail?id=d5c8ff220a7e8897b9dedf9afcf51c02684eecc231eb0efffc3d2a7a648d6d68
https://www.solprompt.io/detail?id=e22ef6694573a49e05ea841482ff4a8b5b517dc257e0bcbdd56225d297c45589
https://www.solprompt.io/detail?id=37a5b103445d51799f176494ac522cfdf11f07ac6ebf2e3d9e42a92a337907fe
https://www.solprompt.io/detail?id=64f7f57a47ac65f6f61b0b97d6d92bca4dc36b6f359cbfa9cabb4000ee60bb80
https://www.solprompt.io/detail?id=a39e22f769bf498d19cc2f07bec3f7623e80f8d027ca669b94fb9f1b545f7752
https://www.solprompt.io/detail?id=331177d378fa2cf6ac10a391f66a2d7b5969342926b84a5a339152a5274188f3
https://www.solprompt.io/detail?id=db0b98346ea1bf4654cc9dff521f9a5c1863cd626f11ae65cf796d1b5671dca7
https://www.solprompt.io/detail?id=0020af654ee0c48123a9a510941bb0ea0df132cee734b09cf13fea876f7f69bc
https://www.solprompt.io/detail?id=95ac8a7ac7f6822a198ee72e06c072d82eb66a77896876a342e3e1f29fbf2eef
https://www.solprompt.io/detail?id=336d2164694d3e1940c5805bdb4fd2c3ee52facfadbf1f057a6a0f097e3bfb92
https://www.solprompt.io/detail?id=13465707a8c3002ccf24f3d3fa4892d227c5284d1e3548b5220eb4118b6e4c1a
https://www.solprompt.io/detail?id=7811a20b1a5e0775b03e24e55a74375ed407e7a8cc50d4ac9b248f11afa16344
https://www.solprompt.io/detail?id=22103334c09ddb777b912416a5b76a550c01ec83d8e53a14502ce250e018d14c
https://www.solprompt.io/detail?id=ed8b3f801db9d489dd541d0d4475c50e2f2d95824b9152dc68c9356793eb3679
https://www.solprompt.io/detail?id=fb86c29fcc91587245c8e072d0a300c4d8f9db2528b8bdd3cb0621bd237b6a60
https://www.solprompt.io/detail?id=11c4aa9b0444fb1db4edd8e04d6e7f7e8b9453c6fe791612278405b61c5c1a82
https://www.solprompt.io/detail?id=2f52f78ebe4166d1ff23a5da95ec57597e7ab4adfaffdcc803ea7c0c0e6de21d
https://www.solprompt.io/detail?id=aa187ae7322275f228fd86847f3493c8c38b84f89faed9f50f73164cf229b116
https://www.solprompt.io/detail?id=709195311b52f3308b7247d0f436659c03add0204a1fde43000c924e88e3e574
https://www.solprompt.io/detail?id=05d22bd42101eba964aa516f94657e9a053cf587731a9a56d3c9f810e10f579e
https://www.solprompt.io/detail?id=3d34fc2334c7e0e1fb0f50a80a3219ea1d0ab8dc8354efa6fb510f08a66b868b
https://www.solprompt.io/detail?id=1b8752e4f78a3c006ab702ff96ec620f2837fc81882b06926f68c86334ebbaca
https://www.solprompt.io/detail?id=c72a2d301b191345e0256768a64ac3ad86bbfa1d5404ccdc966a5d7c6920d163
https://www.solprompt.io/detail?id=4c1889026204e009dd51bc7074653f8cf9938f0ccd05d2e40cfcf45be65a464d
https://www.solprompt.io/detail?id=fa2f6ac8d6a21b136ec783722a55db2a6f8e489d2470ebe5fbc83a0079a14b60
https://www.solprompt.io/detail?id=0a2059603f16303132b78285467782a9fc8125a3f874df334a1803970b43d926
https://www.solprompt.io/detail?id=1b8752e4f78a3c006ab702ff96ec620f2837fc81882b06926f68c86334ebbaca
https://www.solprompt.io/detail?id=f0018f582a08c671c4e851435221130dc560918befc7984c537bc89e5e9de323
https://www.solprompt.io/detail?id=d2346d7bad4bf4942cc2f6c69b10d267ab0f2952b84dd89611157b895d653faa
https://www.solprompt.io/detail?id=41fad6ce5c328c68aef20efc07a7e213d957ab66b68a31ea7e6cc3f52c473094
https://www.solprompt.io/detail?id=41bcb170be508d8631cd7a43ba69cdfb39cfd69d9950cd82cde0eefcf1e5baf7
https://www.solprompt.io/detail?id=569480b70d9a97884adefe60a320da5316b6fabe665f6943a4dd3fb1e958efe2
https://www.solprompt.io/detail?id=aea4c61cdd8093dcd671e007c5485d3c7d0068a15ce1c7583666739e9fcc4796
https://www.solprompt.io/detail?id=274c221e0dd74c6ab237005150482239ae972af9d1e68609049b99e5f4ce01e9
https://www.solprompt.io/detail?id=f0dbef92bbaac7d4085da04ae21a355178370923402af86349d09b5c0106497f
https://www.solprompt.io/detail?id=31f900b6b8a01b17ff4218dc3d687fef63d0e12a6c2c369383f0dd6f56b26a31
https://www.solprompt.io/detail?id=464d8c5b902a7edcba5c3ff89427c67f449c55aab52c763253b860ab7774db02
https://www.solprompt.io/detail?id=6145fe9a4792f4ce1d03a84955ec81f2247caef8de36796594422479ada4ba62
https://www.solprompt.io/detail?id=8c1740a66162211669b727caf4df5ca006aa62c04bea7e8f39de906dff661035
https://www.solprompt.io/detail?id=2f52f78ebe4166d1ff23a5da95ec57597e7ab4adfaffdcc803ea7c0c0e6de21d
https://www.solprompt.io/detail?id=061a0e7e190e28dbc019594e3cfb162f192eb0a3bc209a2ab2994726b0bb79a5
https://www.solprompt.io/detail?id=4c99dc8a9e31837e666f881a13121394fb978f09ecc733892e758eaaeb20ccbc
https://www.solprompt.io/detail?id=dd689bc746cedef26481654a52bca265fd00bd515094d44a9e2d65f458896c03
https://www.solprompt.io/detail?id=c6547f11f69ac54e459a08e9f124bf7e3473b3e1324ac43d3d624f649f4292bc
https://www.solprompt.io/detail?id=086e164645ac735cb2e82d630fca8d44dca2cebcac18d59a6af1c7c2833278e1
https://www.solprompt.io/detail?id=91be06f598b59f3af8b17f786e97918afd157b455321c4987c4524843670e79e
https://www.solprompt.io/detail?id=5bf9d7e576ef49e303d478fe9dab708aa7880cf79ad27dea1c2d49a78e4a060b
https://www.solprompt.io/detail?id=9a77028fae99ae42f64a6afa232cdb260454c969f3c35dada91d95413a71458e
https://www.solprompt.io/detail?id=99f7071cbf72a006d248718949004b47d0b82210c6d3a6f8adb1c559ed87f6a3
https://www.solprompt.io/detail?id=849aa8a5f580ef1af3efb16a3bd74598385cfbe775235d2ec0227a79d54b4aeb
https://www.solprompt.io/detail?id=6da6f64fbeea125712accc780153f1dddfeeb2b027b30d2ba73f3b42161d791b
https://www.solprompt.io/detail?id=2fd747277c15d0f6e6ab419f89935479c2b4a3b682724d47547f30084c63a77e
https://www.solprompt.io/detail?id=d8396086d8dcd24f541a1caf4af2529ad150d92ae8e3c03361f2591ae0328390
https://www.solprompt.io/detail?id=8f4fa8efc728d02193855370b2b9343661cd0dd605e4b47d50104a149ccc763a
https://www.solprompt.io/detail?id=b8adc9fad8afff150eb9100e6b8060f3aee8f4b260fb4bbadc6b26bccd14d3cf
https://www.solprompt.io/detail?id=ef195117e17c9a928a8d514428586a12fe38737e984a1d0f0b66e8e1cc24ad36
https://www.solprompt.io/detail?id=01d34f86aeee29de1b9584e179df116c51ef392e69aafeb2af121c908112ac4a
https://www.solprompt.io/detail?id=28665da2dd3b8737f7934eddcd274ed40d88ecee521f5ed9152355e1cf285503
https://www.solprompt.io/detail?id=a504831a8d8890b723e19a378c1b6ab2ff24579a7a516d621b84c9f5146eb082
https://www.solprompt.io/detail?id=9f89d4783473651afb0f4d25795535c9979ecf7db0583c28414c138fa95e3415
https://www.solprompt.io/detail?id=8e40f68b62215a145e0fa6985f022abbbd47d890addae97759682c9cdd64dff1
https://www.solprompt.io/detail?id=2fe90991ccaa7d3481b589892b9331b4b59d813b9bbffcde5a22d294efc4b8d9
https://www.solprompt.io/detail?id=a7cf0854c94c670300e93abf56081a4e66d1e65830d49b3ba8a324bba5323750
https://www.solprompt.io/detail?id=6761093e202f3939a3a7740e94f30ef9662ca2688eb01c001eebdb11cc2e724a
https://www.solprompt.io/detail?id=e4eacb2d19bbe8386727df77c99d59444e47cd2a70ca3c24e317172f94b3b50e
https://www.solprompt.io/detail?id=95d23ab2a4489363bc56e5804d22868314927bbfacf4efe3719e34c1414be832
https://www.solprompt.io/detail?id=76897d0be066bca15572553e7610877e2331e851889e5d52a6cfbd90f6f1ee36
https://www.solprompt.io/detail?id=76c03ae884f86f67a65168e5d05323defaf35ca92064141c087ba37528ca5f7a
https://www.solprompt.io/detail?id=c576b040ab4e32baa5ddc2e60e3bbbd185ec527a2ef5b2b2e70ca510cdf3dca6
https://www.solprompt.io/detail?id=d8c15e9f9cde231916c4089e8289da8c57842e9db73377cc944d53ecb07a2ad0
https://www.solprompt.io/detail?id=f27e193064c7b64fca191d1fc5337e0d87eeef279427e3c3381e66dd668bfb40
https://www.solprompt.io/detail?id=3789220f94a91ee75864322882779607b333c45f272ce6db47d29bd224e2225b
https://www.solprompt.io/detail?id=6e798a0dc68b5cb409bdb458ddd96e0c5bec30eb2c1ee9c63dfd573407ca6286
https://www.solprompt.io/detail?id=2c63d39458d4c2e2f577617d1967e4444acfc80474b4207c7e5b6275c0686106
https://www.solprompt.io/detail?id=e8658b694dd618e6d9dd827dc815ac41d788764fed8e6b6acb0ff158dde4eacf
https://www.solprompt.io/detail?id=83ed663a283242db44652e836e290884abff93b6d8acadb200900bb3a4928a9d
https://www.solprompt.io/detail?id=cd606fa9a9933010057e919dc20574ecc6c09890ef14cd546ab41cacc2aeb9ca
https://www.solprompt.io/detail?id=817faaf7232815669c2a35350629a6cc8816053b8e83d61aaa549b107f909234
https://www.solprompt.io/detail?id=68ccc0f88e11871b17e83654565f4ba1221dfb26f02a19eb2b53810fcef65672
https://www.solprompt.io/detail?id=e23397c3861d1f92cff66c4586733a8ef6b7267be411424aefa0528ddb3b8276
https://www.solprompt.io/detail?id=68ccc0f88e11871b17e83654565f4ba1221dfb26f02a19eb2b53810fcef65672
https://www.solprompt.io/detail?id=1b601f41a98354f133a202ca2eda7efe8e0983575d59a8871c927d6c4b095ac8
https://www.solprompt.io/detail?id=31df5e6b7ae96bf8156cc0bc5b6a879a0f73b98501416c7b70ab24d73864221b
https://www.solprompt.io/detail?id=0dc4031ead3c997861caee32ac65601e8a3f2dc2757944d4230d836a0082e7a2
https://www.solprompt.io/detail?id=f8d971c56663de1db22680be93981c50c80171817586b8b0f88278f129c87c18
https://www.solprompt.io/detail?id=16a566b66398ee5eef23b3f73843d276dee2eb842bea009e66704275437eef66
https://www.solprompt.io/detail?id=a524ded193865777b846786647a39cf40d1591986c8415e87b3bd424bbafa564
https://www.solprompt.io/detail?id=f3c3cedc89fbadfafb857d03ca73bf4eb02ccdc25070de65a5d6698aaafb00ee
https://www.solprompt.io/detail?id=f43a02ce496a90a4805e4055640e1afde31f09b4b50d11631a7f116781b31058
https://www.solprompt.io/detail?id=a2b4ebbc67bde6036d6eda51196ebacce3c442b9daab8dc15dd6fb3a5129dc9e
https://www.solprompt.io/detail?id=4687231a2c30682f5c4cb61e0ba469757b57b178fb366092256d412ecce95a35
https://www.solprompt.io/detail?id=ac58b2cc1c81480bbff31b92a18cfc3618e29ba5c538753db6c29b703c4b6f26
https://www.solprompt.io/detail?id=47227bb8b6f0ee5fae0eaa18ddbfae73d0db05d2d445fa64a680e010b9a75bf3
https://www.solprompt.io/detail?id=de1eb4df9eec5e26c461aedbe014ae3dfb3081c57dd7eeaa2de21782235a2c8e
https://www.solprompt.io/detail?id=06e777a8caa86fb8e5ce52e8ea96ad87ade42ff3d6bd4e93070ac6beace11769
https://www.solprompt.io/detail?id=fce464cd215359f698996cac7806b8240b6f222048450657edb64f76888a15c8
https://www.solprompt.io/detail?id=6f07023b0025fc8e04075fb26caa65c2d4e0d9e02415a4fbbbf7812459f611bf
https://www.solprompt.io/detail?id=6a8d828e3c3333a78b9c351972a67c81d4974c5b3817596b5f70c57a06abed3a
https://www.solprompt.io/detail?id=de485121b1df300026c95402b81a75b442e0a30fe927ba28da6959cfa7b0c535
https://www.solprompt.io/detail?id=b8a3a799baaab3d7284ccd01b4e69c81ac00af9940c7840f1292b1300ea6f788
https://www.solprompt.io/detail?id=8b3fa036c9901b60b6c196ab985f07458ccfa67f8ad79345004bd39b69f6e7b1
https://www.solprompt.io/detail?id=22019722b5edccf25e8f6b11661cf158755fc1c22bd6cc4643e272908ec33da4
https://www.solprompt.io/detail?id=c096b56517b25bb5a8613b36a3ca95b1c3be7bd5611e016d786a8815ea43b3d7
https://www.solprompt.io/detail?id=b5d03a38732648195742f5d206083827aa4fe0960163c1bc34cd7c68ee598287
https://www.solprompt.io/detail?id=789ce68015f4267d944c1ef2fdb8a2e5d7bd026418f1e39d6f7ec866d0179547
https://www.solprompt.io/detail?id=c52648a9c97bd7dfe2c7e93b739228f9ee7362f328276fae1f41d77af837cbcd
https://www.solprompt.io/detail?id=fe7c01e39ce09f838ead4e0795ec2be03182d0bf18fce3dcc2d25896d4ea4e89
https://www.solprompt.io/detail?id=648cb94eb47f9d6f4c95c26dae91f6ff7a1a2a9685c2878fe8e6db66982b2d51
https://www.solprompt.io/detail?id=92d934f75d99d844ce6ee8b96619b4c8e8298480bb6a7171f757a92b657d3922
https://www.solprompt.io/detail?id=211ca66558ed1187305f6bf0b30184424e314437c656341837f2e7650a670011
https://www.solprompt.io/detail?id=37b87ccd84c474e051058ea59e3dcb938255d1c98e68898af0c52102f630aa13
https://www.solprompt.io/detail?id=87a7eed5d1af1aa99828d78c5c9850217d9010d9e5fc23f515bbc956aba149fe
https://www.solprompt.io/detail?id=fde090ee0dc9575a823b734587217819a348e78d6a2090542166c433d050afe5
https://www.solprompt.io/detail?id=d2cbd6dbf585434a006156a897c35463685677a232cce422635b3ecb9420f8b1
https://www.solprompt.io/detail?id=ee449fbe78cd19896d8338237e67b86899147732f94380594c8c02edff378160
https://www.solprompt.io/detail?id=0bebbcdf9b15bfda6b8056bd68272dd3cae53bbed85cf613316c162d26b9e764
https://www.solprompt.io/detail?id=322a9baf4bda9c7ac6f8e5ac4665fa963be8776dd6a83397c1214745c05ec68a
https://www.solprompt.io/detail?id=3f58441871dfe9668cc3a8810a88572ef160a43dc8cfd9d10b25eadc06b0ce12
https://www.solprompt.io/detail?id=a15bdfb5929c01b4b55fb414d8003a02e783b006bc60585db98de9f11a6a0996
https://www.solprompt.io/detail?id=ed727c1d6fbc56e1e981b5b6a27cc3b10a5165cd7f6d759a7db1940b4b70fe36
https://www.solprompt.io/detail?id=118cea3c3de9e7d28f0fd23eb920796d89fd086e042df47143ac0abb0b4590d5
https://www.solprompt.io/detail?id=ad61f5bd6ef44563888c3fafa40cc535702da7d8acc94316c8a24b01e8ff6289
https://www.solprompt.io/detail?id=2dd9c207720548d4795137ad6a3608f339f8437b2b3d7cdfd30d990f9c3682ea
https://www.solprompt.io/detail?id=a24f8b9ea7229eaeb483f4e33eb561c3802d1e2768e64fe7c18c658afea8a972
https://www.solprompt.io/detail?id=adb4f9eb0ad6f04c36af2e20c0aeeefe9463f18f8d5e2de561d304eb6cf5c9a8
https://www.solprompt.io/detail?id=e7cbde6be7798d9067a3513865e2afdbb7b7dfde9636bcb6087fac459331fde7
https://www.solprompt.io/detail?id=b235b30aa729633ca5c5621e63c3e122c6244e0661a0a5c64971d6c14ebb8be8
https://www.solprompt.io/detail?id=d2aa968120057182288c6f15594114e9f0add9585d277234239cc9b9b2ed15c1
https://www.solprompt.io/detail?id=60a0d15324a6712558a18af22a834cb239a05cd734e59406f0b8845d0b7b956b
https://www.solprompt.io/detail?id=9dc4de454426693b8abd2b3b6412ee4550cf2f00aac5dca7a718ce92b476a98a
https://www.solprompt.io/detail?id=4e50cc025b6f3011eab2e83badd0445dc4c7ab085cb9dd57370b06787b783445
https://www.solprompt.io/detail?id=a24f8b9ea7229eaeb483f4e33eb561c3802d1e2768e64fe7c18c658afea8a972
https://www.solprompt.io/detail?id=e58fd062527819c02610f4c7e91700b58af83df2331475eaf525a56903dcd1b7
https://www.solprompt.io/detail?id=4ef5875740fc55849fe3463464fd53b81e9a42ba2d4fbe0d05da86c2c6ce6d4f
https://www.solprompt.io/detail?id=dafbd63b8491e723099be22be6af0ef13d59509b4c822bc25bdd372013fbe37f
https://www.solprompt.io/detail?id=c8990ea5b78c8d848a4e5ecb2fe6b1b4fd34e9ca017041690a6afbd1f5da9830
https://www.solprompt.io/detail?id=5c1b3a8215445201f506d3c5476e37cf83af24b23a034b13f14f7f2be5e33851
https://www.solprompt.io/detail?id=1a1c576b4461f4ee3830405d80dc07fc4b212c75a30975474bff6ae2f992fc1a
https://www.solprompt.io/detail?id=f3a60ff24a0a57673979640516312e41da289bf8aa4f33e980e1e31648214b64
https://www.solprompt.io/detail?id=962de43f9e95b8356e1891a1544dc087360a25c43c3496c7faecf644cc464c9e
https://www.solprompt.io/detail?id=d8fb92881c4617908178ba6e8ddf6e0d9241090732730018f2921cfd2d8ad377
https://www.solprompt.io/detail?id=0777c17f535d30510fd24b75c6b757cfe4102e6b01f70719c16c3ccda6655699
https://www.solprompt.io/detail?id=5b6798a4327d2a7513d844ef5e2083ce810ba41b76c7d90b9d8a531bdb731d9c
https://www.solprompt.io/detail?id=9d6700024f0b6d50bc1009236ac52102d44da8dba0156b4c83643abedeca7fb9
https://www.solprompt.io/detail?id=b72206f48af533e465c718c8635a1082f37279904adda981a044af211b24ccb4
https://www.solprompt.io/detail?id=6c58732a27c6dc10cbf244a067c2bad39c3a9aa2022b9b1fa33bba011210b1aa
https://www.solprompt.io/detail?id=4e03da21a5bb173a200b126b28b496ace0306403d3d96bf01d02f233b06f615c
https://www.solprompt.io/detail?id=a7d29685f5d358080d26328c6435a1216a96c00049fea390a4ab382f496a3e28
https://www.solprompt.io/detail?id=5a139c03aed2627e82b2be97ae194c6110ddcd9789040814b63a9ced0ec1b51a
https://www.solprompt.io/detail?id=542fd8ff24e791e0463b01038e50649e7265067b645e0976c0d022c73d8b754d
https://www.solprompt.io/detail?id=123ede1f65a5992152b52eda9f19dde3d4eb390976b0703b99ad63ddce248a41
https://www.solprompt.io/detail?id=5e98d2fd7d3c8b8c5327c48e1ec05b054eff98ac2ebbdf44d9dd4968c8ef32f0
https://www.solprompt.io/detail?id=d5705ee36ac6226fd56953acf89eacaa7343b787ae7d38dd9f6c73d408a9f61a
https://www.solprompt.io/detail?id=c250e3d65ab88a43c4e1a80f67f83188f5e61c8859983f747876e4e6d501d4c5
https://www.solprompt.io/detail?id=363f85da97c406959fbda971c489dbf32956b0c054d34d3cf80ee10ad8d0030b
https://www.solprompt.io/detail?id=3b7712c8b90065374cf62937ff046bb687bbe6a294beba8b780c9403c77987a7
https://www.solprompt.io/detail?id=b72206f48af533e465c718c8635a1082f37279904adda981a044af211b24ccb4
https://www.solprompt.io/detail?id=c04ef61b28195ee7058b4d3620850188d187f8534e405556055cab3cc0fdefd5
https://www.solprompt.io/detail?id=9d6700024f0b6d50bc1009236ac52102d44da8dba0156b4c83643abedeca7fb9
https://www.solprompt.io/detail?id=2660a1d85efcee475cceb580faaf6bca9bce64a354131f4826f567976a65d971
https://www.solprompt.io/detail?id=28a9999c64237c0e0d66ef8e3228ac8cf4097f3944d44e0cc65d395aab0645e0
https://www.solprompt.io/detail?id=7fe214086943d0fcbb7d476ccf61729943269f44070cc47fbabe1d352758ffd4
https://www.solprompt.io/detail?id=28ae657e5aad5bff2666b28a3c9ce2e1efa67981a1397c74633346d46fd8ded8
https://www.solprompt.io/detail?id=07970fe6e09974369fb8d9055f816a2f7c73dcf0674879272ce3cac78aa2de8b
https://www.solprompt.io/detail?id=d9d155f4ec70aee83ce30bcd77e7778ab5f959588b8aacba8784b40673179f0e
https://www.solprompt.io/detail?id=6101adf69ccc9f19acaf301a7b93f2295479ba9958eca0b9d9bc1dca1ba08b60
https://www.solprompt.io/detail?id=6706ee1a550f98bfc85d01e0b1d3903410299a6002398541d20d07bcedfb094e
https://www.solprompt.io/detail?id=a0960de1bdaaba87bd39351ec3654e6c850d0551120a0fa3e1eac7ba0853be31
https://www.solprompt.io/detail?id=76bf17f1950b78e4e2738f82b208978e8080a33ef4a93f8ec01fe6ec7d55e455
https://www.solprompt.io/detail?id=8645c9fe9e3b7da52ec8d8f8d76d0c6b82718e97d146cd1442377ea4f4433abc
https://www.solprompt.io/detail?id=e343e900ea0e81a6da4e4b7bc33744d2aee940729218b12ca76adde410f58704
https://www.solprompt.io/detail?id=4c19eb7c0247871810ba0ad7732bf2818f9e961784fe6357fcf069e9821e2de3
https://www.solprompt.io/detail?id=2f64f541c629c5dde3b93ea6bd1d6ca5e4bddf047fa3678e4d490ef38cba38ef
https://www.solprompt.io/detail?id=2a2c78c41c8c9f9a670bce51370f7a2084a25a2d88c30e5535deff568065f383
https://www.solprompt.io/detail?id=4e7209e65df705a500671fc269da2943ae08097fad266e33ba0a2780d3f2b3b3
https://www.solprompt.io/detail?id=840b5092f9f1143487fddef9e828a350321172a4051e9803aabb9a03f8499fa2
https://www.solprompt.io/detail?id=0f3c323b30a69673aa08a4d5cce1c9f343f7170e9bdadabf9027f3a90be4d711
https://www.solprompt.io/detail?id=37c07fde7134d23ce2aa46633347f8a3cc3b6a2c6d9bd19082d2225b3784d464
https://www.solprompt.io/detail?id=69ec9be86155d4ecef5ded8aa4a9444967960d4dba1a2cdbc19a339d296f7e73
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
