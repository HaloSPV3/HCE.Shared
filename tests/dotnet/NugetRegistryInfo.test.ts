import { getEnvVarValue } from '../../src/envUtils.js'
import { deepStrictEqual, notDeepStrictEqual, strictEqual } from 'node:assert/strict'
import { describe, it, todo } from 'node:test'
import { inspect } from 'node:util'
import {
  NugetRegistryInfo as NRI,
  NugetRegistryInfoOptionsBase as NRIOptsBase,
  getGithubOutput,
  getGithubOutputSync,
} from '../../src/dotnet/NugetRegistryInfo.js'
import { isConstructor } from '../../src/utils/reflection.js'

// No 'is built'. Checking classes and functions for equality is too complicated without reflection like .NET's

await describe('NugetRegistryInfo', async (ctx0) => {
  await it('is a class', async () => {
    deepStrictEqual(isConstructor(NRI), true)
  })

  await it('has expected name', async () => {
    deepStrictEqual(NRI.name, ctx0.name)
  })

  await describe('canPushPackagesToUrl', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', () => {
      strictEqual(ctx1.name in NRI.prototype, true)
    })

    await it('returns Promise<true>', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const x = await (Promise.resolve(true) as typeof NRI.prototype['canPushPackagesToUrl'])
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
    await it('exists in NugetRegistryInfo prototype', () => {
      strictEqual(ctx1.name in NRI.prototype, true)
    })
    await todo('is a string')
  })
})

// memory leak...but why?
await describe('InstanceOf NugetRegistryInfo', async () => {
  const predefinedToken = getEnvVarValue('NUGET_TOKEN')
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js')

  await it('defaults url to expected value', async () => {
    process.env.NUGET_TOKEN ??= predefinedToken ?? 'placeholder'

    strictEqual(
      new NRI({ project: DeterministicNupkgCsproj }).url,
      'https://api.nuget.org/v3/index.json',
    )

    if (predefinedToken)
      process.env.NUGET_TOKEN = predefinedToken
    else
      delete process.env.NUGET_TOKEN
  })

  // connor4312.nodejs-testing for VSCode dislikes nested Describe
  await it('canPushPackagesToUrl', async () => {
    await it('rejects promise if token invalid', async () => {
      process.env.INVALID_TOKEN = 'placeholder'
      const value = await new NRI({
        project: DeterministicNupkgCsproj,
        tokenEnvVars: ['INVALID_TOKEN'],
      })['canPushPackagesToUrl']
        .catch((reason: unknown) =>
          reason instanceof Error
            ? reason
            : new Error(String(reason)),
        )
      if (value === true) return notDeepStrictEqual(value, true)
      strictEqual('message' in value, true)
      strictEqual('name' in value, true)
    })

    await it('resolves when token is defined, valid, and can push packages to url', async (t) => {
      if (!predefinedToken) return t.skip('NUGET_TOKEN environment variable undefined')

      const registryInfo = new NRI(({
        project: DeterministicNupkgCsproj,
      }))

      // todo: refactor canPushPackagesToUrl away from static dummy
      const canPush = await registryInfo['canPushPackagesToUrl'].catch((reason: unknown) => {
        if (!(reason instanceof Error))
          return new Error(inspect(reason, { depth: 3 }));
        else if ('stderr' in reason && typeof reason.stderr === 'string') {
          reason.message = reason.message.concat(
            '\nSTDERR:\n',
            `  ${reason.stderr.replaceAll('\n', '\n  ')}`,
          );
        }

        return reason
      })

      deepStrictEqual(canPush, true)
    })
  })
})

await describe('NRIOptsBase', async () => {
  await it('has expected props', async () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.props, undefined, 2),
      `[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  },
  {
    "key": "url",
    "value": "string"
  }
]`,
    )
  })
  await it('has expected props (In)', async () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.in.props, undefined, 2),
      `[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  },
  {
    "key": "url",
    "value": "string"
  }
]`,
    )
  })
  await it('has expected props (Out)', async () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.out.props, undefined, 2),
      `[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  },
  {
    "key": "url",
    "value": "string"
  }
]`,
    )
  })
})

await describe('getGithubOutput', async (ctx0) => {
  await it('has expected name', () => strictEqual(getGithubOutput.name, ctx0.name))
})

await describe('getGithubOutputSync', async (ctx0) => {
  await it('has expected name', () => strictEqual(getGithubOutputSync.name, ctx0.name))
})
