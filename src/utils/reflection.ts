import {
  type BaseClassProto,
  type ClassLike,
  type ClassLike_Unknown,
  type ConstructorConstraint,
  type SuperClassLike,
  type WithProto,
} from './reflection/inheritance.js';
import { isConstructor } from './reflection/isConstructor.js';

export type * from './reflection/GetterDescriptor.js';
export type * from './reflection/FunctionLike.js';

export * from './reflection/inheritance.js';
export * from './reflection/getPrototypeOf.js';
export * from './reflection/filterForGetters.js';
export * from './reflection/isConstructor.js';

/**
 * Returns the names of the instantiated, noninherited getters derived from the
 * given prototype or prototype of the given object.
 * @param instanceOrPrototype An instantiated object or a prototype.
 * @returns An array of names of getters that were not inherited from a parent class.
 * @since 3.0.0
 */
export function listOwnGetters(instanceOrPrototype: object): string[] {
  // if prototype in instance, then it's not an instance. Assign prototype.
  const prototype: object | null = 'prototype' in instanceOrPrototype
    && typeof instanceOrPrototype.prototype === 'object'
    && instanceOrPrototype.prototype !== null
    ? instanceOrPrototype.prototype
    : Reflect.getPrototypeOf(instanceOrPrototype);
  const descriptors = Object.getOwnPropertyDescriptors(prototype);
  const names = Object.entries(descriptors)
    .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
    .map(e => e[0]);
  return names;
}

/**
 * Get the property descriptors of the class or constructor similar to {@link Object.getOwnPropertyDescriptors}, but with more options--including recursion.
 * @param classDef A class or constructor requiring the 'new' keyword for instantiation.
 * @param instanceProps If true, only the instance properties are returned. Else, only static properties are returned.
 * @param recurse If true, recurse through super classes (as defined by extends) and return their properties.
 * @returns An array of PropertyDescriptor objects.
 * todo: refactor!: change instanceProps to flag enum (instanceProps, staticProps, allProps)
 * @since 3.0.0
 */
export function getOwnPropertyDescriptors<T extends ClassLike<ConstructorConstraint<T> & WithProto<SuperClassLike | BaseClassProto>>>(
  classDef: T,
  instanceProps: boolean,
  recurse: boolean,
): ReturnType<typeof Object.getOwnPropertyDescriptors>[] {
  if (!recurse)
    return [
      Object.getOwnPropertyDescriptors(
        instanceProps ? classDef.prototype : classDef,
      ),
    ];

  let currentNameDesc: ReturnType<typeof Reflect.getOwnPropertyDescriptor>;
  let current: ClassLike<T> | ClassLike_Unknown = classDef;
  let parent: ClassLike_Unknown | object | null = null;
  const descriptors: ReturnType<typeof Object.getOwnPropertyDescriptors>[] = [];

  /** conditions:
   * - {@link current.name} exists
   * - typeof current.name} === 'string'
   * - {@link current.name} is readonly and non-enumerable
   * - {@link current.name} !== ''
   * - {@link parent} is not null
   * - {@link parent} is a constructor function (or class definition)
   */
  function shouldLoop() {
    return (
      'name' in current
      && 'string' === typeof current.name
      && undefined
      !== (currentNameDesc = Reflect.getOwnPropertyDescriptor(current, 'name'))
      && false === ((true === currentNameDesc.writable) || currentNameDesc.enumerable)
      && '' !== current.name
    );
  }

  // checking instanceProps outside of the `while` adds code redundancy, but slightly improves performance.
  if (instanceProps) {
    while (shouldLoop()) {
      descriptors.push(Object.getOwnPropertyDescriptors(current.prototype));
      parent = Reflect.getPrototypeOf(current);
      if (null !== parent && isConstructor(parent)) {
        current = parent;
      }
      else {
        break;
      }
    }
  }
  /* !instanceProps */ else {
    while (shouldLoop()) {
      descriptors.push(Object.getOwnPropertyDescriptors(current)); // this is the only different to instanceProps' loop
      parent = Reflect.getPrototypeOf(current);
      if (null !== parent && isConstructor(parent)) {
        current = parent;
      }
      else {
        break;
      }
    }
  }

  return descriptors;
}

/**
 * Iterate through the class and its base/super classes until an anonymous function is reached. This is the default superclass all classes extend.
 * @param classDef Any class type. This or its prototype are included in the return value.
 * @param [returnType='classes'] Default: 'classes'; Determines return type. If 'classInstances', the return type is an array of the classes' `.prototype`. Else, the classes themselves are returned.
 * @returns `returnType extends 'classInstances' ? ClassLike<T>[] : ClassLike<T>[].map(c => c.prototype)`
 * Excludes default superclasses e.g. anonymous functions, native code.
 * @since 3.0.0
 */
export function getPrototypes<T extends ClassLike<ConstructorConstraint<T> & WithProto<SuperClassLike | BaseClassProto>>>(
  classDef: ClassLike<T> | object,
  returnType: 'classes' | 'classInstances' = 'classes',
): typeof returnType extends 'classInstances' ? ClassLike<T>[] : ClassLike<T>['prototype'][] {
  // class definitions or their respective .prototype; exclude default superclasses.
  const returnValue: object[] = [];
  let current: ClassLike<T> | ClassLike_Unknown | object = classDef;
  let parent: ClassLike_Unknown | object | null = Reflect.getPrototypeOf(current);

  while (null != parent) {
    // current is a Class symbol/constructor. Object.getOwnPropertyDescriptors on current will include static properties.
    if (isConstructor(current))
      returnValue.push(returnType === 'classInstances' ? current.prototype as object : current);
    else break;

    /*
     * Assign the super class to current.
     * If the argument is a class, Object.getPrototypeOf method returns the
     * superclass.
     */
    if (
      null != (parent = Reflect.getPrototypeOf(current))
      // && isConstructor(parent)

      && 'name' in parent
      && typeof parent.name === 'string'
      && '' !== parent.name
    ) {
      current = parent;
    }
    else {
      break;
    }
  }
  return returnValue;
  /*
    assuming current is NugetProjectProperties...
    Reflect.getPrototypeOf(current).name is 'MSBuildProjectProperties'
   */
}
