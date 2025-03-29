import { getEnvVarValue } from '../../src/utils/env.js';
import { notDeepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from 'node:process';
import { describe, it } from 'node:test';
import { isNativeError } from 'node:util/types';
import { DeterministicNupkgCsproj } from './MSBuildProject.projects.js';

/**
 * If unset, sets env.GITHUB_REPOSITORY_OWNER to "HaloSPV3".
 * @returns the value of env.GITHUB_REPOSITORY_OWNER
 */
function getOwner(): string {
  return (env['GITHUB_REPOSITORY_OWNER'] ??= (getEnvVarValue('GITHUB_REPOSITORY_OWNER ') ?? 'HaloSPV3'));
}
const dotenvPath = resolve(dirname(dirname(import.meta.dirname)), '.env');
if (!existsSync(dotenvPath))
  writeFileSync(dotenvPath, '');

// GHNRI will throw if imported while GITHUB_REPOSITORY_OWNER is unset!
getOwner();
const GHNRI = (await import ('../../src/dotnet/GithubNugetRegistryInfo.js')).GithubNugetRegistryInfo;

await describe('GithubNugetRegistryInfo', async () => {
  await describe('canPushPackagesToUrl', async () => {
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
        // @ts-expect-error Is deprecated
        // eslint-disable-next-line @typescript-eslint/no-deprecated
          .canPushPackagesToUrl,
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
      // @ts-expect-error Is deprecated
      // eslint-disable-next-line @typescript-eslint/no-deprecated
        .canPushPackagesToUrl.catch((reason: unknown) =>
          isNativeError(reason) ? reason : new Error(String(reason)),
        );
      notDeepStrictEqual(result, true);
      ok(isNativeError(result));
    });
  });
});
