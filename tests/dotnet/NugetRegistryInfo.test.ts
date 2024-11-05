import { nugetDefault } from '@halospv3/hce.shared-config/dotnet/dotnetHelpers'
import { getEnvVarValue } from '../../src/envUtils.js'
import { deepStrictEqual, notDeepStrictEqual, strictEqual } from 'node:assert/strict'
import { describe, it } from 'node:test'
import { inspect } from 'node:util'
import { MSBuildProject } from '../../src/dotnet/MSBuildProject.js'
import { NugetRegistryInfo as NRI } from '../../src/dotnet/NugetRegistryInfo.js'
import { resolve } from 'node:path'
import { isConstructor } from '../../src/utils/reflection.js'

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/dotnet/NugetRegistryInfo'))),
    JSON.stringify(Object.entries(await import('../../src/dotnet/NugetRegistryInfo.js'))),
  ),
)

await describe('NugetRegistryInfo', async (ctx0) => {
  await it('is a class', async () => {
    deepStrictEqual(isConstructor(NRI), true)
  })

  await it('has expected name', async () => {
    deepStrictEqual(NRI.name, ctx0.name)
  })

  await describe('an instance of NugetRegistryInfo...', async () => {
    const predefinedToken = getEnvVarValue('NUGET_TOKEN')

    await it('defaults url to expected value', async () => {
      process.env.NUGET_TOKEN ??= predefinedToken ?? 'placeholder'

      strictEqual(
        new NRI(
          undefined,
          undefined,
          MSBuildProject.prototype,
        ).url,
        'https://api.nuget.org/v3/index.json',
      )

      if (predefinedToken)
        process.env.NUGET_TOKEN = predefinedToken
      else
        delete process.env.NUGET_TOKEN
    })

    await it('assigns first argument to url', async () => {
      process.env.NUGET_TOKEN ??= 'placeholder'
      strictEqual(new NRI('', undefined, MSBuildProject.prototype).url, '')
    })

    await describe('canPushPackagesToUrl', async () => {
      await it('rejects promise if token invalid', async () => {
        process.env.INVALID_TOKEN = 'placeholder'
        const value = await new NRI(nugetDefault.url, ['INVALID_TOKEN'], MSBuildProject.prototype)
          .canPushPackagesToUrl
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

        const registryInfo = new NRI(
          undefined,
          undefined,
          await MSBuildProject.Evaluate(
            {
              FullName: resolve(import.meta.dirname, '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj'),
              Property: {
                Version: '0.0.1-DUMMY',
              },
              GetItem: [],
              GetProperty: [],
              Targets: ['Pack'],
              GetTargetResult: [],
            },
          ),
        )

        const canPush = await registryInfo.canPushPackagesToUrl.catch((reason) => {
          return (reason instanceof Error)
            ? reason
            : new Error(inspect(reason, { depth: Infinity }))
        })

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

  await describe('resolvedEnvVariable', async () => {
    await it('can be a string', async () => {
      const x = { resolvedEnvVariable: '' } as NRI
      strictEqual(typeof x.resolvedEnvVariable, 'string')
    })
  })

  await describe('toRegistryPair', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', async () => {
      strictEqual(ctx1.name in NRI.prototype, true)
    })

    await it('is a function', async () => {
      strictEqual(typeof NRI.prototype.toRegistryPair, 'function')
    })

    await it('returns Promise<NugetRegistryPair>', async () => {
      const x = Promise.resolve({
        tokenEnvVar: '',
        url: '',
        user: '',
      }) as ReturnType<typeof NRI.prototype.toRegistryPair>

      deepStrictEqual(
        await x,
        {
          tokenEnvVar: '',
          url: '',
          user: '',
        },
      )
    })
  })

  await describe('url', async (ctx1) => {
    await it('undefined in NugetRegistryInfo prototype', async () => {
      strictEqual(ctx1.name in NRI.prototype, false)
      strictEqual(NRI.prototype.url, undefined)
    })

    // This does not work. It is "any" with a value of "undefined"
    // await it("is a string", async () => {
    //     strictEqual(typeof NugetRegistryInfo.prototype.url, "string")
    // })
  })
})
