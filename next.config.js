/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // html5-qrcode reads from the camera on the client only — never bundle
  // its Node-oriented internals into the server build.
  experimental: {
    serverComponentsExternalPackages: ['exceljs'],
  },
};

module.exports = nextConfig;
