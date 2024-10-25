import HceSharedConfig from '@halospv3/hce.shared-config'
import {
  deepStrictEqual,
  notStrictEqual,
  strictEqual,
} from 'node:assert/strict'
import { describe, test } from 'node:test'
import type { Options } from 'semantic-release'

const options: Options = HceSharedConfig

await describe('index', async () => {
  await test('default export from index: semantic-release options', async () => {
    await test('options is defined', () => {
      notStrictEqual(options, undefined)
    })

    await test('options.preset is conventionalcommits', () => {
      strictEqual(options.preset, 'conventionalcommits')
    })

    await test('options.branches is mainline-main, prerelease-develop', () => {
      deepStrictEqual(options.branches, [
        'main',
        {
          name: 'develop',
          channel: 'develop',
          prerelease: true,
        },
      ])
    })
  })
})
