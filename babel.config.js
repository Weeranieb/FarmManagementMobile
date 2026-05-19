module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    // Required by react-native-reanimated 4 / react-native-worklets so that
    // worklet bodies (useAnimatedScrollHandler, useAnimatedStyle, etc.) are
    // serialized for the UI runtime. Without it, the UI worklet throws on
    // first run and Hermes aborts the app (SIGABRT). Must be listed LAST.
    plugins: ['react-native-worklets/plugin'],
  };
};
