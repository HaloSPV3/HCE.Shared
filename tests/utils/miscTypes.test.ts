import { describe, it } from 'node:test'
import { isOfType, tBooleanString, tEmptyOrBooleanString } from '../../src/utils/miscTypes.js'
import * as miscTypes from '../../src/utils/miscTypes.js'
import { deepStrictEqual } from 'node:assert/strict'

await it('is built', async () =>
  deepStrictEqual(
    JSON.stringify(Object.entries(await import('@halospv3/hce.shared-config/utils/miscTypes')), undefined, 2),
    JSON.stringify(Object.entries(await import('../../src/utils/miscTypes.js')), undefined, 2),
  ),
)

await describe('isOfType', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(isOfType.name, c00.name)
  })
  await it('returns true when type.assert(obj) does not throw', () => {
    isOfType('true', tBooleanString)
  })
  await it('returns false when type.assert(obj) throws', () => {
    isOfType(true, tBooleanString)
  })
})

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
    !isOfType(true, tBooleanString)
  })
  await it('does not match boolean False', () => {
    !isOfType(false, tBooleanString)
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
    !isOfType(true, tEmptyOrBooleanString)
  })
  await it('does not match boolean False', () => {
    !isOfType(false, tEmptyOrBooleanString)
  })
})
