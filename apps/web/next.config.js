/** @type {import('next').NextConfig} */
const nextConfig = {
  // transpilePackages not needed here — we rely on resolveExtensions to pick .web.* variants instead
  turbopack: {
    resolveAlias: {
      // Alias react-native core to react-native-web
      'react-native': 'react-native-web',
      // Alias the native stripe/razorpay SDK to a safe empty stub 
      // so turbopack doesn't try to parse Flow-typed RN internals
      '@stripe/stripe-react-native': './stub-empty.js',
      'react-native-razorpay': './stub-empty.js',
    },
    resolveExtensions: [
      // .web.* variants must come FIRST so Turbopack picks them over native files
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.json',
    ],
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
