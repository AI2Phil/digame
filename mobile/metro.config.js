const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Reduce the number of files being watched
config.watchFolders = [];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ignore more directories to reduce file watching
config.resolver.blockList = [
  /node_modules\/.*\/node_modules\/.*/,
  /.*\/__tests__\/.*/,
  /.*\/\.git\/.*/,
  /.*\/\.expo\/.*/,
  /.*\/build\/.*/,
  /.*\/dist\/.*/,
  /.*\/ios\/.*/,
  /.*\/android\/.*/,
];

// Limit the number of workers to reduce resource usage
config.maxWorkers = 2;

module.exports = config;