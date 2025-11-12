const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: [
    ...config.resolver.assetExts.filter((ext) => ext !== 'svg'),
    'glb', // Add GLB support for 3D models
    'gltf', // Add GLTF support
    'bin', // Add binary GLTF support
    'html', // Add HTML for WebView globe viewer
    'data', // Add DATA for bundled Three.js library (as text asset)
  ],
  sourceExts: [...config.resolver.sourceExts, 'svg'],
};

module.exports = config;
