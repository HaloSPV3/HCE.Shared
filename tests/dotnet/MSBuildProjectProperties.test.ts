import { ok, strictEqual } from 'node:assert/strict'
import { describe, it } from 'node:test'
import { MSBuildProjectProperties as exposed } from '@halospv3/hce.shared-config/dotnet/MSBuildProjectProperties'
import { MSBuildProjectProperties as MPP } from '../../src/dotnet/MSBuildProjectProperties.js'
import { CaseInsensitiveMap } from './../../src/CaseInsensitiveMap.js'
import { deepStrictEqual } from 'node:assert'
import { tmpNameSync } from 'tmp'

await describe('MSBuildProjectProperties', async (c0) => {
  const emptyMap = new CaseInsensitiveMap<string, string>()
  const emptySample = new MPP('', emptyMap)
  await it('throws if given path does not resolve to an existing path', () => {
    try {
      const tmpName = tmpNameSync()
      new MPP(tmpName, emptyMap)
      throw new Error(`MSBuildProjectProperties saw ${tmpName} and thought it existed when it shouldn't!`)
    }
    catch {
      // good!
    }
  })
  await it('does not throw if given path is empty string (defaults to CWD)', () => {
    strictEqual(emptySample.MSBuildProjectFullPath, process.cwd())
  })
  await it('has expected name', () => {
    strictEqual(MPP.name, c0.name)
  })
  await it('is exposed', () => {
    ok(exposed)
  })
  await it('has been built', () => {
    deepStrictEqual(MPP, exposed)
  })
  await it('has prototype', () => {
    ok('prototype' in MPP)
  })
  await describe('AssemblyName', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.AssemblyName, 'string')
    })
  })
  await describe('Description', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.Description, 'string')
    })
  })
  await describe('MSBuildProjectFullPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.MSBuildProjectFullPath, 'string')
    })
  })
  await describe('OutputPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.OutputPath, 'string')
    })
  })
  await describe('RuntimeIdentifier', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.RuntimeIdentifier, 'string')
    })
  })
  await describe('RuntimeIdentifiers', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.RuntimeIdentifiers, 'string')
    })
  })
  await describe('TargetFramework', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.TargetFramework, 'string')
    })
  })
  await describe('TargetFrameworks', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.TargetFrameworks, 'string')
    })
  })
  await describe('Version', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.Version, 'string')
    })
  })
  await describe('VersionPrefix', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.VersionPrefix, 'string')
    })
  })
  await describe('VersionSuffix', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.VersionSuffix, 'string')
    })
  })
})
