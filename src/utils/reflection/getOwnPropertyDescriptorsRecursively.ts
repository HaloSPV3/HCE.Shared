import type { Increment } from '../GracefulRecursion.js';
import type { InstanceOrStatic, Integer } from '../miscTypes.js';
import { getOwnPropertyDescriptors } from './getOwnPropertyDescriptors.js';
import { getPrototypesChainOf } from './getPrototypeChainOf.js';
import type {
  BaseClass,
  BaseClassProto,
  ClassLike,
  ConstructorConstraint,
  ConstructorLike,
  ProtoChainOfClass,
  SuperClassLike,
  WithProto,
} from './inheritance.js';
import type { InstanceTypeOrSelfPropertyDescriptorMap } from './InstanceTypeOrSelfPropertyDescriptorMap.js';
import type { OwnPropertyDescriptorMap } from './OwnPropertyDescriptorMap.js';
/* eslint-disable jsdoc/check-tag-names */
/**
 * JSDoc type imports
 * @typedef {import('./getPrototypeOf.js').getPrototypeOf} getPrototypeOf
 * @typedef {import('./listOwnGetters.js').listOwnGetters} listOwnGetters
 * @typedef {import('./InstancePropertyDescriptorMap.js').InstancePropertyDescriptorMap} InstancePropertyDescriptorMap
 */
/* eslint-enable jsdoc/check-tag-names */

/**
 * A conditional wrapper for {@link InstanceTypeOrSelfPropertyDescriptorMap} and
 * {@link OwnPropertyDescriptorMap}.
 *
 * If {@link _InstanceOrStatic} is 'Instance', {@link InstanceTypeOrSelfPropertyDescriptorMap}.\
 * Else if {@link _InstanceOrStatic} is 'Static',
 * {@link OwnPropertyDescriptorMap }.\
 * Else, `never`.
 * @template {ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>} Class
 * A class definition cast to {@link ClassLike}.
 * @template {InstanceOrStatic} _InstanceOrStatic
 * 'Instance' or 'Static'. Determines the return type.
 * @since 3.0.0
 */
export type RecursedPropertyDescriptorMap<
  Class extends ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>,
  _InstanceOrStatic extends InstanceOrStatic,
> = [_InstanceOrStatic] extends ['Instance'] ? InstanceTypeOrSelfPropertyDescriptorMap<Class, Class['__proto__']>
  : [_InstanceOrStatic] extends ['Static'] ? OwnPropertyDescriptorMap<Class>
      : never;

/**
 * An
 * ordered array of {@link OwnPropertyDescriptorMap} or
 * {@link InstancePropertyDescriptorMap} starting with {@link classDefinition}
 * and ending with a {@link BaseClass}.
 * @template {ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>} Class
 * @template {'Instance' | 'Static'} InstanceOrStatic
 * @template {Integer<number>} [Limit=16]
 * @template {Integer<number>} [CurrentLevel=0]
 */
export type RecursedPropertyDescriptorMapArray<
  Class extends ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>,
  InstanceOrStatic extends 'Instance' | 'Static',
  Limit extends Integer<number> = 16,
  CurrentLevel extends Integer<number> = 0,
> = Class['__proto__'] extends BaseClassProto['__proto__'] | BaseClassProto['__proto__']['__proto__'] ? never
  : Class['__proto__'] extends BaseClassProto ? [RecursedPropertyDescriptorMap<BaseClass<Class>, InstanceOrStatic>]
    : Class['__proto__'] extends ConstructorLike<Class['__proto__']>
      ? [
          RecursedPropertyDescriptorMap<Class, InstanceOrStatic>,
          ...RecursedPropertyDescriptorMapArray<
            ClassLike<Exclude<Class['__proto__'], BaseClassProto> & WithProto<SuperClassLike | BaseClassProto>>,
            InstanceOrStatic,
            Limit,
            Increment<CurrentLevel>
          >,
        ]
      : never;
/**
 * Walks the class inheritance chain to get a PropertyDescriptorMap of each class.
 *
 * While you _can_ use this to get an array of getter names/keys, you should use {@link getPrototypeOf} and {@link listOwnGetters}, instead!
 * @template Class Any class definition type-cast to {@link ClassLike}
 * @template _InstanceOrStatic
 * @param classDefinition Any class definition type-cast to {@link ClassLike}
 * @param instanceOrStatic 'Instance' or 'Static'. Determines the return type.
 * @returns An
 * ordered array of {@link OwnPropertyDescriptorMap} or
 * {@link InstancePropertyDescriptorMap} starting with {@link classDefinition}
 * and ending with a {@link BaseClass}.
 * @since 3.0.0
 */
export function getOwnPropertyDescriptorsRecursively<
  // Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  _InstanceOrStatic extends InstanceOrStatic,
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  Limit extends Integer<number> = 16,
>(
  classDefinition: Class,
  instanceOrStatic: _InstanceOrStatic,
): RecursedPropertyDescriptorMapArray<Class, _InstanceOrStatic> {
  const staticProtoChain: ProtoChainOfClass<Class> = getPrototypesChainOf(classDefinition, 'classes');
  if (isSingleTuple(staticProtoChain)) {
    return [
      getOwnPropertyDescriptors(
        staticProtoChain[0],
        instanceOrStatic,
      ) as RecursedPropertyDescriptorMap<Class, _InstanceOrStatic>,
    ] as unknown as RecursedPropertyDescriptorMapArray<Class, _InstanceOrStatic, Limit>;
  }

  const recursedPropertyDescriptorMapArray = staticProtoChain.map(classDefinition =>
    getOwnPropertyDescriptors(
      classDefinition,
      instanceOrStatic,
    ),
  );

  return recursedPropertyDescriptorMapArray as RecursedPropertyDescriptorMapArray<Class, _InstanceOrStatic>;
}

/**
 * Simple utility for single-tuple type assertion
 * @template {T} T T in T[]
 * @param array an array
 * @returns array is [T]
 */
function isSingleTuple<T>(array: T[]): array is [T] {
  return Array.isArray(array) && array.length === 1;
}
