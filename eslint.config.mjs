// import { default as moon } from "eslint-config-moon";
// import { default as moonNode } from "eslint-config-moon/node";
import eslintConfig from '@halospv3/hce.shared-config/eslintConfig'
import stylistic from '@stylistic/eslint-plugin'
import { config } from 'typescript-eslint'

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
