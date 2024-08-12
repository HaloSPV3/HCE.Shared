import { type, type Type } from 'arktype'

export const tBooleanString = type('\'true\' | \'false\'')
export type BooleanString = typeof tBooleanString.infer

export const tEmptyOrBooleanString = type(tBooleanString.or('\'\''))
export type EmptyOrBooleanString = typeof tEmptyOrBooleanString.infer

/**
 * A try-catch, boolean-returning wrapper for ArkType's {@link Type.assert} method
 * @param data
 * @param type
 * @returns
 */
export function isOfType<T extends Type>(data: unknown, type: T): data is T['infer'] {
  try {
    type.assert(data)
    return true
  }
  catch {
    return false
  }
}
