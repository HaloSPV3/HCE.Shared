import { RuleConfigSeverity, type UserConfig } from '@commitlint/types';

export const commitlintConfig: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-max-line-length': [RuleConfigSeverity.Disabled],
		'footer-max-line-length': [RuleConfigSeverity.Disabled],
		'header-max-length': [RuleConfigSeverity.Disabled],
	},
};

// only `default` export is loaded via `extends` config key!
// eslint-disable-next-line import/no-default-export
export default commitlintConfig;
