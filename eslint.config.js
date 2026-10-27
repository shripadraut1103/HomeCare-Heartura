const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const checkFile = require('eslint-plugin-check-file');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/app/**'],
    plugins: { 'check-file': checkFile },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          'src/components/**/*.tsx': 'PASCAL_CASE',
          'src/domain/*/screens/*.tsx': 'PASCAL_CASE',
          'src/domain/*/components/*.tsx': 'PASCAL_CASE',
          'src/domain/*/interfaces/*.ts': 'PASCAL_CASE',
          'src/domain/*/store/*.ts': 'PASCAL_CASE',
          'src/domain/*/store/async-actions/*.ts': 'PASCAL_CASE',
          'src/domain/*/store/services/*.ts': 'PASCAL_CASE',
          'src/domain/*/store/actions/*.ts': 'CAMEL_CASE',
          'src/domain/*/schemas/*.ts': 'CAMEL_CASE',
          'src/**/hooks/*.ts': 'CAMEL_CASE',
          'src/utils/*.ts': 'CAMEL_CASE',
          'src/types/*.ts': 'PASCAL_CASE',
          'src/constants/*.ts': 'PASCAL_CASE',
          'src/config/*.ts': 'PASCAL_CASE',
          'src/store/*.ts': 'CAMEL_CASE',
          'src/store/{common-reducer,constants,interfaces}/*.ts': 'PASCAL_CASE',
        },
        { ignoreMiddleExtensions: true },
      ],
    },
  },
]);
