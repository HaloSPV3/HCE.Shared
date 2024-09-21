import type { Options as SRExecOptions } from '@semantic-release/exec'
import type { Options as GitOptions } from '@semantic-release/git'
import type { Options as GithubOptions } from '@semantic-release/github'
import type { Options, PluginSpec } from 'semantic-release'
import { DefaultOptions } from './setupGitPluginSpec.js'

/**
 * @satisfies { PluginSpec[] }
 */
export const defaultPlugins = [
  '@semantic-release/commit-analyzer',
  '@semantic-release/release-notes-generator',
  '@semantic-release/npm',
  '@semantic-release/github',
] satisfies readonly PluginSpec[]

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
    ['@semantic-release/git', DefaultOptions as GitOptions] satisfies PluginSpec<GitOptions>,
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
      } as GithubOptions,
    ] satisfies PluginSpec<GithubOptions>,
  ],
} satisfies Options

/// (OPTIONAL) update static Version strings before Git plugin
// https://github.com/jpoehnelt/semantic-release-replace-plugin
// https://github.com/droidsolutions/semantic-release-update-file
