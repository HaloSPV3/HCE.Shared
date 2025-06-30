import { type } from 'arktype'

export const tBooleanString = type('\'true\' | \'false\'')
export type BooleanString = typeof tBooleanString.infer

export const tEmptyOrBooleanString = type(tBooleanString.or('\'\''))
export type EmptyOrBooleanString = typeof tEmptyOrBooleanString.infer
