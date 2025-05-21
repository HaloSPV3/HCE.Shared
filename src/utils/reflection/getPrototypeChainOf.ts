/* eslint-disable jsdoc/no-defaults */
import type { TupleIndices } from '../miscTypes.js';
import { getPrototypeOf } from './getPrototypeOf.js';
import {
  baseClassProto,
  type BaseClassProto,
  type ClassLike,
  type ConstructorConstraint,
  type ProtoChainOfClass,
  type ProtoChainOfClassInstance,
  type SuperClassLike,
  type WithProto,
} from './inheritance.js';
import { isConstructor } from './isConstructor.js';

type ProtoChain<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  ClassesOrInstances extends 'classes' | 'classInstances',
> = [ClassesOrInstances] extends ['classInstances'] ? ProtoChainOfClassInstance<Class>
  : [ClassesOrInstances] extends ['classes'] ? ProtoChainOfClass<Class>
      : never;

/**
 * Iterate through the class and its base/super classes until an anonymous function is reached. This is the default superclass all classes extend.
 * @template Class Any {@link ClassLike} type.
 * @template ClassesOrInstances 'classes' or 'classInstances'
 * @param classDefinition Any class type satisfying {@link Class}. This class (or its instance type) is included in the return value.
 * @param [returnType='classes'] Determines return type. If 'classInstances', the return type is an array of the classes' `.prototype`. Else, the classes themselves are returned.
 * @since 3.0.0
 * @returns
 * `returnType extends 'classInstances' ? ClassLike<T>[] : ClassLike<T>[].map(c => c.prototype)`
 * Excludes default superclasses e.g. anonymous functions, native code.
 */
export function getPrototypesChainOf<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  ClassesOrInstances extends 'classes' | 'classInstances',
>(
  classDefinition: Class,
  returnType: ClassesOrInstances,
): ProtoChain<Class, ClassesOrInstances> {
  // class definitions or their respective .prototype; exclude default superclasses.
  let current: ProtoChainOfClass<Class>[TupleIndices<ProtoChainOfClass<Class>>] = classDefinition as ProtoChainOfClass<Class>[0 extends TupleIndices<ProtoChainOfClass<Class>> ? 0 : never];
  let parent: typeof current & WithProto<SuperClassLike | BaseClassProto> | object;
  const returnValue = [] as unknown as
  ProtoChain<Class, ClassesOrInstances>;
  let index: TupleIndices<typeof returnValue> = 0 as TupleIndices<typeof returnValue>;

  while (baseClassProto !== current) {
    parent = getPrototypeOf<typeof current>(current);
    // current is a Class symbol/constructor. Object.getOwnPropertyDescriptors on current will include static properties.
    if (!isConstructor(current))
      break;
    if (returnType === 'classInstances') {
      const instanceOfCurrent = current.prototype as InstanceType<typeof current>;

      returnValue[index] = instanceOfCurrent as typeof returnValue[typeof index];
    }
    else {
      returnValue[index] = current as typeof returnValue[typeof index];
    }

    /**
     * Assign the super class to current.
     * If the argument is a class, Reflect.getPrototypeOf method returns the
     * superclass.
     */
    if (
      isConstructor(parent)
      && 'name' in parent
      && typeof parent.name === 'string'
      && '' !== parent.name // it's possible for a Function/Constructor to be anonymous...
    ) {
      current = parent as ProtoChainOfClass<Class>[TupleIndices<ProtoChainOfClass<Class>>];
    }
    else {
      break;
    }
    index++;
  }
  return returnValue;
  /*
    assuming current is NugetProjectProperties...
    Reflect.getPrototypeOf(current).name is 'MSBuildProjectProperties'
   */
}
