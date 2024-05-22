import { readFileSync } from 'node:fs';
import jsYaml from 'js-yaml';
import type { Options, PluginSpec } from 'semantic-release';
import { findStaticConfig } from './findStaticConfig.js';

export const defaultPlugins = [
	'@semantic-release/commit-analyzer' as PluginSpec,
	'@semantic-release/release-notes-generator',
	'@semantic-release/npm',
	'@semantic-release/github',
];

export const baseConfig: Options = jsYaml.load(
	readFileSync(findStaticConfig(), { encoding: 'utf8' }),
) as Options;
