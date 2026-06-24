import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import * as process from 'node:process';
import { describe, it } from 'node:test';
import {
  DefaultGithubTokenEnvVars as DefaultGithubTokenEnvironmentVariables,
  GithubNugetRegistryInfo as GHNRI,
  GHNRIOpts as GHNRIOptions,
} from '../../src/dotnet/GithubNugetRegistryInfo.ts';
import { getEnvVarValue as getEnvironmentVariableValue } from '../../src/utils/env.ts';

/**
 * If unset, sets env.GITHUB_REPOSITORY_OWNER to "HaloSPV3".
 * @returns the value of env.GITHUB_REPOSITORY_OWNER
 */
function getOwner(): string {
  const key = 'GITHUB_REPOSITORY_OWNER';
  const owner = getEnvironmentVariableValue(key);
  return process.env[key] = owner ?? 'HaloSPV3';
}

await describe('DefaultGithubTokenEnvVars', async () => {
  await it('has expected value', () => {
    deepStrictEqual(
      DefaultGithubTokenEnvironmentVariables,
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
  const options = GHNRIOptions.omit('project').from({});
  await it('defaults to expected source', () => {
    strictEqual(options.source, `https://nuget.pkg.github.com/${owner}/index.json`);
  });
  await it('defaults tokenEnvVars', () => {
    deepStrictEqual(options.tokenEnvVars, Object.freeze(['GH_TOKEN', 'GITHUB_TOKEN'] as const));
  });
});
