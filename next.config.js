/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 启用standalone输出模式，用于Docker部署
  output: 'standalone',
  // 生产环境配置
  compress: true,
  // 关闭开发环境的source map（生产环境）
  productionBrowserSourceMaps: false,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig

