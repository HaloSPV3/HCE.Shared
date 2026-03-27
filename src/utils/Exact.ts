/**
 * ### `Exact<T, S>`
 *
 * [issue](https://github.com/microsoft/TypeScript/issues/12936#issuecomment-2816928183)\
 * [author](https://github.com/ahrjarrett)\
 * license: unlicensed[!]
 * @see
 * - {@link https://tsplay.dev/NnGG6m}
 */
export type Exact<T, S> = [keyof T] extends [keyof S]
  ? [T] extends [S] ? { [K in keyof T]: T[K] } : S
  : { [K in keyof T as K extends keyof S ? never : K]: TypeError<`Excess: '${Coerce<K>}'`> };

interface TypeError<Message> { [' TypeError']: Message }
// prior art: use arktype's ^^^ leading whitespace trick to avoid collisions

type Coerce<T> = `${T & (string | number)}`;
