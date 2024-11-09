import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict'
import { describe, it, todo } from 'node:test'
import {
  GitlabNugetRegistryInfo,
  GitlabNugetRegistryInfoOptions as GLNRIOpts,
} from '../../src/dotnet/GitlabNugetRegistryInfo.js'
import { getEnv, getEnvVarValue } from '../../src/envUtils.js'
import { DeterministicNupkgCsproj } from './MSBuildProject.test.js'

await it('is built', async () => {
  if (!getEnvVarValue('CI_JOB_TOKEN'))
    process.env.CI_JOB_TOKEN = 'placeholder'
  if (!getEnvVarValue('CI_PROJECT_ID'))
    process.env.CI_PROJECT_ID = 'placeholder'

  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/dotnet/GitlabNugetRegistryInfo')), undefined, 2),
    JSON.stringify(Object.entries(await import('../../src/dotnet/GitlabNugetRegistryInfo.js')), undefined, 2),
  )
})

await describe('GitlabNugetRegistryInfo', async (ctx0) => {
  await it('has expected name', async () => {
    strictEqual(GitlabNugetRegistryInfo.name, ctx0.name)
  })

  await describe('an instance of GitlabNugetRegistryInfo', async (ctx1) => {
    ok(ctx1)

    if (!getEnvVarValue('CI_JOB_TOKEN'))
      process.env.CI_JOB_TOKEN = 'placeholder'
    if (!getEnvVarValue('CI_PROJECT_ID'))
      process.env.CI_PROJECT_ID = 'placeholder'
    const defaultWithPlaceholders = new GitlabNugetRegistryInfo(GLNRIOpts.from({ project: DeterministicNupkgCsproj }))

    await it('defaults to project-level endpoint', async () => {
      if (!getEnvVarValue('CI_PROJECT_ID'))
        process.env.CI_PROJECT_ID = 'placeholder'
      if (!getEnvVarValue('CI_JOB_TOKEN'))
        process.env.CI_JOB_TOKEN = 'placeholder'
      const expected = `${GitlabNugetRegistryInfo.CI_API_V4_URL}/projects/${GitlabNugetRegistryInfo.projectId}/packages/nuget/index.json`
      strictEqual(new GitlabNugetRegistryInfo(GLNRIOpts.from({ project: DeterministicNupkgCsproj })).url, expected)
    })

    await it('can be configured to use group-level endpoint', async () => {
      if (!getEnvVarValue('CI_PROJECT_NAMESPACE_ID'))
        process.env.CI_PROJECT_NAMESPACE_ID = 'placeholder'
      if (!getEnvVarValue('CI_JOB_TOKEN'))
        process.env.CI_JOB_TOKEN = 'placeholder'
      const expected = `${GitlabNugetRegistryInfo.CI_API_V4_URL}/groups/${GitlabNugetRegistryInfo.ownerId}/-/packages/nuget/index.json`
      strictEqual(
        new GitlabNugetRegistryInfo(GLNRIOpts.from({
          project: DeterministicNupkgCsproj,
          url: 'group',
        })).url,
        expected,
      )
    })

    await it('throws if default values and no token available', async (t) => {
      const { CI_JOB_TOKEN, GL_TOKEN, GITLAB_TOKEN } = getEnv()
      delete process.env.CI_JOB_TOKEN
      delete process.env.GL_TOKEN
      delete process.env.GITLAB_TOKEN
      if (getEnvVarValue('CI_JOB_TOKEN') || getEnvVarValue('GL_TOKEN') || getEnvVarValue('GITLAB_TOKEN'))
        return t.skip('one or more tokens (CI_JOB_TOKEN, GL_TOKEN, GITLAB_TOKEN) is defined in .env file')

      let value: GitlabNugetRegistryInfo | Error
      try {
        value = new GitlabNugetRegistryInfo(GLNRIOpts.from({ project: DeterministicNupkgCsproj }))
      }
      catch (err) {
        value = err instanceof Error ? err : new Error(String(err))
      }

      ok(value instanceof Error)

      if (CI_JOB_TOKEN)
        process.env.CI_JOB_TOKEN = CI_JOB_TOKEN
      if (GL_TOKEN)
        process.env.GL_TOKEN = GL_TOKEN
      if (GITLAB_TOKEN)
        process.env.GITLAB_TOKEN = GITLAB_TOKEN
    })

    await it('throws when custom values and no token available', async () => {
      let value: GitlabNugetRegistryInfo | Error
      try {
        value = new GitlabNugetRegistryInfo(GLNRIOpts.from({
          project: DeterministicNupkgCsproj,
          tokenEnvVars: [
            'UNDEFINED_TOKEN',
            'ANOTHER_UNDEFINED_TOKEN',
          ],
        }))
      }
      catch (err) {
        value = err instanceof Error ? err : new Error(String(err))
      }
      ok(value instanceof Error)
    })

    await describe('canPushPackagesToUrl', async (ctx2) => {
      await it('has expected name', async () => {
        ok(ctx2.name in defaultWithPlaceholders)
      })

      await todo('can...uhhhh...Sorry. Brainrot.')
    })

    await describe('resolvedEnvVariable', async (ctx2) => {
      await it('has expected name', async () => {
        ok(ctx2.name in defaultWithPlaceholders)
      })

      await it('is a string', async () => {
        strictEqual(typeof defaultWithPlaceholders.resolvedEnvVariable, 'string')
      })
    })

    /* await describe("toRegistryPair", async (ctx2) => {
      await it("has expected name", async () => {
        ok(ctx2.name in defaultWithPlaceholders);
      });
    }); */

    await describe('url', async (ctx2) => {
      await it('has expected name', async () => {
        ok(ctx2.name in defaultWithPlaceholders)
      })

      await it('is a string', async () => {
        strictEqual(typeof defaultWithPlaceholders.url, 'string')
      })
    })

    /**
     * value.toRegistryPair
     * value.url
     */
  })

  await describe('CI_API_V4_URL', async (ctx1) => {
    const expectedValue = 'https://gitlab.com/api/v4'

    await it('has expected name', async () => {
      ok(ctx1.name in GitlabNugetRegistryInfo)
    })

    await it('has the correct default value if the environment variable is undefined', async () => {
      delete process.env.CI_API_V4_URL
      strictEqual(GitlabNugetRegistryInfo.CI_API_V4_URL, expectedValue)
    })

    // await it("has the correct value the value is provided by the environment variable")
  })

  await describe('groupUrl', async (ctx1) => {
    await it('has expected name', async () => {
      ok(ctx1.name in GitlabNugetRegistryInfo)
    })

    await it('returns the expected url when CI_PROJECT_NAMESPACE_ID is defined', async () => {
      process.env.CI_PROJECT_NAMESPACE_ID = 'placeholder'
      strictEqual(
        GitlabNugetRegistryInfo.groupUrl,
        `${GitlabNugetRegistryInfo.CI_API_V4_URL}/groups/${GitlabNugetRegistryInfo.ownerId}/-/packages/nuget/index.json`,
      )
    })
  })

  await describe('projectUrl', async (ctx1) => {
    await it('has expected name', async () => {
      ok(ctx1.name in GitlabNugetRegistryInfo)
    })

    await it('returns the expected url when CI_PROJECT_ID is defined', async () => {
      if (!getEnvVarValue('CI_PROJECT_ID'))
        process.env.CI_PROJECT_ID = 'placeholder'
      strictEqual(
        GitlabNugetRegistryInfo.projectUrl,
        `${GitlabNugetRegistryInfo.CI_API_V4_URL}/projects/${GitlabNugetRegistryInfo.projectId}/packages/nuget/index.json`,
      )
    })
  })

  await describe('ownerId', async (ctx1) => {
    await it('has expected name', async () => {
      ok(ctx1.name in GitlabNugetRegistryInfo)
    })

    await it('returns undefined if CI_PROJECT_NAMESPACE_ID is undefined', async (t) => {
      delete process.env.CI_PROJECT_NAMESPACE_ID
      if (getEnvVarValue('CI_PROJECT_NAMESPACE_ID'))
        return t.skip('This test requires CI_PROJECT_NAMESPACE_ID be undefined. It is defined in .env file and so it is too annoying to work around.')
      strictEqual(GitlabNugetRegistryInfo.ownerId, undefined)
    })

    await it('returns string if CI_PROJECT_NAMESPACE_ID is defined', async () => {
      if (!getEnvVarValue('CI_PROJECT_NAMESPACE_ID'))
        process.env.CI_PROJECT_NAMESPACE_ID = 'placeholder'
      strictEqual(GitlabNugetRegistryInfo.ownerId, process.env.CI_PROJECT_NAMESPACE_ID)
    })
  })

  await describe('projectId', async (ctx1) => {
    await it('has expected name', async () => {
      ok(ctx1.name in GitlabNugetRegistryInfo)
    })

    await it('returns undefined if CI_PROJECT_ID is undefined', async (t) => {
      delete process.env.CI_PROJECT_ID
      if (getEnvVarValue('CI_PROJECT_ID'))
        return t.skip('This test requires CI_PROJECT_ID be undefined. It is defined in .env file and so it is too annoying to work around.')
      strictEqual(GitlabNugetRegistryInfo.projectId, undefined)
    })

    await it('returns string if CI_PROJECT_ID is defined', async () => {
      if (!getEnvVarValue('CI_PROJECT_ID'))
        process.env.CI_PROJECT_ID = 'placeholder'
      strictEqual(GitlabNugetRegistryInfo.projectId, process.env.CI_PROJECT_ID)
    })
  })
})
