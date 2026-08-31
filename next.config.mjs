/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '25mb' } // headroom for material uploads
  }
};

export default nextConfig;
