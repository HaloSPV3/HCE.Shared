import eslint from '@eslint/js';
import stylistic, { type RuleOptions } from '@stylistic/eslint-plugin';
import type { TSESLint } from '@typescript-eslint/utils';
import jsonc from 'eslint-plugin-jsonc';
import globals from 'globals/globals.json' with { type: 'json' };
import tseslint from 'typescript-eslint';

// https://eslint.org/docs/latest/use/configure/migration-guide#using-eslintrc-configs-in-flat-config
// https://www.google.com/search?q=javascript+recurse+through+object+and+remove+undefined+properties

const globalIgnores: TSESLint.FlatConfig.Config = {
  name: 'global ignores',
  ignores: [
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
  ],
};

const stylisticWarn = stylistic.configs.customize({
  quoteProps: 'as-needed',
  semi: true,
  indent: 2,
}) as TSESLint.FlatConfig.Config & { rules: { [K in keyof RuleOptions]: TSESLint.SharedConfig.RuleLevel | [TSESLint.SharedConfig.RuleLevel, ...RuleOptions[K]] } };
// change all stylistic error-severity to warn-severity. Style violations should not denote code errors.
for (const key in stylisticWarn.rules) {
  const element = stylisticWarn.rules[key];
  if (Array.isArray(element) && (element[0] === 2 || element[0] === 'error'))
    element[0] = 'warn';
  else if (element === 2 || element === 'error') {
    stylisticWarn.rules[key] = 'warn' satisfies TSESLint.SharedConfig.RuleLevel;
  }
}

stylisticWarn.rules['@stylistic/no-extra-parens'] = [
  'warn',
  'all',
  {
    allowParensAfterCommentPattern: '@type|@satisfies',
    nestedBinaryExpressions: false,
  },
];

stylisticWarn.rules['@stylistic/semi'] = [
  'warn',
  'always',
  {
    omitLastInOneLineBlock: false,
    omitLastInOneLineClassBody: false,
  },
] satisfies TSESLint.SharedConfig.RuleEntry | [TSESLint.SharedConfig.RuleLevelAndOptions, RuleOptions['@stylistic/semi'][0], RuleOptions['@stylistic/semi'][1]];

const config: TSESLint.FlatConfig.ConfigArray = tseslint.config(
  {
    /** jsonc config union types are a pain to work with. Each union member is mutually exclusive to the others */
    ...jsonc.configs['flat/recommended-with-json']
      .map(v => ({ ...v } as JsoncCfgReducerIn))
      .flatMap(a => jsonCfgReducer(a, {}))
      .reduce((accumulator, element) => jsonCfgReducer(accumulator, element), {}),
    name: 'flat/recommended-with-json - https://github.com/ota-meshi/eslint-plugin-jsonc',
    files: ['*.json', '**/*.json'],
    ignores: globalIgnores.ignores,
  },
  {
    /** jsonc config union types are a pain to work with. Each union member is mutually exclusive to the others */
    ...jsonc.configs['flat/recommended-with-json5']
      .map(v => ({ ...v } as JsoncCfgReducerIn))
      .flatMap(a => jsonCfgReducer(a, {}))
      .reduce((accumulator, element) => jsonCfgReducer(accumulator, element), {}),
    name: 'flat/recommended-with-json5 - https://github.com/ota-meshi/eslint-plugin-jsonc',
    files: ['*.json5', '**/*.json5'],
    ignores: globalIgnores.ignores,
  },
  {
    /** jsonc config union types are a pain to work with. Each union member is mutually exclusive to the others */
    ...jsonc.configs['flat/recommended-with-jsonc']
      .map(v => ({ ...v } as JsoncCfgReducerIn))
      .flatMap(a => jsonCfgReducer(a, {}))
      .reduce((accumulator, element) => jsonCfgReducer(accumulator, element), {}),
    name: 'flat/recommended-with-jsonc - https://github.com/ota-meshi/eslint-plugin-jsonc',
    files: ['*.jsonc', '**/*.jsonc'],
    ignores: globalIgnores.ignores,
  },
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

type JsoncCfgReducerIn = Partial<typeof jsonc.configs['flat/recommended-with-jsonc'][number]>
  | Partial<typeof jsonc.configs['flat/recommended-with-json5'][number]>;

interface JsoncCfgReducerOut {
  files: NonNullable<(typeof jsonc.configs)['flat/base'][number]['files']> | ['*.json', '**/*.json', '*.json5', '**/*.json5', '*.jsonc', '**/*.jsonc'];
  plugins: typeof jsonc.configs['flat/base'][number]['plugins'];
  languageOptions: {
    parser: typeof import('jsonc-eslint-parser');
  };
  rules: NonNullable<
    typeof jsonc['configs']['flat/recommended-with-json5'][number]['rules']
    | typeof jsonc.configs['flat/recommended-with-jsonc'][number]['rules']
  >;
}

function jsonCfgReducer(
  a: JsoncCfgReducerIn | JsoncCfgReducerOut,
  b: JsoncCfgReducerIn | JsoncCfgReducerOut,
): JsoncCfgReducerOut {
  const baseRules = jsonc.configs['flat/base']
    .find(
      v => v.rules !== undefined,
    )?.rules ?? (() => { throw new Error('Unable to find jsonc base rules'); })();

  return {
    files: jsonc.configs['flat/base']
      .filter(v => v.files !== undefined)
      .flatMap(v => v.files),
    plugins: {
      jsonc: jsonc.configs['flat/base']
        .find(v =>
          v.plugins?.jsonc !== undefined,
        )?.plugins?.jsonc ?? (() => { throw new Error('Unable to find jsonc plugin'); })(),
    },
    languageOptions: {
      parser: jsonc.configs['flat/base']
        .find(v => v.languageOptions?.parser)
        ?.languageOptions?.parser ?? (() => { throw new Error('Unable to find jsonc parser'); })(),
    },
    rules: {
      ...a.rules,
      ...b.rules,
      ...baseRules,
    },
  };
}
