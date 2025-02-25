import { RuleConfigSeverity, type UserConfig } from '@commitlint/types'

/** @type { UserConfig } */
const commitlintConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [RuleConfigSeverity.Disabled],
    'footer-max-line-length': [RuleConfigSeverity.Disabled],
    'header-max-length': [RuleConfigSeverity.Disabled],
  },
} as const satisfies UserConfig

// only `default` export is loaded via `extends` config key!
export default commitlintConfig
