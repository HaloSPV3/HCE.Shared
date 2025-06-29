import md from '@eslint/markdown';
import unicorn from 'eslint-plugin-unicorn';
import 'tsx';
import { config } from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import { type } from 'arktype';

const type_mdRecommended = type([{
  name: '\'markdown/recommended\'',
  files: type(['"**/*.md"']),
  language: '\'markdown/commonmark\'',
  plugins: type({ '@eslint/markdown': 'unknown' }),
  rules: type({
    'markdown/fenced-code-language': '\'error\'',
    'markdown/heading-increment': '\'error\'',
    'markdown/no-empty-links': '\'error\'',
    'markdown/no-invalid-label-refs': '\'error\'',
    'markdown/no-missing-label-refs': '\'error\'',
  }).readonly(),
}]);

/**
 * @typedef { import('eslint').Linter.Config} ESLintConfig
 */
const mdRecommended = type_mdRecommended.assert(md.configs.recommended)[0];
const { default: hceSharedConfig } = await import('./src/eslintConfig.ts');
/** @type {ESLintConfig} */
const unicornRecommended = {
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

export default config(
  ...hceSharedConfig,
  jsdocRecommended_js,
  jsdocRecommended_ts,
  {
    ...mdRecommended,
    plugins: { markdown: md },
    language: 'markdown/gfm',
  },
  unicornRecommended,
  {
    name: 'stylistic excludes',
    files: ['**/*.md'],
    rules: {
      '@stylistic/indent': 'off',
    },
  },
);
