import { type } from 'arktype';

export const tBooleanString = type('"true" | "false"');
export type BooleanString = typeof tBooleanString.infer;

export const tEmptyOrBooleanString = type(tBooleanString.or('""'));
export type EmptyOrBooleanString = typeof tEmptyOrBooleanString.infer;

export type Integer<N extends number> = `${N}` extends `${number}.${number}` ? never : N;

/**
 * @see https://stackoverflow.com/a/73920140/14894786
 */
export type TupleIndices<T extends readonly unknown[]> =
  Extract<keyof T, `${number}`> extends `${infer N extends number}` ? N : never;

export type InstanceOrStatic = 'Instance' | 'Static';
