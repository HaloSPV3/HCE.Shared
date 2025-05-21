import type { BaseClassProto, ConstructorLike, InstanceTypeOrSelf, ProtoOrSuperClass, SuperClassLike, WithProto } from './inheritance.ts';
import type { InstancePropertyDescriptorMap } from './InstancePropertyDescriptorMap.ts';
import type { PropertyDescriptorMap } from './PropertyDescriptorMap.ts';

/**
 * Variant of {@link InstancePropertyDescriptorMap} with a lesser constraint on {@link T}.
 * If {@link T} and/or {@link __proto__} are instantiable, the resulting
 * property descriptor maps will be of the instances' types.
 * @template T `null` or an `object`-like type.
 * @template __proto__ The `[[Prototype]]` of {@link T}.
 * @since 3.0.0
 */
export type InstanceTypeOrSelfPropertyDescriptorMap<
  T extends object | null,
  __proto__ extends ProtoOrSuperClass,
> = T extends ConstructorLike<T>
  ? __proto__ extends SuperClassLike | BaseClassProto
    ? InstancePropertyDescriptorMap<T & WithProto<__proto__>>
    : PropertyDescriptorMap<InstanceType<T>, InstanceTypeOrSelf<__proto__>>
  : PropertyDescriptorMap<InstanceTypeOrSelf<T>, InstanceTypeOrSelf<__proto__>>;
