import type { PropertyDescriptorMap } from './PropertyDescriptorMap.ts';
import type {
  BaseClassProto,
  ConstructorConstraint,
  InstanceTypeOrSelf,
  SuperClassLike,
  WithProto,
} from './inheritance.ts';

/**
 * Generically-typed return type of `Object.GetOwnPropertyDescriptors` for class
 * instances.
 *
 * Allows for statically-inferred property keys and values.
 *
 * Classes' `public` members are returned, including instance Getters and
 * Setters.
 * @template Class
 * Any class type with its `[[Prototype]]` attached via a type-only `__proto__` property.
 * The type of `__proto__` must extend {@link SuperClassLike} or {@link BaseClassProto}.
 * @example
 * ```ts
 * const { NugetProjectProperties: NPP } = await import('../dotnet/NugetProjectProperties.js');
 * const _instanceMembers: InstancePropertyDescriptorMap<typeof NPP>  = Object.getOwnPropertyDescriptors(new NugetProjectProperties('',new CaseInsensitiveMap([['','']])));
 * ```
 * @since 3.0.0
 */
export type InstancePropertyDescriptorMap<
  Class extends ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>,
> = Class['__proto__'] extends BaseClassProto
  ? PropertyDescriptorMap<InstanceType<Class>>
  : PropertyDescriptorMap<InstanceType<Class>, InstanceTypeOrSelf<Class['__proto__']>>;
