/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        hostname: "placehold.co",
        protocol: "https",
        port: "",
      },
      {
        hostname: "skazka-public.s3.eu-central-1.amazonaws.com",
        protocol: "https",
        port: "",
      },
    ],
  },
};

export default nextConfig;
