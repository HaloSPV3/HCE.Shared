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

import { tsImport } from 'tsx/esm/api'
import { type } from 'arktype'
import { ok } from 'node:assert/strict'
import { join } from 'node:path'
import { env } from 'node:process'
import { inspect } from 'node:util'

/**
 * @type {typeof import('./src/index.js').default}
 */
const hceSharedConfig = await tsImport('./src/index.ts', join(import.meta.dirname, 'src'))
  .then(module => 'default' in module ? module.default : module)

/**
 * {@link hceSharedConfig} customized for this project's release pipeline
 */
const config = {
  /** @type {import('ts-essentials').DeepWritable<typeof hceSharedConfig>} */
  ...hceSharedConfig,
  /** @type {import('semantic-release').PluginSpec[]} */
  plugins: [...hceSharedConfig.plugins],
  branches: [
    ...hceSharedConfig.branches,
    /**
     * @type {const}
     * @satisfies { import('semantic-release').BranchSpec }
     */
    // eslint-disable-next-line @stylistic/no-extra-parens
    ({ name: 'next/3.0.0', prerelease: 'beta', range: '3.x' }),
  ],
}
ok(config.plugins)

console.debug(inspect(config, false, Infinity))

// #region COMMIT ANALYZER
const COMMIT_ANALYZER_ID = '@semantic-release/commit-analyzer'
const commitAnalyzerIndex = config.plugins.findIndex(pluginSpec =>
  typeof pluginSpec === 'string'
    ? pluginSpec === COMMIT_ANALYZER_ID
    : pluginSpec[0] === COMMIT_ANALYZER_ID,
)

/** @typedef {import('./src/semanticReleaseConfig.js').PluginSpecSRCommitAnalyzer} PluginSpecSRCommitAnalyzer */

/** https://github.com/semantic-release/commit-analyzer#options */
// eslint-disable-next-line @stylistic/no-extra-parens
const commitAnalyzer = /** @type {Exclude<PluginSpecSRCommitAnalyzer,string> } */ (
  typeof config.plugins[commitAnalyzerIndex] === 'string'
    ? [COMMIT_ANALYZER_ID, {}]
    : config.plugins[commitAnalyzerIndex]
)

// Set Release Rules
commitAnalyzer[1].releaseRules = commitAnalyzer[1].releaseRules !== undefined
  ? type({
    type: type.string.optional(),
    scope: type.string.optional(),
    release: type.string,
  }).array().from(
    typeof commitAnalyzer[1].releaseRules === 'string'
      ? await import(commitAnalyzer[1].releaseRules)
      : commitAnalyzer[1].releaseRules,
  )
  : []

// assign modified tuple to commit analyzer
config.plugins[commitAnalyzerIndex] = commitAnalyzer

// #endregion COMMIT ANALYZER

/**
 * @param {import('semantic-release').PluginSpec<unknown>[]} pluginsArray
 */
function getGitIndex(pluginsArray) {
  return pluginsArray.findIndex(v =>
    v[0] === '@semantic-release/git',
  )
};

// #region NPM

// assert it's not already in the plugin array
if (undefined === config.plugins.find(v => v[0] === '@semantic-release/npm')) {
  const plugins = [...config.plugins]
  plugins.splice(getGitIndex(plugins) + 1, 0, ['@semantic-release/npm', {}])
  config.plugins = plugins
}

// #endregion NPM

// #region GITHUB

ok(config.plugins)

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
})

const GHTuple = type(['"@semantic-release/github"', SRGHOptions])
const github = config.plugins.find(v => GHTuple.allows(v))
if (github)
  github[1].assets = ['halospv3-hce.shared-*.tgz']

/* modify branches */

ok(config.branches)

// isArray doesn't work well with readonly arrays
if (typeof config.branches === 'string' || !('find' in config.branches && 'findIndex' in config.branches)) {
  config.branches = [config.branches]
}

// #endregion github

export default config
