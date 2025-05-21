/**
 * # semantic-release
 *
 * After HCE.Shared's Shareable Configuration (see 'static/.releaserc.yml', https://semantic-release.gitbook.io/semantic-release/usage/configuration#extends)
 * is loaded, the following semantic-release configuration is merged
 * into the configuration object, overriding existing values.
 * Later, when a release is triggered, semantic-release will
 * add any unspecified settings with default values.
 *
 * ## How to review the 'actual' config
 *
 * `npx semantic-release --debug`.
 *
 * ## Plugins Configuration
 *
 * Plugins are configured via tuple-like arrays e.g. ['plugin name', {config object}].
 *
 * ! WARNING! Arrays and child objects are overwritten entirely.
 * When 'plugins' is set, only commit-analyzer is added if missing.
 */

import 'tsx';
import { type } from 'arktype';
import { ok } from 'node:assert/strict';
import { env } from 'node:process';
import { inspect } from 'node:util';

const { default: hceSharedConfig } = await import('./src/index.ts');

/**
 * {@link hceSharedConfig} customized for this project's release pipeline
 */
const config = {
  ...hceSharedConfig,
  branches: /** @type {const} */([
    ...hceSharedConfig.branches,
    /** @satisfies { import('semantic-release').BranchSpec } */
    ({ name: 'next/3.0.0', prerelease: 'beta', range: '3.x' }),
  ]),
};
ok(config.plugins);

console.debug(inspect(config, false, Infinity));

// #region COMMIT ANALYZER
/**
 * Setup Commit Analyzer plugin options
 */
async function setupCommitAnalyzer() {
  const COMMIT_ANALYZER_ID = '@semantic-release/commit-analyzer';
  const commitAnalyzerIndex = config.plugins.findIndex(pluginSpec =>
    typeof pluginSpec === 'string'
      ? pluginSpec === COMMIT_ANALYZER_ID
      : pluginSpec[0] === COMMIT_ANALYZER_ID,
  );
  const T_AnyRecord = type.Record('string | symbol', 'unknown');
  const T_RuleObject = type({
    type: type.string.optional(),
    scope: type.string.optional(),
    release: type.string,
  });
  const T_CommitAnalyzerOpts = type({
    preset: type.string.optional(),
    config: type.string.optional(),
    parserOpts: T_AnyRecord.optional(),
    releaseRules: T_RuleObject.array().or(type.string).optional(),
    presetConfig: T_AnyRecord.optional(),
  });

  /** @type {(plugins:typeof config.plugins) => T_CommitAnalyzerOpts['inferOut']} */
  function extractCommitAnalyzerOpts(plugins) {
    const entry = plugins.find(v => v === COMMIT_ANALYZER_ID || v[0] === COMMIT_ANALYZER_ID);
    if (entry == undefined || typeof entry === 'string')
      return {};
    return T_CommitAnalyzerOpts.allows(entry[1]) ? T_CommitAnalyzerOpts.from(entry[1]) : {};
  }

  /** https://github.com/semantic-release/commit-analyzer#options */
  const commitAnalyzerOpts = extractCommitAnalyzerOpts(config.plugins);

  // Set Release Rules

  commitAnalyzerOpts.releaseRules ??= [];
  if (typeof commitAnalyzerOpts.releaseRules === 'string') {
    const imp = type.unknown.from(await import(commitAnalyzerOpts.releaseRules));
    if (T_RuleObject.array().allows(type.object.allows(imp) && 'default' in imp && Array.isArray(imp.default) ? imp.default : imp)) {
      commitAnalyzerOpts.releaseRules = T_RuleObject.array().assert(imp);
    }
  }

  // assign modified tuple to commit analyzer
  config.plugins[commitAnalyzerIndex] = [COMMIT_ANALYZER_ID, commitAnalyzerOpts];
}
await setupCommitAnalyzer();

// #endregion COMMIT ANALYZER

/**
 * @param {import('semantic-release').PluginSpec<unknown>[]} pluginsArray A Semantic Release Options object's plugins array.
 * @returns {number | -1} the index of the Git plugin in the array, if present. Else `-1`.
 */
function getGitIndex(pluginsArray) {
  return pluginsArray.findIndex(v => v[0] === '@semantic-release/git' || v === '@semantic-release/git');
}

// #region NPM

// assert it's not already in the plugin array
if (undefined === config.plugins.find(v => v[0] === '@semantic-release/npm' || v === '@semantic-release/npm')) {
  const plugins = [...config.plugins];
  plugins.splice(getGitIndex(plugins) + 1, 0, ['@semantic-release/npm', {}]);
  config.plugins = plugins;
}

// #endregion NPM

// #region GITHUB

/**
 * Setup GitHub plugin options
 */
function setupGithub() {
  const SRGHOptions = type({
    githubUrl: type('undefined | string')
      .default(() => env['GH_URL'] ?? env['GITHUB_URL']),
    githubApiPathPrefix: type('undefined | string')
      .default(() => env['GH_PREFIX'] ?? env['GITHUB_PREFIX']),
    githubApiUrl: 'string?',
    proxy: 'undefined | string | false',
    assets: type.string.or(
      type.string.or({
        path: 'string',
        name: 'string?',
        label: 'string?',
      }).array(),
    ).optional(),
    successComment: type('undefined | string | false')
      .default('":tada: This issue has been resolved in version ${nextRelease.version} :tada:\n\nThe release is available on [GitHub release](<github_release_url>)"'),
    failComment: 'undefined | string | false',
    failTitle: 'string | false = "The automated release is failing 🚨"',
    labels: type('string[] | false')
      .default(() => ['semantic-release']),
    assignees: 'unknown?',
    releasedLabels: type('string[]')
      .default(() => ['released<%= nextRelease.channel ? \\` on @\\${nextRelease.channel}\\` : "" %>']),
    addReleases: 'false | "bottom" | "top" = false',
    draftRelease: 'boolean = false',
    releaseNameTemplate: type.string
      .default('<%= nextRelease.notes %>'),
    releaseBodyTemplate: type.string
      .default('<%= nextRelease.notes %'),
    discussionCategoryName: 'string | false = false',
  });

  const GHTuple = type(['"@semantic-release/github"', SRGHOptions]);
  /** @type {typeof GHTuple.inferOut | undefined} */
  // @ts-expect-error `find` drops the narrowed type.
  const github = config.plugins.find(v => GHTuple.allows(v));
  if (github)
    github[1].assets = ['halospv3-hce.shared-*.tgz'];
}
setupGithub();
// #endregion github

export default config;
