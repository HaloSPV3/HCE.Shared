// #region https://dev.to/adrien2p/mastering-recursive-types-in-typescript-handling-depth-limitations-gracefully-5f4o#a-more-robust-solution-tuplebased-increment-and-decrement-types
export type Length<T extends unknown[]> = (T extends { length: number } ? T['length'] : never) & number;
export type TupleOf<N extends number, T extends unknown[] = []> = Length<T> extends N
  ? T
  : TupleOf<N, [...T, unknown]>;
export type Pop<T extends unknown[]> = T extends [...infer U, unknown] ? U : never;
// Increment adds an element to a tuple, effectively creating N + 1
export type Increment<N extends number> = Length<[1, ...TupleOf<N>]>;
// Decrement removes an element from a tuple, effectively creating N - 1
export type Decrement<N extends number> = Length<Pop<TupleOf<N>>>;

// #endregion https://dev.to/adrien2p/mastering-recursive-types-in-typescript-handling-depth-limitations-gracefully-5f4o#a-more-robust-solution-tuplebased-increment-and-decrement-types
