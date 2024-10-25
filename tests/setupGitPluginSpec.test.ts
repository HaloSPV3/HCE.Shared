import { setupGitPluginSpec } from '@halospv3/hce.shared-config/setupGitPluginSpec'
import { deepStrictEqual, notDeepStrictEqual } from 'node:assert'
import { describe, it } from 'node:test'

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
