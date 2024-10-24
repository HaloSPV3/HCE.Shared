import { RuleConfigSeverity, type UserConfig } from '@commitlint/types'

const commitlintConfig: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [RuleConfigSeverity.Disabled],
    'footer-max-line-length': [RuleConfigSeverity.Disabled],
    'header-max-length': [RuleConfigSeverity.Disabled],
  },
}

// only `default` export is loaded via `extends` config key!
export default commitlintConfig
