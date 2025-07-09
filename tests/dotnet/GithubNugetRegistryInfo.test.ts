import { notDeepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isNativeError } from 'node:util/types';
import {
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

await describe('GithubNugetRegistryInfo', { concurrency: 1 }, async () => {
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js');

  await describe('canPushPackagesToSource', async () => {
    await it('returns true when GITHUB_TOKEN is valid and GITHUB_REPOSITORY_OWNER is defined', async (t) => {
      if (!getEnvVarValue('GITHUB_TOKEN')) {
        t.skip('GITHUB_TOKEN is unavailable for testing');
        return;
      }

      if (
        getEnvVarValue('CI')
        && !getEnvVarValue('GITHUB_ACTION')?.includes('release')
      ) {
        t.skip();
        return;
      }

      getOwner();
      strictEqual(
        await new GHNRI({ project: DeterministicNupkgCsproj })
        // eslint-disable-next-line @typescript-eslint/no-deprecated
          .canPushPackagesToSource,
        true,
      );
    });

    await it('throws when GITHUB_TOKEN is invalid', async () => {
      getOwner();
      const tokenEnvVars = ['TOKEN_CANNOT_WRITE'];
      process.env['TOKEN_CANNOT_WRITE'] = tokenEnvVars[0];
      const result = await new GHNRI({
        project: DeterministicNupkgCsproj,
        tokenEnvVars: tokenEnvVars,
      })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
        .canPushPackagesToSource.catch((error: unknown) =>
          isNativeError(error) ? error : new Error(JSON.stringify(error)),
        );
      notDeepStrictEqual(result, true);
      ok(isNativeError(result));
    });
  });
});
