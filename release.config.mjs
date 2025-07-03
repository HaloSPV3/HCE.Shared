// @ts-check
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
import { inspect } from 'node:util';
// import to check for the dependency
import '@semantic-release/gitlab';

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

  // eslint-disable-next-line jsdoc/no-undefined-types
  /** @type {(plugins:(string | [string,object])[]) => typeof T_CommitAnalyzerOpts['inferOut']} */
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
 * @param {import('semantic-release').PluginSpec[]} pluginsArray A Semantic Release Options object's plugins array.
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

const nullableString = type('string | undefined');

const SRGHOptions = type({
  /** May default to GH_URL or GITHUB_URL */
  githubUrl: nullableString,
  /** May default to GH_PREFIX or GITHUB_PREFIX */
  githubApiPathPrefix: nullableString,
  githubApiUrl: 'string?',
  proxy: 'undefined | string | false',
  assets: type.string.or(
    type.string.or({
      path: type.string,
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

/**
 * Setup GitHub plugin options
 */
function setupGithub() {
  // eslint-disable-next-line jsdoc/no-undefined-types
  /** @type {(typeof GHTuple.inferIn) | undefined} */
  let github;
  for (const plugin of config.plugins) {
    if (GHTuple.allows(plugin)) {
      github = plugin;
      break;
    }
  }
  if (github)
    github[1].assets = ['halospv3-hce.shared-*.tgz'];
}
setupGithub();
// #endregion GITHUB

// #region GITLAB

/* eslint-disable jsdoc/no-undefined-types */
const GLAssetObject = type({
  /**
   * **Required**, unless {@link GLAssetObject.t.url `url`} is set. A glob to
   * identify the files to upload. Supports Lodash templating.
   */
  path: type.string,
  /**
   * Alternative to setting {@link GLAssetObject.t.path `path`} this provides
   * the ability to add links to releases, e.g. URLs to container images.
   * Supports Lodash templating.
   */
  url: type.never,
}).or({
  path: type.never,
  url: type.string,
}).and({
  /**
   * Short description of the file displayed on the GitLab release.
   * Ignored if {@link GLAssetObject.t.path `path`} matches more than one file. Supports
   * Lodash templating.
   * @default string // File name extracted from the {@link path}.
   */
  label: type.string,
  /**
   * Asset type displayed on the GitLab release. Can be `runbook`, `package`,
   * `image` and `other` (see official documents on release assets). Supports
   * Lodash templating.
   * @default 'other'
   */
  'type?': type('"runbook" | "package" | "image" | "other"'),
  /**
   * A filepath for creating a permalink pointing to the asset (requires
   * GitLab 12.9+, see official documents on permanent links). Ignored if
   * `path` matches more than one file. Supports Lodash templating.
   */
  'filepath?': type.string,
  /**
   * Controls where the file is uploaded to. Can be set to `project_upload`
   * for storing the file as project upload or `generic_package` for storing
   * the file as generic package.
   * @default 'project_upload'
   */
  'target?': type('"project_upload" | "generic_package"'),
  /**
   * This is only applied, if {@link GLAssetObject.t.target `target`} is set to `generic_package`. The
   * generic package status. Can be default and hidden (see official
   * documents on generic packages).
   * @default 'default'
   */
  'status?': type.string,
});
/* eslint-enable jsdoc/no-undefined-types */

const GLAssetLike = type.string
  .or(type.string.or(GLAssetObject).array());
/**
 * ### GitLab authentication
 *
 * The GitLab authentication configuration is **required** and can be set via
 * [environment variables](#environment-variables).
 *
 * Create a [project access token](https://docs.gitlab.com/ee/user/project/settings/project_access_tokens.html), [group access token](https://docs.gitlab.com/ee/user/group/settings/group_access_tokens.html), or [personal access token](https://docs.gitlab.com/ce/user/profile/personal_access_tokens.html) with role _Developer_ (or higher) and the `api` scope and make it available in your CI environment via the `GL_TOKEN` environment variable. If you are using `GL_TOKEN` as the [remote Git repository authentication](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/ci-configuration.md#authentication) it must also have the `write_repository` scope.
 *
 * **Note**: When running with [`dryRun`](https://semantic-release.gitbook.io/semantic-release/usage/configuration#dryrun) only `read_repository` scope is required.
 * ### Environment variables
 * | Variable                   | Description
 * | -------------------------- | -----------
 * | GL_TOKEN or GITLAB_TOKEN   | Required. The token used to authenticate with GitLab.
 * | GL_URL or GITLAB_URL       | The GitLab endpoint.
 * | GL_PREFIX or GITLAB_PREFIX | The GitLab API prefix.
 * | HTTP_PROXY or HTTPS_PROXY  | HTTP or HTTPS proxy to use.
 * | NO_PROXY                   | Patterns for which the proxy should be ignored.
 * @see https://github.com/semantic-release/gitlab#configuration
 */
const SRGLOptions = type({
  /**
   * The GitLab endpoint.
   * @default env.GL_URL??env.GITLAB_URL // environment variable or CI provided environment variables if running on GitLab CI/CD or https://gitlab.com.
   */
  gitlabUrl: type.string,
  /**
   *  The GitLab API prefix.
   * @default env.GL_PREFIX??GITLAB_PREFIX // environment variable or CI provided environment variables if running on GitLab CI/CD or /api/v4.
   */
  gitlabApiPathPrefix: type.string,
  /**
   * An array of files to upload to the release. Can be a glob or and Array of
   * globs and {@link GLAssetObject}s.
   *
   * Each entry in the `assets` `Array` is globbed individually. A [glob](https://github.com/isaacs/node-glob#glob-primer)
   * can be a `String` (`"dist/**\/*.js"` or `"dist/mylib.js"`) or an `Array` of `String`s that will be globbed together
   * (`["dist/**", "!**\/*.css"]`).
   *
   * If a directory is configured, all the files under this directory and its children will be included.
   *
   * **Note**: If a file has a match in `assets` it will be included even if it also has a match in `.gitignore`.
   * @example
   * 'dist/*.js' // include all the `js` files in the `dist` directory, but not in its sub-directories.
   *
   * ;// include all the files in the `dist` directory and its sub-directories excluding the `css` files.
   * [
   *   [
   *     'dist',
   *     '!**\/*.css'
   *   ]
   * ]
   *
   * ;// include the `dist/MyLibrary.js` and `dist/MyLibrary.css` files, and label them `MyLibrary JS distribution` and `MyLibrary CSS distribution` in the GitLab release.
   * [
   *   {
   *     path: 'dist/MyLibrary.js',
   *     label: 'MyLibrary JS distribution'
   *   },
   *   {
   *     path: 'dist/MyLibrary.css',
   *     label: 'MyLibrary CSS distribution'
   *   }
   * ]
   *
   * ;// include all the `js` and `css` files in the `dist` directory and its sub-directories excluding the minified version, plus the `build/MyLibrary.zip` file and label it `MyLibrary` in the GitLab release.
   * [
   *   ['dist/**\/*.{js,css}', '!**\/*.min.*'],
   *   {
   *     path: 'build/MyLibrary.zip',
   *      label: 'MyLibrary'
   *   }
   * ]
   */
  assets: GLAssetLike,
  /**
   * An array of milestone titles to associate to the release. See [GitLab
   * Release API](https://docs.gitlab.com/ee/api/releases/#create-a-release).
   */
  milestones: type.string.array(),
  /**
   * The comment to add to each Issue and Merge Request resolved by the
   * release. See [successComment](#successComment).
   *
   * The message for the issue comments is generated with [Lodash
   * template](https://lodash.com/docs#template). The following variables are
   * available:
   *
   * | Parameter      | Description                                                                                                                                                             |
   * | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   * | `branch`       | `Object` with `name`, `type`, `channel`, `range` and `prerelease` properties of the branch from which the release is done.                                              |
   * | `lastRelease`  | `Object` with `version`, `channel`, `gitTag` and `gitHead` of the last release.                                                                                         |
   * | `nextRelease`  | `Object` with `version`, `channel`, `gitTag`, `gitHead` and `notes` of the release being done.                                                                          |
   * | `commits`      | `Array` of commit `Object`s with `hash`, `subject`, `body` `message` and `author`.                                                                                      |
   * | `releases`     | `Array` with a release `Object`s for each release published, with optional release data such as `name` and `url`.                                                       |
   * | `issue`        | A [GitLab API Issue object](https://docs.gitlab.com/ee/api/issues.html#single-issue) the comment will be posted to, or `false` when commenting Merge Requests.          |
   * | `mergeRequest` | A [GitLab API Merge Request object](https://docs.gitlab.com/ee/api/merge_requests.html#get-single-mr) the comment will be posted to, or `false` when commenting Issues. |
   * @default `:tada: This issue has been resolved in version ${nextRelease.version} :tada:\n\nThe release is available on ${gitlab_release_url}`
   */
  successComment: type.string,
  /**
   * Use this as condition, when to comment on issues or merge requests. See
   * [successCommentCondition](#successCommentCondition).
   *
   * The success comment condition is generated with [Lodash
   * template](https://lodash.com/docs#template). The following variables are
   * available:
   *
   * | Parameter      | Description                                                                                                                          |
   * | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
   * | `branch`       | `Object` with `name`, `type`, `channel`, `range` and `prerelease` properties of the branch from which the release is done.           |
   * | `lastRelease`  | `Object` with `version`, `channel`, `gitTag` and `gitHead` of the last release.                                                      |
   * | `nextRelease`  | `Object` with `version`, `channel`, `gitTag`, `gitHead` and `notes` of the release being done.                                       |
   * | `commits`      | `Array` of commit `Object`s with `hash`, `subject`, `body` `message` and `author`.                                                   |
   * | `releases`     | `Array` with a release `Object`s for each release published, with optional release data such as `name` and `url`.                    |
   * | `issue`        | A [GitLab API Issue object](https://docs.gitlab.com/ee/api/issues.html#single-issue) the comment will be posted to.                  |
   * | `mergeRequest` | A [GitLab API Merge Request object](https://docs.gitlab.com/ee/api/merge_requests.html#get-single-mr) the comment will be posted to. |
   *
   * #### successCommentCondition example
   *
   * - do not create any comments at all: set to false or templating:
   *   - "<% return false; %>"
   * - to only comment on issues:
   *   - "<% return issue %>"
   * - to only comment on merge requests:
   *   - "<% return mergeRequest %>"
   * - you can use labels to filter issues
   *   - "<% return issue.labels?.includes('semantic-release-relevant') %>"
   *
   * > check the GitLab API Merge Request object or the GitLab API Issue
   * > object for properties which can be used for the filter
   */
  successCommentCondition: type.unknown,
  /**
   * The content of the issue created when a release fails.
   *
   * The message for the issue content is generated with [Lodash template](https://lodash.com/docs#template). The following variables are available:
   * | Parameter | Description                                                                                                                                                                                                                                                                                                            |
   * | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   * | `branch`  | The branch from which the release had failed.                                                                                                                                                                                                                                                                          |
   * | `errors`  | An `Array` of [SemanticReleaseError](https://github.com/semantic-release/error). Each error has the `message`, `code`, `pluginName` and `details` properties.<br>`pluginName` contains the package name of the plugin that threw the error.<br>`details` contains a information about the error formatted in markdown. |
   *
   * ##### failComment example
   *
   * The `failComment` `This release from branch ${branch.name} had failed due to the following errors:\n- ${errors.map(err => err.message).join('\\n- ')}` will generate the comment:
   *
   * > This release from branch master had failed due to the following errors:
   * >
   * > - Error message 1
   * > - Error message 2
   * @default string // (Friendly message with links to **semantic-release**
   * documentation and support, with the list of errors that caused the
   * release to fail.)
   */
  failComment: type.string,
  /**
   * The title of the issue created when a release fails.
   * @default 'The automated release is failing 🚨'
   */
  failTitle: type.string,
  /**
   * Use this as condition, when to comment on or create an issues in case of
   * failures.
   *
   * The fail comment condition is generated with [Lodash template](https://lodash.com/docs#template). The following variables are available:
   *
   * | Parameter     | Description                                                                                                                                                  |
   * | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
   * | `branch`      | `Object` with `name`, `type`, `channel`, `range` and `prerelease` properties of the branch from which the release is done.                                   |
   * | `lastRelease` | `Object` with `version`, `channel`, `gitTag` and `gitHead` of the last release.                                                                              |
   * | `nextRelease` | `Object` with `version`, `channel`, `gitTag`, `gitHead` and `notes` of the release being done.                                                               |
   * | `commits`     | `Array` of commit `Object`s with `hash`, `subject`, `body` `message` and `author`.                                                                           |
   * | `releases`    | `Array` with a release `Object`s for each release published, with optional release data such as `name` and `url`.                                            |
   * | `issue`       | A [GitLab API Issue object](https://docs.gitlab.com/ee/api/issues.html#single-issue) the comment will be posted to - only available if an open issue exists. |
   *
   * ##### failCommentCondition example
   *
   * - do not create any comments at all
   *   - `false`
   *   - `"<% return false; %>"`
   * - to only comment on main branch
   *   - `"<% return branch.name === 'main' %>"`
   * - you can use labels to filter issues, i.e. to not comment if the issue is labeled with `wip`
   *   - `"<% return !issue.labels?.includes('wip') %>"`
   *
   * > check the [GitLab API Issue object](https://docs.gitlab.com/ee/api/issues.html#single-issue) for properties which can be used for the filter
   */
  failCommentCondition: type.string,
  /**
   * The [labels](https://docs.gitlab.com/ee/user/project/labels.html#labels)
   * to add to the issue created when a release fails. Set to `false` to not
   * add any label. Labels should be comma-separated as described in the
   * [official docs](https://docs.gitlab.com/ee/api/issues.html#new-issue),
   * @example 'semantic-release,bot'
   * @default 'semantic-release'
   */
  labels: type.string,
  /**
   * The assignee to add to the issue created when a release fails.
   * @see https://docs.gitlab.com/api/boards/#update-an-issue-board
   */
  assignee: type.bigint,
  /**
   * The maximum number of retries for failing HTTP requests.
   * @default 3
   */
  retryLimit: type.number,
});

const GLTuple = type(['"@semantic-release/gitlab"', SRGLOptions]);

// eslint-disable-next-line jsdoc/require-jsdoc
function setupGitlab() {
  // eslint-disable-next-line jsdoc/no-undefined-types
  /** @type {typeof GLTuple.inferOut | undefined} */
  // @ts-expect-error `find` drops the narrowed type.
  const gitlab = config.plugins.find(v => GLTuple.allows(v));
  if (gitlab)
    gitlab[1].assets = ['halospv3-hce.shared-*.tgz'];
}
setupGitlab();

// #endregion GITLAB

export default config;
