import type { InstanceOrStatic } from '../miscTypes.js';
import { filterForGetters } from './filterForGetters.js';
import { getOwnPropertyDescriptors } from './getOwnPropertyDescriptors.js';
import type {
  BaseClassProto,
  ClassLike,
  ConstructorConstraint,
  InstanceTypeOrSelf,
  SuperClassLike,
  WithProto,
} from './inheritance.js';
import type { InstancePropertyDescriptorMap } from './InstancePropertyDescriptorMap.js';
import type { OwnPropertyDescriptorMap } from './OwnPropertyDescriptorMap.js';

/**
 * Description placeholder
 * @template {ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>} Class
 * @template {InstanceOrStatic} _InstanceOrStatic
 * @since 3.0.0
 */
type OwnGetters<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  _InstanceOrStatic extends InstanceOrStatic,
> =
  [_InstanceOrStatic] extends ['Instance']
    ? Exclude<
      (Class['__proto__'] extends BaseClassProto ? null : InstanceTypeOrSelf<Class['__proto__']>) extends null
        ? keyof InstanceType<Class>
        : Exclude<
          keyof InstanceType<Class>,
          keyof (Class['__proto__'] extends BaseClassProto ? null : InstanceTypeOrSelf<Class['__proto__']>)
        >,
      '__proto__'
    >[]
    : [_InstanceOrStatic] extends ['Static']
        ? Exclude<
          Class['__proto__'] extends null ? keyof Class : Exclude<keyof Class, keyof Class['__proto__']>,
          '__proto__'
        >[]
        : never;

/**
 * # !WARNING!
 * > If you don't specify the Class's SuperClass (or `BaseClassProto`) via WithProto, the return type will wrongly include inherited property names! This is a design limitation of TypeScript.
 *
 * Returns the names of the instantiated (or static), noninherited getters derived from the
 * given prototype or prototype of the given object.
 * @template {ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>} Class
 * @template {InstanceOrStatic} _InstanceOrStatic 'Instance' or 'Static'. Determines the return type.
 * @param classDefinition Any class cast to ClassLike
 * @param instanceOrStatic 'Instance' or 'Static'. Determines the return type.
 * @since 3.0.0
 * @returns
 * An array of names of getters that were not inherited from a parent class. If {@link classDefinition} is a class instance, the names of instanced getters are returned. Otherwise, the names of static getters are returned;
 */
export function listOwnGetters<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  _InstanceOrStatic extends InstanceOrStatic,
>(
  classDefinition: Class,
  instanceOrStatic: Extract<_InstanceOrStatic, InstanceOrStatic>,
): OwnGetters<Class, _InstanceOrStatic> {
  if (instanceOrStatic === 'Instance') {
    const descriptorMap: InstancePropertyDescriptorMap<Class> = getOwnPropertyDescriptors(classDefinition, instanceOrStatic as 'Instance');
    const getterDescriptorMap = filterForGetters(descriptorMap);
    const keyArray = Reflect.ownKeys(getterDescriptorMap) as (keyof typeof getterDescriptorMap)[];
    return keyArray as [typeof instanceOrStatic & 'Instance'] extends ['Instance'] ? typeof keyArray : never;
  }
  else if (instanceOrStatic === 'Static') {
    const descriptorMap: OwnPropertyDescriptorMap<Class> = getOwnPropertyDescriptors(classDefinition, instanceOrStatic as 'Static');
    const getterDescriptorMap = filterForGetters(descriptorMap);
    const keyArray = Reflect.ownKeys(getterDescriptorMap) as (keyof typeof getterDescriptorMap)[];
    return keyArray as [_InstanceOrStatic] extends ['Instance']
      ? never
      : [_InstanceOrStatic] extends ['Static']
          ? typeof keyArray
          : never;
  }
  else throw new TypeError('Argument `instanceOrStatic` must be "Instance" or "Static".');
}
