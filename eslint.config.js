// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");

module.exports = defineConfig([
  expoConfig,
  // Surfaces components/hooks the React Compiler had to bail out of optimizing
  // (usually Rules-of-React violations). Keep the tree compiler-friendly.
  reactCompiler.configs.recommended,
  {
    // Non-blocking: a bail-out is a signal to make a component compiler-friendly,
    // not a build failure. Existing `eslint-disable` on React rules trip this.
    rules: {
      "react-compiler/react-compiler": "warn",
    },
  },
  {
    ignores: ["dist/*"],
  }
]);
