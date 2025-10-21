import js from '@eslint/js';
import _json from '@eslint/json';
import markdown from '@eslint/markdown';
import jsdoc from 'eslint-plugin-jsdoc';
import unicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import 'tsx';
import tseslint from 'typescript-eslint';
import type { Linter } from 'eslint';

const { default: hceSharedConfig } = await import('./src/eslintConfig.ts');

const json = 'default' in _json ? _json.default as typeof _json : _json;

const unicornRecommended: Linter.Config = {
  ...unicorn.configs.recommended,
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
};
const jsdocRecommended_js = {
  ...jsdoc.configs['flat/recommended'],
  files: [
    '**/*.cjs',
    '**/*.js',
    '**/*.jsx',
    '**/*.mjs',
  ],
};
const jsdocRecommended_ts = {
  ...jsdoc.configs['flat/recommended-typescript'],
  files: [
    '**/*.cts',
    '**/*.mts',
    '**/*.ts',
    '**/*.tsx',
  ],
};
const config: Linter.Config[] = defineConfig(
  { files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { js }, extends: ['js/recommended'], languageOptions: { globals: globals.node } },
  ...hceSharedConfig,
  tseslint.configs.recommended,
  unicornRecommended,
  jsdocRecommended_js,
  jsdocRecommended_ts,
  { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm', extends: [markdown.configs.recommended] },
  { name: 'stylistic excludes', files: ['**/*.md'], rules: { '@stylistic/indent': 'off' } },
  { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: [json.configs.recommended] },
  { files: ['**/*.jsonc'], plugins: { json }, language: 'json/jsonc', extends: [json.configs.recommended] },
  { files: ['**/*.json5'], plugins: { json }, language: 'json/json5', extends: [json.configs.recommended] },
  { ignores: ['.yarn/sdks/**', '.pnp.cjs', '.pnp.loader.mjs'] },
);

export default config;
