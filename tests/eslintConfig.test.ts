import eslintConfig from '@halospv3/hce.shared-config/eslintConfig'
import { deepStrictEqual, ok } from 'node:assert/strict'
import { describe, it, todo } from 'node:test'

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/eslintConfig'))),
    JSON.stringify(Object.entries(await import('../src/eslintConfig.js'))),
  ),
)

await describe('eslintConfig', async () => {
  await it('exports an array', () => {
    ok(Array.isArray(eslintConfig))
  })
  await todo('excludes certain paths from linting')
})
