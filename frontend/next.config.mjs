/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pg', '@auth/pg-adapter']
  }
};

export default nextConfig;
