/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['universal-payment-gateway', '@stripe/stripe-react-native', 'react-native-razorpay'],
  turbopack: {
    resolveAlias: {
      'react-native$': 'react-native-web',
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      'react-native$': 'react-native-web',
    }
    config.resolve.extensions = [
      '.web.ts',
      '.web.tsx',
      '.web.js',
      '.web.jsx',
      ...config.resolve.extensions,
    ]
    return config
  },
};

export default nextConfig;
