import { getConfig } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet'
import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { describe, it } from 'node:test'
import { dirSync, fileSync, setGracefulCleanup } from 'tmp'

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

    await it('does not throw when projectToPackAndPush contains at least one item', async () => {
      process.env.GITHUB_REPOSITORY_OWNER = 'HaloSPV3'
      process.env.SKIP_TOKEN = 'true'
      setGracefulCleanup()
      const tmpProjDir = dirSync({ name: 'configDotnet' })
      const tmpProj = fileSync({ dir: tmpProjDir.name, name: 'configDotnet.csproj', discardDescriptor: true })
      const actual = await writeFile(
        tmpProj.name,
        '<Project> <PropertyGroup> <TargetFramework>net6.0</TargetFramework> <RuntimeIdentifier>win7-x86</RuntimeIdentifier> </PropertyGroup> </Project>',
      ).then(async () =>
        await getConfig([tmpProj.name], [tmpProj.name]),
      ).catch(err => err instanceof Error ? err : new Error(String(err)))

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
