/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["media.discordapp.net", "api.solprompt.io", "solprompt.io", "localhost", "www.solprompt.io"],
  },
};

module.exports = nextConfig;
