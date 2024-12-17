import { getEnvVarValue } from '../../src/envUtils.js'
import { deepStrictEqual, notDeepStrictEqual, strictEqual } from 'node:assert/strict'
import { describe, it } from 'node:test'
import { inspect } from 'node:util'
import { MSBuildProject } from '../../src/dotnet/MSBuildProject.js'
import {
  NugetRegistryInfo as NRI,
  NugetRegistryInfoOptions as NRIOpts,
} from '../../src/dotnet/NugetRegistryInfo.js'
import { resolve } from 'node:path'
import { getOwnPropertyDescriptors, isConstructor } from '../../src/utils/reflection.js'
import { type } from 'arktype'

const goodProject = await MSBuildProject.PackableProjectsToMSBuildProjects([
  resolve(import.meta.dirname, '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj'),
]).then(v => v[0])

await describe('is built', async () => {
  const built = await import('@halospv3/hce.shared-config/dotnet/NugetRegistryInfo')
  const source = await import('../../src/dotnet/NugetRegistryInfo.js')
  await it('has expected keys', () =>
    deepStrictEqual(Object.keys(built), Object.keys(source)),
  )
  await describe('NugetRegistryInfo', async () => {
    await it('serializes to JSON as expected', () => {
      const builtJson = JSON.stringify(built.NugetRegistryInfo)
      const sourceJson = JSON.stringify(source.NugetRegistryInfo)
      deepStrictEqual(builtJson, sourceJson)
    })
    await it('has expected static, instance, and recursed super properties', () => {
      const builtProps = JSON.stringify(getOwnPropertyDescriptors(built.NugetRegistryInfo, true, true))
      const sourceProps = JSON.stringify(getOwnPropertyDescriptors(source.NugetRegistryInfo, true, true))
      deepStrictEqual(builtProps, sourceProps)
    })
    await it('has expected instance type', () => {
      const builtInstance = type.instanceOf(built.NugetRegistryInfo).toJSON().toString()
      const sourceInstance = type.instanceOf(source.NugetRegistryInfo).toJSON().toString()
      deepStrictEqual(builtInstance, sourceInstance)
    })
  })
  await describe('NugetRegistryInfoOptions', async () => {
    await it('serializes to JSON as expected', () =>
      deepStrictEqual(
        built.NugetRegistryInfoOptions.toJSON().toString(),
        source.NugetRegistryInfoOptions.toJSON().toString(),
      ),
    )
  })
  await describe('NugetRegistryInfoOptionsBase', async () =>
    await it('serializes to JSON as expected', () =>
      deepStrictEqual(
        built.NugetRegistryInfoOptionsBase.toJSON().toString(),
        source.NugetRegistryInfoOptionsBase.toJSON().toString(),
      ),
    ),
  )
  await describe('getGithubOutput', async () =>
    await it('serializes to JSON as expected', () =>
      deepStrictEqual(
        JSON.stringify(built.getGithubOutput),
        JSON.stringify(source.getGithubOutput),
      ),
    ),
  )
  await describe('getGithubOutputSync', async () =>
    await it('serializes to JSON as expected', () =>
      deepStrictEqual(
        JSON.stringify(built.getGithubOutputSync),
        JSON.stringify(source.getGithubOutputSync),
      ),
    ),
  )
})

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
        new NRI(NRIOpts({ project: goodProject })).url,
        'https://api.nuget.org/v3/index.json',
      )

      if (predefinedToken)
        process.env.NUGET_TOKEN = predefinedToken
      else
        delete process.env.NUGET_TOKEN
    })

    await it('assigns first argument to url', async () => {
      process.env.NUGET_TOKEN ??= 'placeholder'
      strictEqual(new NRI(NRIOpts({ project: goodProject, url: '' })).url, '')
    })

    await describe('canPushPackagesToUrl', async () => {
      await it('rejects promise if token invalid', async () => {
        process.env.INVALID_TOKEN = 'placeholder'
        const value = await new NRI(
          NRIOpts({
            project: goodProject,
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
              GetProperty: [],
              Targets: ['Pack'],
              GetTargetResult: [],
            },
          ),
        }),
        )

        const canPush = await registryInfo.canPushPackagesToUrl.catch(reason =>
          reason instanceof Error
            ? reason
            : new Error(inspect(reason, { depth: Infinity }))
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

  await describe('resolvedEnvVariable', async () => {
    await it('can be a string', async () => {
      const x = { resolvedEnvVariable: '' } as NRI
      strictEqual(typeof x.resolvedEnvVariable, 'string')
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
