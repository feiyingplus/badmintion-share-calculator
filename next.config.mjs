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
  
  // 如果你的仓库不是在根目录托管，需要添加 basePath
  // 例如：如果你的仓库名是 'badmintion-share-calculator'
  basePath: process.env.NODE_ENV === 'production' ? '/badmintion-share-calculator' : '',
  
  // 同样，如果不是根目录托管，需要设置 assetPrefix
  assetPrefix: process.env.NODE_ENV === 'production' ? '/badmintion-share-calculator' : '',
}

export default nextConfig
