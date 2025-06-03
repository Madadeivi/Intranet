/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app'], // Solo revisar app/
  },
  // Excluir explícitamente el directorio client
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/client/**', '**/node_modules/**'],
    };
    return config;
  },
};

module.exports = nextConfig;