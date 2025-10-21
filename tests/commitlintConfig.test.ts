import { deepStrictEqual, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import commitLintConventional from '@commitlint/config-conventional';
import load from '@commitlint/load';
import { RuleConfigSeverity, type QualifiedRuleConfig } from '@commitlint/types';
import rawConfig from '../src/commitlintConfig.js';
import { loadPreset } from 'conventional-changelog-preset-loader';

await describe('rawConfig', async () => {
  await it('has extends', () => {
    if (typeof rawConfig.extends === 'string')
      deepStrictEqual(rawConfig.extends, '@commitlint/config-conventional');
    else if (Array.isArray(rawConfig.extends))
      deepStrictEqual(rawConfig.extends, ['@commitlint/config-conventional']);
    else
      ok(
        false,
        'extends is not defined in config file or is an unsupported type!',
      );
  });

  await it('has rules', () => {
    ok(rawConfig.rules);
    const rules = rawConfig.rules;
    deepStrictEqual(rules['body-max-line-length'], [
      RuleConfigSeverity.Disabled,
    ] as QualifiedRuleConfig<number>);
    deepStrictEqual(rules['footer-max-line-length'], [
      RuleConfigSeverity.Disabled,
    ] as QualifiedRuleConfig<number>);
    deepStrictEqual(rules['header-max-length'], [
      RuleConfigSeverity.Disabled,
    ] as QualifiedRuleConfig<number>);
  });
});

await describe('Loaded config tests', async () => {
  const config = await load(rawConfig);
  await it('has parserPreset', async () => {
    const preset = await loadPreset('conventionalcommits');
    ok(preset);
    ok('parserOpts' in preset || 'parser' in preset);
    ok(config.parserPreset);
    deepStrictEqual(
      config.parserPreset.name,
      commitLintConventional.parserPreset,
    );
    if ('parser' in preset)
      deepStrictEqual(config.parserPreset.parserOpts, preset['parser']);
    else {
      deepStrictEqual(config.parserPreset.parserOpts, preset['parserOpts']);
    }
  });
  await it('has rules', () => {
    deepStrictEqual(
      config.rules['body-leading-blank'],
      commitLintConventional.rules['body-leading-blank'],
    );
    deepStrictEqual(
      config.rules['body-max-line-length']?.[0],
      RuleConfigSeverity.Disabled,
    );
    deepStrictEqual(
      config.rules['footer-leading-blank'],
      commitLintConventional.rules['footer-leading-blank'],
    );
    deepStrictEqual(
      config.rules['footer-max-line-length']?.[0],
      RuleConfigSeverity.Disabled,
    );
    deepStrictEqual(
      config.rules['header-max-length']?.[0],
      RuleConfigSeverity.Disabled,
    );
    deepStrictEqual(
      config.rules['header-trim'],
      commitLintConventional.rules['header-trim'],
    );
    deepStrictEqual(
      config.rules['subject-case'],
      commitLintConventional.rules['subject-case'],
    );
    deepStrictEqual(
      config.rules['subject-empty'],
      commitLintConventional.rules['subject-empty'],
    );
    deepStrictEqual(
      config.rules['subject-full-stop'],
      commitLintConventional.rules['subject-full-stop'],
    );
    deepStrictEqual(
      config.rules['type-case'],
      commitLintConventional.rules['type-case'],
    );
    deepStrictEqual(
      config.rules['type-empty'],
      commitLintConventional.rules['type-empty'],
    );
    deepStrictEqual(
      config.rules['type-enum'],
      commitLintConventional.rules['type-enum'],
    );
  });
});
