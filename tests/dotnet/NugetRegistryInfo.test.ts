import { getEnvVarValue } from '../../src/envUtils.js'
import { deepStrictEqual, notDeepStrictEqual, strictEqual } from 'node:assert/strict'
import { describe, it, todo } from 'node:test'
import { inspect } from 'node:util'
import { MSBuildProject } from '@halospv3/hce.shared-config/dotnet/MSBuildProject'
import {
  NugetRegistryInfo as NRI,
  NugetRegistryInfoOptions as NRIOpts,
} from '@halospv3/hce.shared-config/dotnet/NugetRegistryInfo'
import { resolve } from 'node:path'
import { getOwnPropertyDescriptors, isConstructor } from '@halospv3/hce.shared-config/utils/reflection'
import { type } from 'arktype'
import { GetNPPGetterNames } from '@halospv3/hce.shared-config/dotnet/NugetProjectProperties'

// No 'is built'. Checking classes and functions for equality is too complicated without reflection like .NET's

await describe('NugetRegistryInfo', async (ctx0) => {
  await it('is a class', async () => {
    deepStrictEqual(isConstructor(NRI), true)
  })

  await it('has expected name', async () => {
    deepStrictEqual(NRI.name, ctx0.name)
  })

  await describe('an instance of NugetRegistryInfo...', async () => {
    const predefinedToken = getEnvVarValue('NUGET_TOKEN')
    const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js')

    await it('defaults url to expected value', async () => {
      process.env.NUGET_TOKEN ??= predefinedToken ?? 'placeholder'

      strictEqual(
        new NRI(NRIOpts({ project: DeterministicNupkgCsproj })).url,
        'https://api.nuget.org/v3/index.json',
      )

      if (predefinedToken)
        process.env.NUGET_TOKEN = predefinedToken
      else
        delete process.env.NUGET_TOKEN
    })

    await describe('canPushPackagesToUrl', async () => {
      await it('rejects promise if token invalid', async () => {
        process.env.INVALID_TOKEN = 'placeholder'
        const value = await new NRI(
          NRIOpts({
            project: DeterministicNupkgCsproj,
            tokenEnvVars: ['INVALID_TOKEN'],
          }),
        ).canPushPackagesToUrl
          .catch(async reason =>
            reason instanceof Error ? reason : new Error(String(reason)))
        if (value === true)
          return notDeepStrictEqual(value, true)
        strictEqual('message' in value, true)
        strictEqual('name' in value, true)
      })

      await it('resolves when token is defined, valid, and can push packages to url', async (t) => {
        if (!predefinedToken)
          return t.skip('NUGET_TOKEN environment variable undefined')

        const registryInfo = new NRI(NRIOpts({
          project: await MSBuildProject.Evaluate(
            {
              FullName: resolve(import.meta.dirname, '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj'),
              Property: {
                Version: '0.0.1-DUMMY',
              },
              GetItem: [],
              GetProperty: GetNPPGetterNames(true, true),
              Targets: ['Pack'],
              GetTargetResult: [],
            },
          ),
        }))

        const canPush = await registryInfo.canPushPackagesToUrl.catch(reason =>
          reason instanceof Error
            ? reason
            : new Error(inspect(reason, { depth: 3 })),
        )

        deepStrictEqual(canPush, true)
      })
    })
  })

  await describe('canPushPackagesToUrl', (ctx1) => {
    it('exists in NugetRegistryInfo prototype', async () => {
      strictEqual(ctx1.name in NRI.prototype, true)
    })

    it('returns Promise<true>', async () => {
      const x = await (Promise.resolve(true) as typeof NRI.prototype.canPushPackagesToUrl)
      strictEqual(x, true)
    })
  })

  await describe('resolvedEnvVariable', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', () => {
      strictEqual(ctx1.name in NRI.prototype, true)
    })
    await todo('is a string')
  })

  await describe('url', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', async () => {
      strictEqual(ctx1.name in NRI.prototype, true)
    })
    await todo('is a string')

    // is string?
    // const getter = getOwnPropertyDescriptors(NRI, true, false).flatMap(v => v['url']).at(0)
    // strictEqual(typeof getter?.get., 'string')

    // This does not work. It is "any" with a value of "undefined"
    // await it("is a string", async () => {
    //     strictEqual(typeof NugetRegistryInfo.prototype.url, "string")
    // })
  })
})
