import { describe, it } from 'node:test'
import { tBooleanString, tEmptyOrBooleanString } from '../../src/utils/miscTypes.js'
import * as miscTypes from '../../src/utils/miscTypes.js'
import { deepStrictEqual, ok } from 'node:assert/strict'

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/utils/miscTypes')), undefined, 2),
    JSON.stringify(Object.entries(await import('../../src/utils/miscTypes.js')), undefined, 2),
  ),
)

await describe('tBooleanString', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(
      c00.name in miscTypes,
      true,
    )
  })
  await it('matches literal string "true"', () => {
    tBooleanString.assert('true')
  })
  await it('matches literal string "false"', () => {
    tBooleanString.assert('false')
  })
  await it('does not match boolean True', () => {
    ok(!tBooleanString.allows(true))
  })
  await it('does not match boolean False', () => {
    ok(!tBooleanString.allows(false))
  })
})

await describe('tEmptyOrBooleanString', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(c00.name in miscTypes, true)
  })
  await it('matches literal string "true"', () => {
    tEmptyOrBooleanString.assert('true')
  })
  await it('matches literal string "false"', () => {
    tEmptyOrBooleanString.assert('false')
  })
  await it('matches empty string', () => {
    tEmptyOrBooleanString.assert('')
  })
  await it('does not match boolean True', () => {
    ok(!tEmptyOrBooleanString.allows(true))
  })
  await it('does not match boolean False', () => {
    ok(!tEmptyOrBooleanString.allows(false))
  })
})
