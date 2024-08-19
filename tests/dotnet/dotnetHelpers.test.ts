import { deepStrictEqual, ok, strictEqual } from 'node:assert'
import { describe, it, todo } from 'node:test'
import {
  configureDotnetNugetPush,
  configurePrepareCmd,
} from '../../src/dotnet/dotnetHelpers.js'
import * as built from '@halospv3/hce.shared-config/dotnet/dotnetHelpers'
import * as source from '../../src/dotnet/dotnetHelpers.js'

await it('is built', () => {
  deepStrictEqual(built, source)
})

await describe('dotnetHelpers', async () => {
  await todo('configurePrepareCmd', () => {
    ok(typeof configureDotnetNugetPush === 'function')
    strictEqual(typeof configureDotnetNugetPush, 'function')
    strictEqual(configurePrepareCmd.name, 'configurePrepareCmd')
  })

  await it('configureDotnetNugetPush works', (t) => {
    strictEqual(typeof configureDotnetNugetPush, 'function')
    strictEqual(configureDotnetNugetPush.name, 'configureDotnetNugetPush')

    t.todo(`nupkgDir - default`)
    t.todo(`nupkgDir - custom`)
    t.todo(`registries - default`)
    t.todo(`registries - custom`)
    t.todo(`pushToGitHub adds github defaults`)
  })
})
