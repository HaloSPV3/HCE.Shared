// import { default as moon } from "eslint-config-moon";
// import { default as moonNode } from "eslint-config-moon/node";
// import { FlatCompat } from "@eslint/eslintrc"
import eslintConfig from '@halospv3/hce.shared-config/eslintConfig'
import stylistic from '@stylistic/eslint-plugin'
import { config } from 'typescript-eslint'

export default config(
  ...eslintConfig,
  Object.assign(stylistic.configs['recommended-flat'], { ignores: ['**/*.json'] }),
  { rules: { '@stylistic/no-extra-parens': 'error' } },
  {
    languageOptions: {
      parserOptions: {
        sourceType: 'module',
        EXPERIMENTAL_useProjectService: {
          allowDefaultProjectForFiles: [
            './*.js',
          ],
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
