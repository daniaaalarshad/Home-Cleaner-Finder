/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['bcrypt'],
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
