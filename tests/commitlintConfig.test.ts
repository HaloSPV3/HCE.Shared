import { deepStrictEqual, ok } from 'node:assert';
import { describe, it } from 'node:test';
// @ts-expect-error ts(7016) Could not find a declaration file
import createPreset from 'conventional-changelog-conventionalcommits';
import commitLintConventional from '@commitlint/config-conventional';
import load from '@commitlint/load';
import { type QualifiedRuleConfig, RuleConfigSeverity } from '@commitlint/types';
import rawConfig from '@halospv3/hce.shared-config/commitlintConfig';

await describe("commitlintConfig", async () => {
	await describe("rawConfig", async () => {
		await it("has extends", () => {
			if (typeof rawConfig.extends === 'string')
				deepStrictEqual(rawConfig.extends, '@commitlint/config-conventional');
			else if (Array.isArray(rawConfig.extends))
				deepStrictEqual(rawConfig.extends, ['@commitlint/config-conventional']);
			else ok(false, 'extends is not defined in config file or is an unsupported type!');
		});

		await it("has rules", () => {
			ok(rawConfig.rules);
			const rules = rawConfig.rules;
			deepStrictEqual(
				rules['body-max-line-length'],
				[RuleConfigSeverity.Disabled] as QualifiedRuleConfig<number>
			);
			deepStrictEqual(
				rules['footer-max-line-length'],
				[RuleConfigSeverity.Disabled] as QualifiedRuleConfig<number>
			);
			deepStrictEqual(
				rules['header-max-length'],
				[RuleConfigSeverity.Disabled] as QualifiedRuleConfig<number>
			);
		});
	});

	await describe('Loaded config tests', async () => {
		const config = await load(rawConfig);
		await it('has parserPreset', async () => {
			const preset = await createPreset();
			ok(config.parserPreset);
			deepStrictEqual(config.parserPreset.name, commitLintConventional.parserPreset);
			deepStrictEqual(config.parserPreset.parserOpts, preset.parser);
		});
		await it('has rules', async () => {
			deepStrictEqual(config.rules['body-leading-blank'], commitLintConventional.rules['body-leading-blank']);
			deepStrictEqual(config.rules['body-max-line-length']?.[0], RuleConfigSeverity.Disabled);
			deepStrictEqual(config.rules['footer-leading-blank'], commitLintConventional.rules['footer-leading-blank']);
			deepStrictEqual(config.rules['footer-max-line-length']?.[0], RuleConfigSeverity.Disabled);
			deepStrictEqual(config.rules['header-max-length']?.[0], RuleConfigSeverity.Disabled);
			deepStrictEqual(config.rules['header-trim'], commitLintConventional.rules['header-trim']);
			deepStrictEqual(config.rules['subject-case'], commitLintConventional.rules['subject-case']);
			deepStrictEqual(config.rules['subject-empty'], commitLintConventional.rules['subject-empty']);
			deepStrictEqual(config.rules['subject-full-stop'], commitLintConventional.rules['subject-full-stop']);
			deepStrictEqual(config.rules['type-case'], commitLintConventional.rules['type-case']);
			deepStrictEqual(config.rules['type-empty'], commitLintConventional.rules['type-empty']);
			deepStrictEqual(config.rules['type-enum'], commitLintConventional.rules['type-enum']);
		});
	});
})