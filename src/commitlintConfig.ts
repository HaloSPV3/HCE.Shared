import { type RuleConfigSeverity, type UserConfig } from '@commitlint/types';

// CJS compatibility; This enum cannot be required.
const disabled = 0 as RuleConfigSeverity.Disabled;
const commitlintConfig: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-max-line-length': [disabled],
		'footer-max-line-length': [disabled],
		'header-max-length': [disabled],
	},
};

// only `default` export is loaded via `extends` config key!
export default commitlintConfig;
