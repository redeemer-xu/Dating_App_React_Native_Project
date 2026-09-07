const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Required for Firebase JS SDK v10+ to resolve correctly under Metro
config.resolver.unstable_enablePackageExports = false;

module.exports = config;