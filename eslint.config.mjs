import md from '@eslint/markdown';
import unicorn from 'eslint-plugin-unicorn';
import 'tsx';
import { config } from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';

/**
 * @typedef { import('eslint').Linter.Config} ESLintConfig
 * @typedef {[{
 *  name: "markdown/recommended";
 *  files: ["**\/*.md"];
 *  language: "markdown/commonmark";
 *    plugins: {"@eslint/markdown": typeof import('@eslint/markdown').default};
 *    rules: {
 *      readonly "markdown/fenced-code-language": "error";
 *      readonly "markdown/heading-increment": "error";
 *      readonly "markdown/no-empty-links": "error";
 *      readonly "markdown/no-invalid-label-refs": "error";
 *      readonly "markdown/no-missing-label-refs": "error";
 *    };
 * }]}  markdownRecommended
 * @type {markdownRecommended[0]}
 */
const mdRecommended = /** @type {markdownRecommended[0]} */ (md.configs.recommended[0]);
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
