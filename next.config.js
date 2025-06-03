/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'api'], // Solo revisar app/ y api/, ignorar client/
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