import { FC, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
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
} from "../../web3/util";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export const SellView: FC = ({}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction } = wallet;
  const { program } = useProgram();
  const { provider } = useProvider();

  const [aiType, setAiType] = useState("mid_journey");
  const [submitClicked, setSubmitClicked] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);

  const handleAiChange = (e) => {
    setAiType(e.target.value);
  };

  const createListingAccount = useCallback(
    async (_aiType, _price) => {
      if (!publicKey) {
        notify({ type: "error", message: `Wallet not connected!` });
        console.log("error", `Send Transaction: Wallet not connected!`);
        return;
      }
      let sellerAccount = await getSellerAccount(program, provider, publicKey);

      const tx = new Transaction();
      if (!sellerAccount) {
        const createSellerItx = await createSellerAccountItx(
          program,
          provider,
          publicKey
        );

        tx.add(createSellerItx);
      }

      const { listingItx, listingPda } = await createListingItx(
        program,
        provider,
        sellerAccount,
        publicKey,
        _aiType,
        _price
      );
      tx.add(listingItx);

      const sig = await sendTx(program, provider, wallet, tx);

      return { sig, listingPda, owner: publicKey };
    },
    [publicKey, program, provider, wallet]
  );

  const handleSubmit = async (event) => {
    if (loading) return;

    setLoading(true);

    const aiType = (document.getElementById("ai_type") as HTMLInputElement)
      .value;

    let aiSettings = {
      aiType,
    } as any;

    if (aiType === "mid_journey") {
      aiSettings.mjSettings = (
        document.getElementById("mj_settings") as HTMLInputElement
      ).value;

      if (!aiSettings.mjSettings) {
        alert("Enabled Settings required");
        return setLoading(false);
      }
    } else {
      //otherwise stable diffusion
      aiSettings = {
        version: (document.getElementById("sd_version") as HTMLInputElement)
          .value,
        sampler: (document.getElementById("sd_sampler") as HTMLInputElement)
          .value,
        imageWidth: (document.getElementById("sd_width") as HTMLInputElement)
          .value,
        imageHeight: (document.getElementById("sd_height") as HTMLInputElement)
          .value,
        cfgScale: (document.getElementById("sd_cfg_scale") as HTMLInputElement)
          .value,
        steps: (document.getElementById("sd_steps") as HTMLInputElement).value,
        clipGuidance: (document.getElementById("sd_clip") as HTMLInputElement)
          .value,
        negativePrompt: (
          document.getElementById("sd_negative_prompt") as HTMLInputElement
        ).value,
        aiType,
      };

      if (aiSettings.version === "-- select an option --") {
        alert("Version required");
        return setLoading(false);
      }

      if (aiSettings.clipGuidance === "-- select an option --") {
        alert("Clip Guidance required");
        return setLoading(false);
      }

      if (aiSettings.sampler === "-- select an option --") {
        alert("sampler required");
        return setLoading(false);
      }

      if (aiSettings.imageWidth.trim() === "") {
        alert("image width required");
        return setLoading(false);
      }
      if (aiSettings.imageHeight.trim() === "") {
        alert("image height required");
        return setLoading(false);
      }
      if (aiSettings.cfgScale.trim() === "") {
        alert("CFG scale required");
        return setLoading(false);
      }
      if (aiSettings.steps.trim() === "") {
        alert("Steps required");
        return setLoading(false);
      }
    }

    if (images.length < 5 || images.length > 10) {
      alert("5 to 10 images required");
      return setLoading(false);
    }

    try {
      const { sig, listingPda, owner } = await createListingAccount(
        aiType,
        price
      );

      (document.getElementById("listing_pda") as HTMLInputElement).value = (
        listingPda as any
      ).toBase58();
      (document.getElementById("ai_settings") as HTMLInputElement).value =
        JSON.stringify(aiSettings);
      (document.getElementById("signature") as HTMLInputElement).value = sig;
      (document.getElementById("owner") as HTMLInputElement).value =
        owner.toBase58();

      (document.getElementById("myform") as any).submit();
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const handleChangeImage = (e) => {
    if (e.target.files.length < 5 || e.target.files.length > 10) {
      (document.getElementById("photos") as HTMLInputElement).value = "";
      alert("Please only use between 5 and 10 images");
    } else {
      setImages(Array.from(e.target.files));
    }
  };

  const handleChange = (evt) => {
    const { value } = evt.target;

    if (value.match(/\./g)) {
      const [, decimal] = value.split(".");

      if (decimal?.length > 1) {
        return;
      }
    }

    setPrice(value);
  };

  return (
    <div className="md:hero mx-auto p-4">
      <div className="pl-20 pr-20 w-full hero-content flex flex-col">
        <div className="mt-6">
          <h1 className="text-center text-5xl md:pl-12 font-bold text-white bg-clip-text mb-4">
            Sell Your Prompt
          </h1>
        </div>

        <div className="pt-10 max-w-xlg w-full bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <form
            id="myform"
            action={`${process.env.NEXT_PUBLIC_API_SERVER}/listing`}
            method="post"
            name="myform"
            encType="multipart/form-data"
          >
            <input type="hidden" name="listing_pda" id="listing_pda" />
            <input type="hidden" name="ai_settings" id="ai_settings" />
            <input type="hidden" name="signature" id="signature" />
            <input type="hidden" name="owner" id="owner" />
            <div className="mb-4">
              <label
                htmlFor="first_name"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="prompt_name"
                required
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="price"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Price
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">◎</span>
                </div>
                <input
                  type="number"
                  name="price"
                  step={0.01}
                  required
                  id="price"
                  value={price}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 pl-8 pr-20 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 bg-gray-50 "
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <select
                    name="currency"
                    id="currency"
                    className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-7 text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  >
                    <option>SOL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Description
              </label>
              <textarea
                name="description"
                required
                id="description"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              ></textarea>
            </div>
            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                htmlFor="photos"
              >
                Upload 5 to 10 Images
              </label>
              <input
                required
                className="p-2 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                type="file"
                multiple={true}
                accept="image/*"
                name="photos"
                id="photos"
                onChange={handleChangeImage}
              />
            </div>
            <div className="mb-4">
              <div className="flex" style={{ overflowX: "scroll" }}>
                {images.map((image, index) => (
                  <Image
                    className="mr-2"
                    key={`image-${index}-1`}
                    src={URL.createObjectURL(image)}
                    alt="img"
                    width={50}
                    height={50}
                  />
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="countries"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Prompt Type
              </label>
              <select
                onChange={(e) => handleAiChange(e)}
                required
                name="ai_type"
                id="ai_type"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="mid_journey">Mid Journey</option>
                <option value="stable_diffusion">Stable Diffusion</option>
              </select>
            </div>

            {aiType === "mid_journey" && (
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="username"
                >
                  Enabled Settings(comma seperated)
                </label>
                <textarea
                  required
                  name="mj_settings"
                  id="mj_settings"
                  rows={4}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                ></textarea>
              </div>
            )}
            {aiType === "stable_diffusion" && (
              <>
                <div className="mb-4">
                  <label
                    htmlFor="version"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Version
                  </label>
                  <select
                    required
                    name="sd_version"
                    id="sd_version"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option disabled selected>
                      {" "}
                      -- select an option --{" "}
                    </option>
                    <option value="v1.4">Stable Diffusion v1.4</option>
                    <option value="v1.5">Stable Diffusion v1.5</option>
                    <option value="v2.0-768">Stable Diffusion v2.0-768</option>
                    <option value="v2.1">Stable Diffusion v2.1</option>
                    <option value="v2.1">Stable Diffusion v2.1-768</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="version"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Sampler
                  </label>
                  <select
                    required
                    name="sd_sampler"
                    id="sd_sampler"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  >
                    <option disabled selected>
                      {" "}
                      -- select an option --{" "}
                    </option>
                    <option value="ddim">ddim</option>
                    <option value="plms">plms</option>
                    <option value="k_euler">k euler</option>
                    <option value="k_euler_ancestral">k euler ancestral</option>
                    <option value="k_heun">k heun</option>
                    <option value="k_dpm_2">k dpm 2</option>
                    <option value="k_dpm_2_ancestral">k dpm 2 ancestral</option>
                    <option value="k_lms">k lms</option>
                    <option value="k_dpmpp_2m">k dpmpp 2m</option>
                    <option value="k_dpmpp_2s_ancestral">
                      k dpmpp 2s ancestral
                    </option>
                  </select>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label
                      htmlFor="version"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Image Width
                    </label>
                    <input
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      id="sd_width"
                      type="number"
                      name="sd_width"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/2 px-3">
                    <label
                      htmlFor="version"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Image Height
                    </label>
                    <input
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      id="sd_height"
                      type="number"
                      name="sd_height"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                    <label
                      htmlFor="version"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Cfg Scale
                    </label>
                    <input
                      required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      id="sd_cfg_scale"
                      type="number"
                      name="sd_cfg_scale"
                    />
                  </div>
                  <div className="w-full md:w-1/3 px-3">
                    <label
                      htmlFor="version"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Steps
                    </label>
                    <input
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      id="sd_steps"
                      type="number"
                      name="sd_steps"
                      required
                    />
                  </div>
                  <div className="w-full md:w-1/3 px-3">
                    <label
                      htmlFor="version"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      CLIP Guidance
                    </label>
                    <select
                      required
                      name="sd_clip"
                      id="sd_clip"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option disabled selected>
                        {" "}
                        -- select an option --{" "}
                      </option>
                      <option value="v2.1">Enabled</option>
                      <option value="v2.1">Disabled</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="first_name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Negative Prompt
                  </label>
                  <input
                    name="sd_negative_prompt"
                    type="text"
                    required
                    id="sd_negative_prompt"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  />
                </div>
              </>
            )}

            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Prompt
              </label>
              <textarea
                name="prompt"
                required
                id="description"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              ></textarea>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="username"
              >
                Instructions
              </label>
              <textarea
                required
                name="instructions"
                id="description"
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              ></textarea>
            </div>
          </form>
          {publicKey && (
            <button
              id="submit_btn"
              onClick={handleSubmit}
              className="text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
              disabled={loading}
            >
              {loading ? "Loading" : "Create Listing"}
            </button>
          )}
          {!publicKey && (
            <div className="mt-10">
              <WalletMultiButtonDynamic className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
