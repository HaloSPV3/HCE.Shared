import { deepStrictEqual, ok } from 'node:assert';
import { describe, test } from 'node:test';
import createPreset from 'conventional-changelog-conventionalcommits';
import commitLintConventional from '@commitlint/config-conventional';
import load from '@commitlint/load';
import { type QualifiedRuleConfig, RuleConfigSeverity } from '@commitlint/types';
import rawConfig from '@halospv3/hce.shared-config/commitlintConfig';


await describe("commitlintConfig", async () => {
	await test('Raw config tests', async (t) => {
		await t.test('extends is defined', () => {
			if (typeof rawConfig.extends === 'string')
				deepStrictEqual(rawConfig.extends, '@commitlint/config-conventional');
			else if (Array.isArray(rawConfig.extends))
				deepStrictEqual(rawConfig.extends, ['@commitlint/config-conventional']);
			else ok(false, 'extends is not defined in config file or is an unsupported type!');
		});


		await t.test('rules is defined', () => {
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

	const config = await load(rawConfig);
	await test('Loaded config tests', async (t) => {
		await t.test('parserPreset is defined', async () => {
			const preset = await createPreset({});
			ok(config.parserPreset);
			deepStrictEqual(config.parserPreset.name, commitLintConventional.parserPreset);
			deepStrictEqual(config.parserPreset.parserOpts, preset.parserOpts);
		});
		await t.test('rules is defined', async (t_) => {
			await t_.test(
				'body-leading-blank',
				() => {
					deepStrictEqual(
						config.rules['body-leading-blank'],
						commitLintConventional.rules['body-leading-blank'],
					);
				},
			);
			await t_.test(
				'body-max-line-length',
				() => {
					deepStrictEqual(
						config.rules['body-max-line-length']?.[0],
						RuleConfigSeverity.Disabled,
					);
				},
			);
			await t_.test(
				'footer-leading-blank',
				() => {
					deepStrictEqual(
						config.rules['footer-leading-blank'],
						commitLintConventional.rules['footer-leading-blank'],
					);
				},
			);
			await t_.test(
				'footer-max-line-length',
				() => {
					deepStrictEqual(
						config.rules['footer-max-line-length']?.[0],
						RuleConfigSeverity.Disabled,
					);
				},
			);
			await t_.test(
				'header-max-length',
				() => { deepStrictEqual(config.rules['header-max-length']?.[0], RuleConfigSeverity.Disabled); },
			);
			await t_.test(
				'header-trim',
				() => {
					deepStrictEqual(
						config.rules['header-trim'],
						commitLintConventional.rules['header-trim'],
					);
				},
			);
			await t_.test(
				'subject-case',
				() => {
					deepStrictEqual(
						config.rules['subject-case'],
						commitLintConventional.rules['subject-case'],
					);
				},
			);
			await t_.test(
				'subject-empty',
				() => {
					deepStrictEqual(
						config.rules['subject-empty'],
						commitLintConventional.rules['subject-empty'],
					);
				},
			);
			await t_.test(
				'subject-full-stop',
				() => {
					deepStrictEqual(
						config.rules['subject-full-stop'],
						commitLintConventional.rules['subject-full-stop'],
					);
				},
			);
			await t_.test(
				'type-case',
				() => { deepStrictEqual(config.rules['type-case'], commitLintConventional.rules['type-case']); },
			);
			await t_.test(
				'type-empty',
				() => {
					deepStrictEqual(
						config.rules['type-empty'],
						commitLintConventional.rules['type-empty'],
					);
				},
			);
			await t_.test(
				'type-enum',
				() => { deepStrictEqual(config.rules['type-enum'], commitLintConventional.rules['type-enum']); },
			);
		});
	});
})