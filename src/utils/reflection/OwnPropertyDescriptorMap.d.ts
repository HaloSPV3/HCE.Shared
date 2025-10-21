import type {
  BaseClass,
  ClassLike,
  ClassLike_Unknown,
  ProtoOrSuperClass,
  WithProto,
} from './inheritance.ts';

// todo: Omit [P in keyof T] where T['__proto__'][P] === T[P].
// todo: NEVER omit overridden class members! Does TypeScript expose that override in accessible metadata?

/**
 * A typed {@link PropertyDescriptorMap} without any keys found in its `[[Prototype]]` chain.
 * This may mean overridden class properties are wrongly omitted.
 * @template T Any type with its `[[Prototype]]` attached via a type-only `__proto__` property. The type of `__proto__` must extends {@link ProtoOrSuperClass}.
 * @since 3.0.0
 */
export type OwnPropertyDescriptorMap<T extends WithProto<ProtoOrSuperClass>>
  = T['__proto__'] extends null
    ? { [P0 in keyof T]: TypedPropertyDescriptor<T[P0]>; }
    : Omit<
      { [P0 in keyof T]: TypedPropertyDescriptor<T[P0]>; },
      Exclude<
        keyof { [P1 in keyof T['__proto__']]: TypedPropertyDescriptor<T['__proto__'][P1]> },
        keyof ClassLike<BaseClass<ClassLike_Unknown>>
      >
    >;

// // todo: use SharedKeys to only keys where SharedKeys<T> in keyof T
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// type SharedKeys<T extends WithProto<ProtoOrSuperClass>> = Extract<keyof T, keyof T['__proto__']>;

// // todo: make this useful. The ReturnType is incorrect
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// declare function removeMatchingPropertyDescriptors<T0, T1>(
//   a: { [P0 in keyof T0]: TypedPropertyDescriptor<T0[P0]> },
//   b: { [P1 in keyof T1]: TypedPropertyDescriptor<T1[P1]> }
// ): Omit<typeof a, keyof (T0 & T1)>;

// /**
//  * @see https://stackoverflow.com/a/56874389/1489478
//  * @example
//  * ```ts
//  * interface MyInterface {
//  *   a: number;
//  *   b: string;
//  *   c: number;
//  * }
//  * type MyType = KeysMatching<MyInterface, number>;
//  * type MyType = "a" | "c";
//  * @todo KeysMatching
// */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// type KeysMatching<T extends object, V> = {
//   [K in keyof T]-?: T[K] extends V ? K : never
// }[keyof T];

// /**
//  * @todo KeysNotMatching
//  */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// type KeysNotMatching<T extends object, V> = {
//   [K in keyof T]-?: T[K] extends V ? never : K
// }[keyof T];

// // type _ = KeysMatching<Class_NPP,Class_MSBPP[keyof Class_MSBPP]>
// /**
//  * @see https://stackoverflow.com/a/56874389/14894786
//  * @example
//  * interface AnotherInterface {
//  *   narrower: 1;
//  *   exact: number;
//  *   wider: string | number;
//  * }
//  * type AnotherTypeWrite = KeysMatchingWrite<AnotherInterface, number>;
//  * type AnotherTypeWrite = 'exact' | 'wider';
//  * @todo KeysMatchingWrite
//  */
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// type KeysMatchingWrite<T extends object, V> = {
//   [K in keyof T]-?: [V] extends [T[K]] ? K : never
// }[keyof T];
