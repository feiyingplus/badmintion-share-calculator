/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 启用静态 HTML 导出
  output: 'export',
  
  // GitHub Pages 需要 basePath，Netlify 不需要
  basePath: process.env.GITHUB_PAGES === 'true' ? '/badmintion-share-calculator' : '',
  
  // 同样，GitHub Pages 需要 assetPrefix，Netlify 不需要
  assetPrefix: process.env.GITHUB_PAGES === 'true' ? '/badmintion-share-calculator' : '',
}

export default nextConfig
