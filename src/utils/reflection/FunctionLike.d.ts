/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * A generic alternative to the boxing {@link Function} type. Based on the
 * expressions of {@link Parameters} and {@link ReturnType}.
 * @template [T=((...args: any[] | readonly any[]) => any)] Any function-like type.
 * @template [P=Parameters<T>]
 * [INTERNAL] The parameters of {@link T}.
 * @template [R=ReturnType<T>]
 * [INTERNAL] The return type of {@link T}.
 * @default ((...args: any[] | readonly any[]) => any)
 * @since 3.0.0
 */
export type FunctionLike<
  T extends ((...args: any[] | readonly any[]) => any) = ((...args: any[] | readonly any[]) => any),
  P extends Parameters<T> = Parameters<T>,
  R extends ReturnType<T> = ReturnType<T>,
> = T & ((...args: P) => R);
