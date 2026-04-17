const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = config;

// Aseguramos que Metro pueda encontrar tanto archivos de código como assets de imagen y .wasm
config.resolver.sourceExts = [...sourceExts, 'mjs'];
config.resolver.assetExts = [...assetExts, 'wasm'];

module.exports = config;
