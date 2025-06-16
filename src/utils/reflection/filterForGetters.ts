import type {
  BaseClassProto,
  baseClassProto,
  ClassLike,
  ConstructorConstraint,
  InstanceTypeOrSelf,
  SuperClassLike,
  WithProto,
} from './inheritance.js';
import type { InstancePropertyDescriptorMap } from './InstancePropertyDescriptorMap.js';
import type { OwnGetterDescriptorMap } from './OwnGetterDescriptorMap.js';
import type { OwnPropertyDescriptorMap } from './OwnPropertyDescriptorMap.js';
import type { PropertyDescriptorMap } from './PropertyDescriptorMap.js';

export function filterForGetters<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | typeof baseClassProto>>,
>(
  descriptorMap: InstancePropertyDescriptorMap<Class>,
): Partial<OwnGetterDescriptorMap<
  InstanceType<Class>,
  Class['__proto__'] extends BaseClassProto ? null : InstanceTypeOrSelf<Class['__proto__']>
>>;
export function filterForGetters<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
>(
  descriptorMap: OwnPropertyDescriptorMap<Class>,
): Partial<OwnGetterDescriptorMap<Class, Class['__proto__']>>;
/**
 * Iterates through the descriptors object, checking for property descriptors whose `get` is a function.
 * Returns an {@link OwnGetterDescriptorMap} of the getters.
 * If you want only own, non-inherited getters, you must filter sanitize the
 * type the `descriptors` parameter yourself e.g. `Omit<Class, keyof
 * SuperClass>`.
 * @param descriptorMap An object like the return value of Object.getOwnPropertyDescriptors
 * @template Class Any ClassLike type
 * @template T Any `object`-like type.
 * @template [__proto__=null] If {@link Class} is not {@link ClassLike}, the `__proto__` of {@link T}.
 * @returns An {@link OwnGetterDescriptorMap}.
 * @since 3.0.0
 */
export function filterForGetters<
  T extends object,
  __proto__ extends object | null = null,
>(
  descriptorMap: PropertyDescriptorMap<T, __proto__> | PropertyDescriptorMap<T>,
): Partial<OwnGetterDescriptorMap<T, __proto__>> {
  let getterDescriptorMap: Partial<OwnGetterDescriptorMap<T, __proto__>> = {};
  for (const key in descriptorMap) {
    const element = descriptorMap[key as keyof typeof descriptorMap];
    if (typeof element.get === 'function') {
      getterDescriptorMap = Object.assign(
        getterDescriptorMap,
        { [key]: element },
      );
    }
  }

  return getterDescriptorMap;
}
