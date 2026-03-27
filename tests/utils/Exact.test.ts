import type { Exact } from '../../src/utils/Exact.d.ts';
import { describe } from 'node:test';

// eslint-disable-next-line jsdoc/require-jsdoc, @typescript-eslint/no-unused-vars
function exact<S, T extends Exact<T, S>>(x: S, _y: T): T {
  return x as unknown as T;
};

await describe('Exact (type checks)', () => {
  // should succeed
  exact({ a: 1 }, { a: 1 });
  exact({ a: 1, b: 'two' }, { a: 1, b: 'two' });

  // should raise a TypeError
  try {
    // @ts-expect-error Type 'boolean' is not assignable to type 'TypeError<"Excess: 'c'">'.ts(2322)
    exact({ a: 1 }, { a: 1, b: 'two', c: false });
  }
  catch { /* empty */ }

  try {
    // @ts-expect-error Type 'number' is not assignable to type 'TypeError<"Excess: 'c'">'.ts(2322)
    exact({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 });
  }
  catch { /* empty */ }

  try {
    // @ts-expect-error Argument of type '{ a: number; }' is not assignable to parameter of type '{ a: number; b: number; }'. Property 'b' is missing in type '{ a: number; }' but required in type '{ a: number; b: number; }'.ts(2345)
    exact({ a: 1, b: 2 }, { a: 1 });
  }
  catch { /* empty */ }

  try {
    // @ts-expect-error Should error
    exact({ a: 1 }, { a: 1, b: 2 });
    //                           ^ 🚫 raises a TypeError here
  }
  catch { /* empty */ }
});
