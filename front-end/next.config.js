/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["shdw-drive.genesysgo.net", "media.discordapp.net", "api.solprompt.io", "solprompt.io", "localhost", "www.solprompt.io"],
  },
};

module.exports = nextConfig;
