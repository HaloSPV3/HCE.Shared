/**
 * A variant of TypeScript's ES5 PropertyDescriptorMap with an extra generic
 * parameter for omitting inherited keys.
 * @template T The type described by the {@link PropertyDescriptorMap}.
 * @template [__proto__=null]
 * The `null` or the `object`-like `[[Prototype]]` of {@link T}.
 * @since 3.0.0
 */
export type PropertyDescriptorMap<T, __prototype__ extends object | null = null>
  = __prototype__ extends null
    ? { [P0 in keyof T]: TypedPropertyDescriptor<T[P0]>; }
    : Omit<
      { [P0 in keyof T]: TypedPropertyDescriptor<T[P0]>; },
      keyof { [P1 in keyof __prototype__]: TypedPropertyDescriptor<__prototype__[P1]> }
    >;
