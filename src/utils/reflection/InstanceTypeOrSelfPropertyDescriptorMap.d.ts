import type { BaseClassProto as BaseClassPrototype, ConstructorLike, InstanceTypeOrSelf, ProtoOrSuperClass as PrototypeOrSuperClass, SuperClassLike, WithProto as WithPrototype } from './inheritance.ts';
import type { InstancePropertyDescriptorMap } from './InstancePropertyDescriptorMap.d.ts';
import type { PropertyDescriptorMap } from './PropertyDescriptorMap.d.ts';

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
  __prototype__ extends PrototypeOrSuperClass,
> = T extends ConstructorLike<T>
  ? __prototype__ extends SuperClassLike | BaseClassPrototype
    ? InstancePropertyDescriptorMap<T & WithPrototype<__prototype__>>
    : PropertyDescriptorMap<InstanceType<T>, InstanceTypeOrSelf<__prototype__>>
  : PropertyDescriptorMap<InstanceTypeOrSelf<T>, InstanceTypeOrSelf<__prototype__>>;
