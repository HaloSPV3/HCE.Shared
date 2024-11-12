import type { Options as SRCommitAnalyzerOptions } from '@semantic-release/commit-analyzer'
import type { Options as SRExecOptions } from '@semantic-release/exec'
import type { Options as SRGitOptions } from '@semantic-release/git'
import type { Options as SRGithubOptions } from '@semantic-release/github'
import type { Options, PluginSpec } from 'semantic-release'
import { DefaultOptions } from './setupGitPluginSpec.js'
import type { DeepWritable } from 'ts-essentials'

/**
 * A two-type PluginSpec to tie a plugin's name to its Options type. This is
 * intended for use by plugins to associate their Options type with their plugin
 * name, but will anyone ever use this?
 * @augments PluginSpec<T>
 */
export type PluginSpecTuple<P extends string, T> = P | [P, T]
export type PluginSpecSRCommitAnalyzer = PluginSpecTuple<'@semantic-release/commit-analyzer', SRCommitAnalyzerOptions>
export type PluginSpecSRExec = PluginSpecTuple<'@semantic-release/exec', SRExecOptions>
export type PluginSpecSRGit = PluginSpecTuple<'@semantic-release/git', SRGitOptions>
export type PluginSpecSRGithub = PluginSpecTuple<'@semantic-release/github', SRGithubOptions>

/**
 * @satisfies { readonly PluginSpec[] }
 */
export const defaultPlugins = Object.freeze([
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
  '@semantic-release/npm',
  '@semantic-release/github',
] as const) satisfies readonly PluginSpec[]

// define as const for string literals in type, then...
/** @see baseConfig */
const _baseConfig = {
  /** @see https://semantic-release.gitbook.io/semantic-release/usage/plugins#plugin-options-configuration */
  preset: 'conventionalcommits',
  branches: [
    'main',
    {
      name: 'develop',
      channel: 'develop',
      prerelease: true,
    },
  ],
  plugins: [
    ['@semantic-release/commit-analyzer' as const, {}] satisfies PluginSpec<unknown>,
    ['semantic-release-export-data' as const, {}] satisfies PluginSpec<unknown>,
    ['@semantic-release/release-notes-generator' as const, {}] satisfies PluginSpec<unknown>,
    ['@semantic-release/changelog' as const, {}] satisfies PluginSpec<unknown>,
    ['@semantic-release/git' as const, DefaultOptions] as const satisfies PluginSpecSRGit,
    // Arbitrary shell commands - https://github.com/semantic-release/exec
    // hint: set 'prepareCmd' to`dotnet publish`.
    //   Because this is sorted after @semantic-release / git, the new Git tag will
    //   be visible to dotnet(and GitVersion).Dotnet artifacts will be
    //   versioned accordingly.
    // Plugins' Steps: https://github.com/semantic-release/semantic-release/blob/master/docs/extending/plugins-list.md
    ['@semantic-release/exec' as const, {}] satisfies PluginSpecSRExec,
    [
      '@semantic-release/github' as const,
      {
        addReleases: 'bottom',
        assets: [{
          path: './publish/*',
        }],
      } as const,
    ] as const satisfies PluginSpecSRGithub,
  ] as const,
} as const satisfies Options

// ...assign with deep mutability
/**
 * The base configuration for various Semantic Release scenarios.
 * - Prefers preset "conventionalcommits"
 *   (Conventional-Changelog-ConventionalCommits).
 * - Creates tags and release commits on "main" branch, pre-releases on
 *   "develop" branch in "develop" channel.
 * - Creates GitHub Releases.
 * - Exports the following variables as GitHub Actions outputs:
 *   - "new-release-published": "true" | "false"
 *   - "new-release-version" : string
 *   - "new-release-git-tag" : string
 * - includes default plugins (except `@semantic-release/npm`) and more
 *   - `@semantic-release/commit-analyzer`
 *   - semantic-release-export-data
 *   - `@semantic-release/release-notes-generator`
 *   - `@semantic-release/changelog`
 *   - `@semantic-release/git`
 *     - add modified CHANGELOG.md in release commit
 *   - `@semantic-release/exec`
 *     - does nothing by default. Included for convenience.
 *   - `@semantic-release/github`
 *     - uploads all files from `./publish/*`. This is non-recursive.
 *     - adds a list of links to related release pages (e.g. the release's page on npmjs.com)
 * @satisfies {Options}
 */
export const baseConfig = _baseConfig as DeepWritable<typeof _baseConfig>
/// (OPTIONAL) update static Version strings before Git plugin
// https://github.com/jpoehnelt/semantic-release-replace-plugin
// https://github.com/droidsolutions/semantic-release-update-file
