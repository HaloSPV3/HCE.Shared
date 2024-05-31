/** semantic-release
 * After HCE.Shared's Shareable Configuration (see 'static/.releaserc.yml', https://semantic-release.gitbook.io/semantic-release/usage/configuration#extends)
 * is loaded, the following semantic-release configuration is merged
 * into the configuration object, overriding existing values.
 * Later, when a release is triggered, semantic-release will
 * add any unspecified settings with default values.
 *
 ** How to review the 'actual' config
 * `npx semantic-release --debug`.
 *
 ** Plugins Configuration
 * Plugins are configured via tuple-like arrays e.g. ['plugin name', {config object}].
 *
 * ! WARNING! Arrays and child objects are overwritten entirely.
 * When 'plugins' is set, only commit-analyzer is added if missing.
 */

import hceSharedConfig from '@halospv3/hce.shared-config'
import { ok } from 'node:assert/strict';
import { inspect } from 'node:util';

const config = { ...(hceSharedConfig) };
ok(config.plugins)

console.log(inspect(config))



// #region COMMIT ANALYZER
const COMMIT_ANALYZER_ID = '@semantic-release/commit-analyzer';
const commitAnalyzerIndex = config.plugins.findIndex(pluginSpec =>
	pluginSpec === COMMIT_ANALYZER_ID || pluginSpec[0] === COMMIT_ANALYZER_ID
);

/** 
 * @type {import('semantic-release').PluginSpec<import('@semantic-release/commit-analyzer').CommitAnalyzerConfig>} 
 * https://github.com/semantic-release/commit-analyzer#options
 */
let commitAnalyzer = config.plugins[commitAnalyzerIndex];
if (typeof commitAnalyzer === 'string')
	commitAnalyzer = [COMMIT_ANALYZER_ID, {}];

/* Set Release Rules */

let releaseRules = commitAnalyzer[1].releaseRules;
if (releaseRules === undefined)
	releaseRules = [];
if (releaseRules instanceof String)
	// @ts-expect-error Yes, it's a string. Stop complaining.
	releaseRules = await import(commitAnalyzer[1].releaseRules)
if (releaseRules === undefined || typeof releaseRules === 'string')
	throw TypeError("it's supposed to be a string[] now");

// description: https://github.com/semantic-release/commit-analyzer#releaserules
// defaults: https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
releaseRules.push(
	{
		type: '(build|chore|fix)',
		scope: 'deps',
		release: 'patch',
	}
)
commitAnalyzer[1].releaseRules = releaseRules;
// @ts-expect-error Index signature in type 'readonly PluginSpec<any>[]' only permits reading. ts(2542)
config.plugins[commitAnalyzerIndex] = commitAnalyzer;

// #endregion COMMIT ANALYZER

/**
 * @param {import('semantic-release').PluginSpec<unknown>[]} pluginsArray
 */
function getGitIndex(pluginsArray) { return pluginsArray.findIndex(v => v[0] === '@semantic-release/git') };

// #region NPM

// assert it's not already in the plugin array
if (undefined === config.plugins.find(v => v[0] === '@semantic-release/npm')) {
	const plugins = [...config.plugins];
	plugins.splice(getGitIndex(plugins) + 1, 0, ['@semantic-release/npm', {}])
	config.plugins = plugins;
}

// #endregion NPM

// #region GITHUB

ok(config.plugins);
const githubIndex = config.plugins.findIndex(v => v[0] === "@semantic-release/github");
config.plugins[githubIndex][1].assets = ['halospv3-hce.shared-*.tgz'];

/* modify branches */

ok(config.branches)

// isArray doesn't work well with readonly arrays
if (typeof config.branches === 'string' || (!('find' in config.branches && 'findIndex' in config.branches))) {
	config.branches = [config.branches];
}

/** @type { import('semantic-release').BranchSpec }*/
const next_3xx = { name: 'next/3.0.0', prerelease: 'beta', range: '3.x' }
config.branches = [
	...config.branches,
	next_3xx
]


// #endregion github

export default config;
