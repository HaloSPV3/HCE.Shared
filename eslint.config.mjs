import stylistic from '@stylistic/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import md from '@eslint/markdown';
import { join } from 'path';
import { tsImport } from 'tsx/esm/api';
import { config } from 'typescript-eslint';

/**
 * @typedef {typeof import('./src/eslintConfig.ts').default} FlatConfigArray
 * @type {FlatConfigArray} */
const eslintConfig = await tsImport('./src/eslintConfig.ts', join(import.meta.dirname, 'src'))
  // eslint-disable-next-line @stylistic/no-extra-parens
  .then((/** @type {FlatConfigArray} */module) => 'default' in module ? /** @type {FlatConfigArray} */(module.default) : module);

const stylisticConfig = stylistic.configs.recommended;
stylisticConfig.ignores ??= [];
stylisticConfig.ignores.push('**/*.json');
stylisticConfig.rules ??= {};
stylisticConfig.rules['@stylistic/no-extra-parens'] = 'warn';

export default config(
  ...eslintConfig,
  ...md.configs.recommended,
  stylisticConfig,
  {
    ...stylisticTs.configs.all,
    rules: {
      '@stylistic/ts/indent': 'off',
      '@stylistic/ts/quotes': ['error', 'single'],
    },
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['./*.js'] },
      },
    },
    files: [
      'src/**/*.ts',
      'tests/**/*.ts',
      '*.js',
      '*.mjs',
      'packemon.config.ts',
    ],
    rules: {
      '@stylistic/semi': ['error', 'always'],
    },
  },
);
