import stylistic from '@stylistic/eslint-plugin'
import { join } from 'path'
import { tsImport } from 'tsx/esm/api'
import { config } from 'typescript-eslint'

/** @type {typeof import('./src/eslintConfig.js').default} */
const eslintConfig = await tsImport('./src/eslintConfig.ts', join(import.meta.dirname, 'src'))
  .then(module => 'default' in module ? module.default : module)

const stylisticConfig = stylistic.configs['recommended-flat']
stylisticConfig.ignores ??= []
stylisticConfig.ignores.push('**/*.json')
stylisticConfig.rules ??= {}
stylisticConfig.rules['@stylistic/no-extra-parens'] = 'error'

export default config(
  ...eslintConfig,
  stylisticConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['./*.js'],
          loadTypeScriptPlugins: true,
        },
      },
    },
    files: [
      'src/**/*.ts',
      'tests/**/*.ts',
      '*.js',
      '*.mjs',
      'packemon.config.ts',
    ],
  },
)
