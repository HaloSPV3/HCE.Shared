import type { Options as SRExecOptions } from '@semantic-release/exec'
import type { Options as SRGitOptions } from '@semantic-release/git'
import type { Options as SRGithubOptions } from '@semantic-release/github'
import type { Options, PluginSpec } from 'semantic-release'
import { DefaultOptions } from './setupGitPluginSpec.js'

/**
 * @satisfies { readonly PluginSpec[] }
 */
export const defaultPlugins = Object.freeze([
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
  '@semantic-release/npm',
  '@semantic-release/github',
] as const) satisfies readonly PluginSpec[]

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
 *
 * @satisfies {Options}
 */
export const baseConfig = {
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
    ['@semantic-release/commit-analyzer', {}],
    ['semantic-release-export-data', {}],
    ['@semantic-release/release-notes-generator', {}],
    ['@semantic-release/changelog', {}],
    ['@semantic-release/git', DefaultOptions as SRGitOptions] satisfies PluginSpec<SRGitOptions>,
    // Arbitrary shell commands - https://github.com/semantic-release/exec
    // hint: set 'prepareCmd' to`dotnet publish`.
    //   Because this is sorted after @semantic-release / git, the new Git tag will
    //   be visible to dotnet(and GitVersion).Dotnet artifacts will be
    //   versioned accordingly.
    // Plugins' Steps: https://github.com/semantic-release/semantic-release/blob/master/docs/extending/plugins-list.md
    ['@semantic-release/exec', {} as SRExecOptions] satisfies PluginSpec<SRExecOptions>,
    ['@semantic-release/github',
      {
        addReleases: 'bottom',
        assets: [{
          path: './publish/*',
        }],
      } as SRGithubOptions,
    ] satisfies PluginSpec<SRGithubOptions>,
  ] as (
    PluginSpec<unknown> |
    PluginSpec<SRGitOptions> |
    PluginSpec<SRExecOptions> |
    PluginSpec<SRGithubOptions>
  )[],
} as const satisfies Options

/// (OPTIONAL) update static Version strings before Git plugin
// https://github.com/jpoehnelt/semantic-release-replace-plugin
// https://github.com/droidsolutions/semantic-release-update-file
