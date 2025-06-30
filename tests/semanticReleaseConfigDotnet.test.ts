import { getConfig, SemanticReleaseConfigDotnet } from '../src/semanticReleaseConfigDotnet.js'
import { deepStrictEqual, strictEqual } from 'node:assert/strict'
import { describe, it, todo } from 'node:test'
import { isConstructor } from '../src/utils/reflection.js'

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/semanticReleaseConfigDotnet')), undefined, 2),
    JSON.stringify(Object.entries(await import('../src/semanticReleaseConfigDotnet.js')), undefined, 2),
  ),
)

await describe('SemanticReleaseConfigDotnet', async () => {
  await it('is a class', () => {
    strictEqual(isConstructor(SemanticReleaseConfigDotnet), true)
  })
  await todo('Properties, Methods')
})

await describe('getConfig', async () => {
  await it('is a function', () => {
    strictEqual(typeof getConfig, 'function')
  })
})
