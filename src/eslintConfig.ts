import eslint from '@eslint/js'
import type { TSESLint } from '@typescript-eslint/utils'
import jsonc from 'eslint-plugin-jsonc'
import globals from 'globals/globals.json' with { type: 'json' }
import tseslint from 'typescript-eslint'

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
  ],
}

export const _configArray: tseslint.ConfigWithExtends[] = [
  {
    name: 'flat/recommended-with-json - https://github.com/ota-meshi/eslint-plugin-jsonc',
    extends: jsonc.configs['flat/recommended-with-json'],
    files: [
      '*.json',
      '**/*.json',
    ],
    ignores: globalIgnores.ignores,
  },
  {
    name: 'flat/recommended-with-json5 - https://github.com/ota-meshi/eslint-plugin-jsonc',
    extends: jsonc.configs['flat/recommended-with-json5'],
    files: [
      '*.json5',
      '**/*.json5',
    ],
    ignores: globalIgnores.ignores,
  },
  {
    name: 'flat/recommended-with-jsonc - https://github.com/ota-meshi/eslint-plugin-jsonc',
    extends: jsonc.configs['flat/recommended-with-jsonc'],
    files: [
      '*.jsonc',
      '**/*.jsonc',
    ],
    ignores: globalIgnores.ignores,
  },
  {
    name: 'TSJS',
    extends: [
      eslint.configs.recommended as TSESLint.FlatConfig.Config,
      ...tseslint.configs.strict,
      ...tseslint.configs.stylistic,
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
        projectService: {
          allowDefaultProject: ['./*.js'],
          loadTypeScriptPlugins: true,
        },
      },
      globals: globals.node,
    },
  },
  globalIgnores,
] satisfies tseslint.ConfigWithExtends[]

export default tseslint.config(..._configArray)
