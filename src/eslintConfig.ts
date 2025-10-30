import eslint from '@eslint/js';
import { defineConfig, globalIgnores as setGlobalIgnores } from 'eslint/config';
import { type Linter } from 'eslint';
import stylistic, { type RuleOptions } from '@stylistic/eslint-plugin';
import json from '@eslint/json';
import globals from 'globals/globals.json' with { type: 'json' };
import tseslint from 'typescript-eslint';

// https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
// https://www.google.com/search?q=javascript+recurse+through+object+and+remove+undefined+properties

const globalIgnores: ReturnType<typeof setGlobalIgnores> = setGlobalIgnores([
  '_tsout/**/*',
  '_tsout/*',
  '_tsout/',
  'cjs/**/*',
  'cjs/*/*',
  'cjs/*',
  'mjs/**/*',
  'mjs/*',
  'mjs/',
  'node_modules/**/*',
  '**/node_modules/**/*',
  '**/*.tsbuildinfo',
  '**/bin/**/*',
  '**/obj/**/*',
  '.pnp.cjs',
  '.pnp.loader.mjs',
  '.yarn/sdks/**',
]);

const stylisticWarn: Linter.Config = stylistic.configs.customize({
  quoteProps: 'as-needed',
  semi: true,
  indent: 2,
  severity: 'warn',
});
stylisticWarn.rules ??= {};

stylisticWarn.rules['@stylistic/no-extra-parens'] = [
  'warn',
  'all',
  {
    allowParensAfterCommentPattern: '@type|@satisfies',
    nestedBinaryExpressions: false,
  },
] satisfies Linter.RuleEntry<RuleOptions['@stylistic/no-extra-parens']>;

stylisticWarn.rules['@stylistic/semi'] = [
  'warn',
  'always',
  {
    omitLastInOneLineBlock: false,
    omitLastInOneLineClassBody: false,
  },
] satisfies Linter.RuleEntry<RuleOptions['@stylistic/semi']>;

const config: ReturnType<typeof defineConfig> = defineConfig(
  { ...json.configs.recommended, name: 'JSON Recommended', files: ['**/*.json'], language: 'json/json' },
  { name: 'JSON - Allow empty keys in package-lock.json', files: ['**/package-lock.json'], rules: { 'json/no-empty-keys': 'off' } },
  { ...json.configs.recommended, name: 'JSONC Recommended', files: ['**/*.jsonc'], language: 'json/jsonc' },
  { ...json.configs.recommended, name: 'JSON5 Recommended', files: ['**/*.json5'], language: 'json/json5' },
  {
    name: 'TSJS',
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      stylisticWarn,
    ],
    files: [
      '**/*.ts',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      '**/*.jsx',
      '**/*.tsx',
    ],
    ignores: globalIgnores.ignores,
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: globals.node,
    },
  },
  globalIgnores,
);
export default config;
