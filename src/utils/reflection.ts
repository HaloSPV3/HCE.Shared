import {
  type BaseClassProto,
  type ClassLike,
  type ClassLike_Unknown,
  type ConstructorConstraint,
  type SuperClassLike,
  type WithProto,
} from './reflection/inheritance.js';
import { isConstructor } from './reflection/isConstructor.js';

export type * from './reflection/FunctionLike.js';
export type * from './reflection/GetterDescriptor.js';

export * from './reflection/filterForGetters.js';
export * from './reflection/getOwnPropertyDescriptors.js';
export * from './reflection/getPrototypeOf.js';
export * from './reflection/inheritance.js';
export * from './reflection/isConstructor.js';
export * from './reflection/listOwnGetters.js';

/**
 * Iterate through the class and its base/super classes until an anonymous function is reached. This is the default superclass all classes extend.
 * @param classDef Any class type. This or its prototype are included in the return value.
 * @param [returnType] Default: 'classes'; Determines return type. If 'classInstances', the return type is an array of the classes' `.prototype`. Else, the classes themselves are returned.
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

  while (undefined != parent) {
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
      undefined != (parent = Reflect.getPrototypeOf(current))
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
