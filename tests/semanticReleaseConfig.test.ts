import type { Options as SRExecOptions } from '@semantic-release/exec';
import type { Options as GitOptions } from '@semantic-release/git';
import type { Options as GithubOptions } from '@semantic-release/github';
import { deepStrictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { PluginSpec } from 'semantic-release';
import { baseConfig, defaultPlugins } from '../src/semanticReleaseConfig.js';
import { DefaultOptions } from '../src/setupGitPluginSpec.js';

import '../src/semantic-release__exec.d.ts';
import '../src/semantic-release__git.d.ts';
import '../src/semantic-release__github.d.ts';

await describe('semanticReleaseConfig', async () => {
  await describe('baseConfig', () => {
    deepStrictEqual(baseConfig, {
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
        [
          '@semantic-release/git',
          DefaultOptions as GitOptions,
        ] satisfies PluginSpec<GitOptions>,
        [
          '@semantic-release/exec',
          {} as SRExecOptions,
        ] satisfies PluginSpec<SRExecOptions>,
        [
          '@semantic-release/github',
          {
            addReleases: 'bottom',
            assets: [
              './publish/*',
              '!./publish/.gitkeep',
            ],
          } as GithubOptions,
        ],
      ],
    } as const);
  });
  await describe('defaultPlugins', async () => {
    await it('is equal to expected const array', () => {
      deepStrictEqual(
        defaultPlugins,
        Object.freeze([
          '@semantic-release/commit-analyzer',
          '@semantic-release/release-notes-generator',
          '@semantic-release/npm',
          '@semantic-release/github',
        ] as const),
      );
    });
  });
});
