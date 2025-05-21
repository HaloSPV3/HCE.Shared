import type { GetterDescriptor } from './GetterDescriptor.ts';
import type { OwnKeyOf } from './OwnKeyOf.js';

/**
 * # !WARNING!
 * > This does _not_ filter out non-getter properties! ALL properties are treated as getters. Because `get` is optional and present on all property descriptors, this type should only be used to cast properties for which `typeof p.get === 'function'`.
 *
 * A {@link GetterDescriptorMap} variant for omitting keys inherited from {@link __proto__}.
 * Note: If `T` is `InstanceOf<class>`, then `__proto__` must be `InstanceTypeOrSelf<__proto__>`
 * @template T The type the descriptor map describes.
 * @template __proto__ The `[[Prototype]]` of {@link T}. Keys of {@link __proto__} are omitted from the descriptor map type.
 * @since 3.0.0
 */
export type OwnGetterDescriptorMap<
  T,
  __proto__ extends object | null,
> = { [P in OwnKeyOf<T, __proto__>]: GetterDescriptor<T[P]> };
