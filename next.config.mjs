/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['bcrypt'],
  images: {
    remotePatterns: [],
  },
  allowedDevOrigins: ['*.replit.dev', '*.worf.replit.dev', '127.0.0.1'],
};

export default nextConfig;
