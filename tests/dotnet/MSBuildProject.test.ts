import { deepStrictEqual, ok } from 'node:assert'
import { describe, it } from 'node:test'
import {
  MSBuildProject as exposed,
} from '@halospv3/hce.shared-config/dotnet/MSBuildProject'
import {
  MSBuildProject as MSBP,
} from '../../src/dotnet/MSBuildProject.js'

await describe('MSBuildProject', async (c00) => {
  await it('is exposed', () => {
    deepStrictEqual(exposed.name, c00.name)
  })
  await it('is built', () => {
    deepStrictEqual(exposed, MSBP)
  })
  await describe('MatrixProperties', async (ctx1) => {
    await it('has expected name', async () => {
      ok(ctx1.name in MSBP)
    })
    await it('is array of expected values', async () => {
      deepStrictEqual(
        MSBP.MatrixProperties,
        [
          'TargetFramework',
          'TargetFrameworks',
          'RuntimeIdentifier',
          'RuntimeIdentifiers',
        ],
      )
    })
  })
})
