// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'docs/*'],
  },
  {
    rules: {
      // UI copy is verbatim from the spec and uses plain apostrophes.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
