import { ok, notStrictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GithubNugetRegistryInfo as GHNRI } from '../../src/dotnet/GithubNugetRegistryInfo.js';
import { GitlabNugetRegistryInfo as GLNRI } from '../../src/dotnet/GitlabNugetRegistryInfo.js';
import { NugetRegistryInfo as NRI } from '../../src/dotnet/NugetRegistryInfo.js';
import { getEnvVarValue } from '../../src/utils/env.js';
import { isError } from '../../src/utils/isError.js';
import { DeterministicNupkgCsproj as project } from './MSBuildProject.projects.js';
import { inspect } from 'node:util';
import { execAsync } from '../../src/utils/execAsync.js';

/**
 * If unset, sets env.GITHUB_REPOSITORY_OWNER to "HaloSPV3".
 * @returns the value of env.GITHUB_REPOSITORY_OWNER
 */
function getGHRepoOwner(): string {
  getEnvVarValue('GITHUB_REPOSITORY_OWNER');
  return process.env['GITHUB_REPOSITORY_OWNER'] ??= 'HaloSPV3';
}

/** */
async function trySetCI_PROJECT_ID(): Promise<void> {
  const remoteIsUpstream = await execAsync('git remote get-url origin')
    .then(({ stdout }) => stdout.toLowerCase().includes('halospv3/hce.shared'))
    .catch(() => false);
  if (remoteIsUpstream)
    process.env['CI_PROJECT_ID'] = '70884695';
}

await describe('canPushPackagesToSource resolves when...', { concurrency: false }, async () => {
  await it(
    '...GITHUB_REPOSITORY_OWNER and GH_TOKEN are defined, valid, and can push packages to source ',
    { timeout: 60_000 },
    async (t) => {
      if (process.env['GH_TOKEN'] === 'placeholder')
        delete process.env['GH_TOKEN'];
      if (!getEnvVarValue('GH_TOKEN')) {
        t.skip('GITHUB_TOKEN and GH_TOKEN are unavailable for testing');
        return;
      }

      getGHRepoOwner();
      ok(
        await new GHNRI({ project, tokenEnvVars: ['GH_TOKEN'] })
        // eslint-disable-next-line @typescript-eslint/no-deprecated
          .canPushPackagesToSource,
      );
    });
  await it(
    '...CI_PROJECT_ID is defined and CI_JOB_TOKEN, GITLAB_TOKEN, or GL_TOKEN is defined, valid, and can push packages to source',
    { timeout: 60_000 },
    async (t) => {
      await trySetCI_PROJECT_ID();
      if (process.env['CI_PROJECT_ID'] === 'placeholder')
        delete process.env['CI_PROJECT_ID'];
      if (!getEnvVarValue('CI_PROJECT_ID', { overload: true }))
        t.skip('CI_PROJECT_ID is undefined');
      if (!GLNRI.DefaultGitlabTokenEnvVars.some(key => getEnvVarValue(key) !== undefined))
        t.skip(GLNRI.DefaultGitlabTokenEnvVars.join(', ') + 'are all unavailable for testing.');

      const glnri = new GLNRI({ project });

      ok(
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        await glnri.canPushPackagesToSource,
      );
    });
  await it(
    '...NUGET_TOKEN is defined, valid, and can push packages to source',
    { timeout: 60_000 },
    async (t) => {
      if (!getEnvVarValue('NUGET_TOKEN')) {
        t.skip('NUGET_TOKEN environment variable undefined');
        return;
      }

      ok(
        await new NRI({ project })
        // eslint-disable-next-line @typescript-eslint/no-deprecated
          .canPushPackagesToSource,
      );
    });
});

await describe('canPushPackagesToSource throws when...', { concurrency: false }, async () => {
  const tokenEnvVars = ['INVALID_TOKEN'];
  process.env['INVALID_TOKEN'] = tokenEnvVars[0];

  await it('GHNRI token is invalid', async () => {
    getGHRepoOwner();
    const canPush = await new GHNRI({ project, tokenEnvVars })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .canPushPackagesToSource
      .catch((error: unknown) =>
        isError(error) ? error : new Error(JSON.stringify(error)),
      );
    ok(isError(canPush));
  });
  await it('GLNRI token is invalid', async () => {
    await trySetCI_PROJECT_ID();
    const canPush: true | Error = await new GLNRI({ project, tokenEnvVars })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .canPushPackagesToSource
      .catch(
        (error: unknown) =>
          isError(error)
            ? error
            : new Error(JSON.stringify(error)),
      );
    notStrictEqual(canPush, true);
  });
  await it('NRI token is invalid', async () => {
    const canPush: true | Error = await new NRI({ project, tokenEnvVars })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .canPushPackagesToSource
      .catch((error: unknown) =>
        isError(error)
          ? error
          : new Error(inspect(error, { depth: 3 })),
      );
    ok(isError(canPush));
  });
});
