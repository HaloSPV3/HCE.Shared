/**
 * A variant of TypeScript's ES5 PropertyDescriptorMap with an extra generic
 * parameter for omitting inherited keys.
 * @since 3.0.0
 */
export type PropertyDescriptorMap<T, __proto__ extends object | null = null> =
  __proto__ extends null
    ? { [P0 in keyof T]: TypedPropertyDescriptor<T[P0]>; }
    : Omit<
      { [P0 in keyof T]: TypedPropertyDescriptor<T[P0]>; },
      keyof { [P1 in keyof __proto__]: TypedPropertyDescriptor<__proto__[P1]> }
    >;
