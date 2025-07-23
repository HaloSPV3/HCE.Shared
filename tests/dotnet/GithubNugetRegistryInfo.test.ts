import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  DefaultGithubTokenEnvVars,
  GithubNugetRegistryInfo as GHNRI,
  GHNRIOpts,
} from '../../src/dotnet/GithubNugetRegistryInfo.js';
import { getEnvVarValue } from '../../src/utils/env.js';

/**
 * If unset, sets env.GITHUB_REPOSITORY_OWNER to "HaloSPV3".
 * @returns the value of env.GITHUB_REPOSITORY_OWNER
 */
function getOwner(): string {
  const key = 'GITHUB_REPOSITORY_OWNER';
  const owner = getEnvVarValue(key);
  return process.env[key] = owner ?? 'HaloSPV3';
}

await describe('DefaultGithubTokenEnvVars', async () => {
  await it('has expected value', () => {
    deepStrictEqual(
      DefaultGithubTokenEnvVars,
      Object.freeze(['GH_TOKEN', 'GITHUB_TOKEN'] as const),
    );
  });
});

await describe('GithubNugetRegistryInfo', { concurrency: 1 }, async () => {
  await it('NUGET_PKG_GITHUB_COM', () => {
    strictEqual(
      GHNRI.NUGET_PKG_GITHUB_COM,
      'https://nuget.pkg.github.com',
    );
  });
  await it('GHNRI.getNugetGitHubUrl', () => {
    const owner = getOwner();
    strictEqual(
      GHNRI.getNugetGitHubUrl(),
      `${GHNRI.NUGET_PKG_GITHUB_COM}/${owner}/index.json`,
    );
  });
});

await describe(
  'InstanceOf GithubNugetRegistryInfo',
  async () => {
    await it('canPushPackagesToSource', { skip: 'See ./DotnetNugetPush.test.ts' });
  },
);

await describe('GHNRIOpts', async () => {
  const owner = getOwner();
  const opts = GHNRIOpts.omit('project').from({});
  await it('defaults to expected source', () => {
    strictEqual(opts.source, `https://nuget.pkg.github.com/${owner}/index.json`);
  });
  await it('defaults tokenEnvVars', () => {
    deepStrictEqual(opts.tokenEnvVars, Object.freeze(['GH_TOKEN', 'GITHUB_TOKEN'] as const));
  });
});
