const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Fonts
  "ttf",
  "otf",
  "woff",
  "woff2",
  // Images
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg"
);

// Enable source maps for better debugging
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Ensure proper module resolution
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;
