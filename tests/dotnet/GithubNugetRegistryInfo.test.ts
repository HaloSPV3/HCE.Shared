import { getEnvVarValue } from '@halospv3/hce.shared-config/envUtils'
import { type DotenvConfigOptions } from 'dotenv'
import { deepStrictEqual, notDeepStrictEqual, ok, strictEqual } from 'node:assert/strict'
import { existsSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { env } from 'node:process'
import { describe, it } from 'node:test'
import { DeterministicNupkgCsproj } from './MSBuildProject.test.js'

const dotenvPath = resolve(dirname(dirname(import.meta.dirname)), '.env')
if (!existsSync(dotenvPath))
  writeFileSync(dotenvPath, '')
// @ts-expect-error reference is commented out and awaiting refactoring
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dotenvOptions: DotenvConfigOptions = { path: dotenvPath }

// GHNRI will throw if imported while GITHUB_REPOSITORY_OWNER is unset!
getOwner()
import {
  GithubNugetRegistryInfo as GHNRI,
  GithubNugetRegistryInfoOptions as GHNRIOpts,
} from '../../src/dotnet/GithubNugetRegistryInfo.js'

/**
 * If unset, sets env.GITHUB_REPOSITORY_OWNER to "HaloSPV3".
 * @returns the value of env.GITHUB_REPOSITORY_OWNER
 */
function getOwner(): string {
  return env.GITHUB_REPOSITORY_OWNER ??= (getEnvVarValue('GITHUB_REPOSITORY_OWNER ') ?? 'HaloSPV3')
}

await it('is built', async () => {
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/dotnet/GithubNugetRegistryInfo')), undefined, 2),
    JSON.stringify(Object.entries(await import('../../src/dotnet/GithubNugetRegistryInfo.js')), undefined, 2),
  )
})

await describe('GithubNugetRegistryInfo', async () => {
  await describe('canPushPackagesToUrl', async () => {
    await it('returns true when GITHUB_TOKEN is valid and GITHUB_REPOSITORY_OWNER is defined', async (t) => {
      if (!getEnvVarValue('GITHUB_TOKEN'))
        return t.skip('GITHUB_TOKEN is unavailable for testing')

      if (getEnvVarValue('CI') && !getEnvVarValue('GITHUB_ACTION')?.includes('release'))
        return t.skip()

      getOwner()
      strictEqual(await new GHNRI(GHNRIOpts.from({ project: DeterministicNupkgCsproj })).canPushPackagesToUrl, true)
    })

    await it('throws when GITHUB_TOKEN is invalid', async () => {
      getOwner()
      const tokenEnvVars = ['TOKEN_CANNOT_WRITE']
      process.env['TOKEN_CANNOT_WRITE'] = tokenEnvVars[0]
      const result = await new GHNRI(
        GHNRIOpts.from({
          project: DeterministicNupkgCsproj,
          tokenEnvVars: tokenEnvVars,
        }),
      ).canPushPackagesToUrl.catch(
        reason =>
          reason instanceof Error ? reason : new Error(String(reason)),
      )
      notDeepStrictEqual(result, true)
      ok(result instanceof Error)
    })
  })
})
