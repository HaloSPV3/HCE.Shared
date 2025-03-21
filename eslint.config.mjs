import md from '@eslint/markdown';
import stylistic from '@stylistic/eslint-plugin';
import 'tsx';
import { config } from 'typescript-eslint';

/**
 * @typedef {typeof import('./src/eslintConfig.ts').default} FlatConfigArray
 * @typedef {import('@stylistic/eslint-plugin').RuleOptions} RuleOptions
 * @type {FlatConfigArray} */
const hceSharedConfig = (await import('./src/eslintConfig.ts')).default;

export default config(
  ...hceSharedConfig.filter(v => v.name == undefined || v.name !== 'JSTS'),
  md.configs.recommended,
  {
    extends: [
      hceSharedConfig.filter(v => v.name === 'JSTS'),
      stylistic.configs.customize({
        quoteProps: 'as-needed',
        semi: true,
      }),
    ],

    rules: {
      '@stylistic/semi': [
        'error',
        'always',
        /** @type {Partial<RuleOptions['@stylistic/semi'][1]>} */ ({
          omitLastInOneLineBlock: false,
          omitLastInOneLineClassBody: false,
        }),
      ],
    },
  },
);
