import { deepStrictEqual } from 'node:assert';
import { ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  tBooleanString,
  tEmptyOrBooleanString,
  type TupleIndices,
} from '../../src/utils/miscTypes.js';

await describe('tBooleanString', async () => {
  await it('matches literal string "true"', () => {
    tBooleanString.assert('true');
  });
  await it('matches literal string "false"', () => {
    tBooleanString.assert('false');
  });
  await it('does not match boolean True', () => {
    ok(!tBooleanString.allows(true));
  });
  await it('does not match boolean False', () => {
    ok(!tBooleanString.allows(false));
  });
});

await describe('tEmptyOrBooleanString', async () => {
  await it('matches literal string "true"', () => {
    tEmptyOrBooleanString.assert('true');
  });
  await it('matches literal string "false"', () => {
    tEmptyOrBooleanString.assert('false');
  });
  await it('matches empty string', () => {
    tEmptyOrBooleanString.assert('');
  });
  await it('does not match boolean True', () => {
    ok(!tEmptyOrBooleanString.allows(true));
  });
  await it('does not match boolean False', () => {
    ok(!tEmptyOrBooleanString.allows(false));
  });
});

await describe('TupleIndices', async () => {
  await it('validates indices of tuple(2)', () => {
    const arr = [1, 2] as const;
    type ArrIndices = TupleIndices<typeof arr>;
    // type ArrIndices = 0 | 1
    const _0: ArrIndices = 0;
    const _1: ArrIndices = 1;
    const indices = [...arr.keys()];

    deepStrictEqual(indices, [_0, _1]);
    deepStrictEqual(indices.map(v => isValidIndexOf(v, indices)), [true, true]);
  });

  await it('validates indices of tuple(10)', () => {
    const tenNines = [9, 9, 9, 9, 9, 9, 9, 9, 9, 9] as const;
    type IndicesOfTenNines = TupleIndices<typeof tenNines>;
    // type IndicesOfNineNines = 0 | 1 | 2 | 9 | 3 | 4 | 5 | 6 | 7 | 8
    const actual = [...tenNines.keys()] as TupleIndices<typeof tenNines>[];
    const expected = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const satisfies IndicesOfTenNines[];
    deepStrictEqual(actual, expected);
  });
});

// eslint-disable-next-line jsdoc/require-jsdoc
function isValidIndexOf(index: number, array: readonly unknown[]): index is TupleIndices<typeof array> {
  return array[index] !== undefined;
}
