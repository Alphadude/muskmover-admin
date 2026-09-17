/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const backendUrl = (process.env.BACKEND_API_URL || 'https://api.muskmover.ng')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/api-docs\/?$/, '')
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
