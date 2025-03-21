import md from '@eslint/markdown';
import stylistic from '@stylistic/eslint-plugin';
import 'tsx';
import { config } from 'typescript-eslint';

/**
 * @typedef {ReturnType<<T>(arg0:T)=> T extends (infer U)[] ? U : T>} FuncUnarray<T>
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
 */
const mdRecommended =/** @type {[...markdownRecommended]} */ (md.configs.recommended);

/**
 * @typedef {typeof import('./src/eslintConfig.ts').default} FlatConfigArray
 * @typedef {import('@stylistic/eslint-plugin').RuleOptions} RuleOptions
 * @type {FlatConfigArray} */
const hceSharedConfig = (await import('./src/eslintConfig.ts')).default;

export default config(
  ...hceSharedConfig.filter(v => v.name == undefined || v.name !== 'JSTS'),
  /** @satisfies {Parameters<typeof config>[0]} */
  (mdRecommended),
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
  {
    name: 'stylistic excludes',
    files: ['**/*.md'],
    rules: {
      '@stylistic/indent': 'off',
    },
  },
);
