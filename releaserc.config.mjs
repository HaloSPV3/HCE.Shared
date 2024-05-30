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

ok(hceSharedConfig.plugins)

// #region COMMIT ANALYZER
const COMMIT_ANALYZER_ID = '@semantic-release/commit-analyzer';
const commitAnalyzerIndex = hceSharedConfig.plugins.findIndex(pluginSpec =>
	pluginSpec === COMMIT_ANALYZER_ID || pluginSpec[0] === COMMIT_ANALYZER_ID
);

/** 
 * @type {import('semantic-release').PluginSpec<import('@semantic-release/commit-analyzer').CommitAnalyzerConfig>} 
 * https://github.com/semantic-release/commit-analyzer#options
 */
let commitAnalyzer = hceSharedConfig.plugins[commitAnalyzerIndex];
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
hceSharedConfig.plugins[commitAnalyzerIndex] = commitAnalyzer;

// #endregion COMMIT ANALYZER

/**
 * @param {import('semantic-release').PluginSpec<unknown>[]} pluginsArray
 */
function getGitIndex(pluginsArray) { return pluginsArray.findIndex(v => v[0] === '@semantic-release/git') };

// #region NPM

// assert it's not already in the plugin array
ok(!hceSharedConfig.plugins.find(v => v[0] === '@semantic-release/npm'));
const arr = [...hceSharedConfig.plugins];
arr.splice(getGitIndex(arr) + 1, 0, ['@semantic-release/npm', {}])

// #endregion NPM

// #region GITHUB

ok(hceSharedConfig.plugins);
const githubIndex = hceSharedConfig.plugins.findIndex(v => v[0] === "@semantic-release/github");
hceSharedConfig.plugins[githubIndex][1].assets = ['halospv3-hce.shared-*.tgz'];

// #endregion github

export default hceSharedConfig;
