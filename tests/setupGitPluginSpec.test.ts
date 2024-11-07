import { setupGitPluginSpec } from '@halospv3/hce.shared-config/setupGitPluginSpec'
import { deepStrictEqual, notDeepStrictEqual } from 'node:assert/strict'
import { describe, it } from 'node:test'

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/setupGitPluginSpec')), undefined, 2),
    JSON.stringify(Object.entries(await import('../src/setupGitPluginSpec.js')), undefined, 2),
  ),
)

await describe('setupGitPluginSpec', async () => {
  await it('returns original array if it lacks Git PluginSpec', () => {
    deepStrictEqual(
      setupGitPluginSpec([]),
      [],
    )
  })

  await it('modifies provided array if it includes Git PluginSpec', () => {
    notDeepStrictEqual(
      setupGitPluginSpec(['@semantic-release/git']),
      ['@semantic-release/git'],
    )
  })
})
