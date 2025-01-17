import { getConfig } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet'
import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

// todo: rename file to semanticReleaseConfigDotnet.test.ts

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/semanticReleaseConfigDotnet')), undefined, 2),
    JSON.stringify(Object.entries(await import('../src/semanticReleaseConfigDotnet.js')), undefined, 2),
  ),
)

await describe('configDotnet', async () => {
  await describe('getConfig', async () => {
    strictEqual(getConfig.name, 'getConfig')

    // todo: make separate tests for string vs. MSBuildProject params
    await it('does not throw when projectToPackAndPush contains at least one item', async () => {
      process.env.GITHUB_REPOSITORY_OWNER = 'HaloSPV3'
      process.env.SKIP_TOKEN = 'true'
      const DeterministicNupkgCsprojPath = resolve(import.meta.dirname, '../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj')
      const actual = await getConfig([DeterministicNupkgCsprojPath])
        .catch(v => v instanceof Error ? v : new Error(String(v)))

      ok(!(actual instanceof Error), '`actual` should not be an Error.\n' + actual.stack)
    })

    await it('throws Error when projectsToPublish is an empty array.', async () => {
      let actual = undefined
      try {
        actual = await getConfig([])
      }
      catch (error) {
        actual = error as Error
      }

      ok(actual instanceof Error)
      ok(actual.message.includes('projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path.'))
    })
  })
})
