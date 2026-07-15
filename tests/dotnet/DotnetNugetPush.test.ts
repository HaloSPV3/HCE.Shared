import { notStrictEqual, ok } from 'node:assert/strict';
import * as process from 'node:process';
import { describe, it } from 'node:test';
import { inspect } from 'node:util';
import { GithubNugetRegistryInfo as GHNRI } from '../../src/dotnet/GithubNugetRegistryInfo.ts';
import { GitlabNugetRegistryInfo as GLNRI } from '../../src/dotnet/GitlabNugetRegistryInfo.ts';
import { NugetRegistryInfo as NRI } from '../../src/dotnet/NugetRegistryInfo.ts';
import { getEnvVarValue as getEnvironmentVariableValue } from '../../src/utils/env.ts';
import { execAsync } from '../../src/utils/execAsync.ts';
import { isError } from '../../src/utils/isError.ts';
import { DeterministicNupkgCsproj as project } from './MSBuildProject.projects.ts';

/**
 * If unset, sets env.GITHUB_REPOSITORY_OWNER to "HaloSPV3".
 * @returns the value of env.GITHUB_REPOSITORY_OWNER
 */
function getGHRepoOwner(): string {
  getEnvironmentVariableValue('GITHUB_REPOSITORY_OWNER');
  return process.env['GITHUB_REPOSITORY_OWNER'] ??= 'HaloSPV3';
}

/** */
async function trySetCI_PROJECT_ID(): Promise<void> {
  let isRemoteUpstream = false;
  try {
    const { stdout } = await execAsync('git remote get-url origin');
    isRemoteUpstream = stdout.toLowerCase().includes('halospv3/hce.shared');
  }
  catch { /* empty */ }
  if (isRemoteUpstream)
    process.env['CI_PROJECT_ID'] = '70884695';
}

await describe('canPushPackagesToSource resolves when...', { concurrency: true }, async () => {
  await it(
    '...GITHUB_REPOSITORY_OWNER and GH_TOKEN are defined, valid, and can push packages to source ',
    { timeout: 10_000 },
    async (t) => {
      if (process.env['GH_TOKEN'] === 'placeholder')
        delete process.env['GH_TOKEN'];
      if (!getEnvironmentVariableValue('GH_TOKEN')) {
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
    { timeout: 10_000 },
    async (t) => {
      await trySetCI_PROJECT_ID();
      if (process.env['CI_PROJECT_ID'] === 'placeholder')
        delete process.env['CI_PROJECT_ID'];
      if (!getEnvironmentVariableValue('CI_PROJECT_ID', { overload: true }))
        t.skip('CI_PROJECT_ID is undefined');
      if (GLNRI.DefaultGitlabTokenEnvVars.every(key => getEnvironmentVariableValue(key) === undefined)) {
        t.skip(GLNRI.DefaultGitlabTokenEnvVars.join(', ') + ' are all unavailable for testing.');
        return;
      }

      const glnri = new GLNRI({ project });

      ok(
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        await glnri.canPushPackagesToSource,
      );
    });
  await it(
    '...NUGET_TOKEN is defined, valid, and can push packages to source',
    { timeout: 10_000 },
    async (t) => {
      if (!getEnvironmentVariableValue('NUGET_TOKEN')) {
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

await describe('canPushPackagesToSource throws when...', { concurrency: true }, async () => {
  const tokenEnvironmentVariables = ['INVALID_TOKEN'];
  process.env['INVALID_TOKEN'] = tokenEnvironmentVariables[0];

  await it('GLNRI token is invalid', { timeout: 10_000 }, async () => {
    await trySetCI_PROJECT_ID();
    // eslint-disable-next-line unicorn/consistent-boolean-name
    let canPush: true | Error;
    try {
      canPush = await new GLNRI({ project, tokenEnvVars: tokenEnvironmentVariables })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
        .canPushPackagesToSource;
    }
    catch (error) {
      canPush = isError(error)
        ? error
        : new Error(JSON.stringify(error));
    }

    notStrictEqual(canPush, true);
  });
  await it('NRI token is invalid', { timeout: 10_000 }, async () => {
    // eslint-disable-next-line unicorn/consistent-boolean-name
    let canPush: true | Error;
    try {
      canPush = await new NRI({ project, tokenEnvVars: tokenEnvironmentVariables })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
        .canPushPackagesToSource;
    }
    catch (error) {
      canPush = isError(error)
        ? error
        : new Error(inspect(error, { depth: 3 }));
    }
    ok(isError(canPush));
  });
  await it('GHNRI token is invalid', { timeout: 10_000 }, async () => {
    getGHRepoOwner();
    // eslint-disable-next-line unicorn/consistent-boolean-name
    let canPush: true | Error;
    try {
      canPush = await new GHNRI({ project, tokenEnvVars: tokenEnvironmentVariables })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
        .canPushPackagesToSource;
    }
    catch (error: unknown) {
      canPush = isError(error)
        ? error
        : new Error(JSON.stringify(error));
    };
    notStrictEqual(canPush, true);
  });
});
