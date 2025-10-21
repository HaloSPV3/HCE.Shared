import type { RuleConfigSeverity, UserConfig } from '@commitlint/types';

// explicit type annotations for isolatedDeclarations. Allows for faster processing.

const disabled = 0 as RuleConfigSeverity.Disabled;
const commitlintConfig: UserConfig & {
  extends: UserConfig['extends'] | ['@commitlint/config-conventional'];
  rules: {
    'body-max-line-length': [typeof disabled];
    'footer-max-line-length': [typeof disabled];
    'header-max-length': [typeof disabled];
  };
} = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [disabled],
    'footer-max-line-length': [disabled],
    'header-max-length': [disabled],
  },
};

// only `default` export is loaded via `extends` config key!
export default commitlintConfig;
