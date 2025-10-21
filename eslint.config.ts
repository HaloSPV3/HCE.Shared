import markdown from '@eslint/markdown';
import jsdoc from 'eslint-plugin-jsdoc';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig, type Config } from 'eslint/config';
import hceSharedConfig from './src/eslintConfig.ts';

const config: Config[] = defineConfig(
  ...hceSharedConfig,
  ...jsdoc.configs['flat/recommended-mixed'],
  {
    ...markdown.configs.recommended[0],
    name: 'Markdown GFM',
    language: 'markdown/gfm',
  },
  {
    ...unicorn.configs.recommended,
    name: 'Unicorn preferences - Disable some rules, change some to Warn',
    rules: {
      ...unicorn.configs.recommended.rules,
      // we use PascalCase for dotnet-related and class-only files and camelCase for traditional JavaScript files
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/import-style': 'warn',
      'unicorn/switch-case-braces': 'warn',
      'unicorn/catch-error-name': 'warn',
      'unicorn/prefer-node-protocol': 'warn',
      // more often than not, in-place sorting is preferable over `toSorted` cloned sort.
      'unicorn/no-array-sort': 'off',
    },
    files: [
      '**/*.cjs',
      '**/*.cts',
      '**/*.js',
      '**/*.jsx',
      '**/*.mjs',
      '**/*.mts',
      '**/*.ts',
      '**/*.tsx',
    ],
  },
  {
    name: 'stylistic excludes',
    files: ['**/*.md'],
    rules: {
      '@stylistic/indent': 'off',
    },
  },
  { ignores: ['.yarn/sdks/**', '.pnp.cjs', '.pnp.loader.mjs'] },

);

export default config;
