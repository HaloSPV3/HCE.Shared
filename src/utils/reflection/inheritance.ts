import type { Increment } from '../GracefulRecursion.js';
import type { Integer } from '../miscTypes.js';
import type { FunctionLike } from './FunctionLike.js';
import { getPrototypeOf } from './getPrototypeOf.js';
import type { PropertyDescriptorMap } from './PropertyDescriptorMap.js';

/**
 * The `[[Prototype]]` (i.e. `__proto__`) of any base class.
 * @since 3.0.0
 */
export type BaseClassProto = (() => object) & {
  /** @example BaseClass.__proto__.__proto__.toString() === '[object Object]' */
  ['__proto__']: ObjectConstructor['prototype'] & {
    ['__proto__']: null;
    constructor: ObjectConstructor;
  };
  constructor: IBaseClass;
  length: 0;
  name: '';
};

/**
 * The `[[Prototype]]` of all base classes.
 * @since 3.0.0
 */
export const baseClassProto: BaseClassProto = getPrototypeOf(Object as BaseClass<ObjectConstructor>);

/**
 * [INTERNAL]
 * An interface representing for attaching base class properties to a class type.
 * This kept separate from {@link BaseClass} so it can be used by {@link BaseClassProto}.
 * @since 3.0.0
 */
interface IBaseClass {
  /**
   * Readable for compatibility reasons, but invisible and non-enumerable in Node.js runtime.
   * @example BaseClass.__proto__.toString() === 'function () { [native code] }'
   */
  ['__proto__']: BaseClassProto;

  constructor: FunctionConstructor & { name: 'Function' };
}

/**
 * Type a class type as a base class.
 * Note: is `Class & ...`
 * @since 3.0.0
 */
export type BaseClass<Class extends ConstructorConstraint<Class>>
  = IClass<Class> & IBaseClass;

/**
 * A type representing any unknown constructor.
 * @since 3.0.0
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor_Unknown = abstract new (...args: any[]) => any;

/**
 * The constraint for constructor types.
 * This is intended for generic type constraints.
 * For conditional return types, use `T extends Constructor<T>` instead.
 * @template T Any newable constructor type
 * @since 3.0.0
 */
export type ConstructorConstraint<T extends abstract new (...args: ConstructorParameters<T>) => InstanceType<T>> = abstract new (...arguments_: ConstructorParameters<T>) => InstanceType<T>;

/**
 * {@link T} is a class constructor or unknown constructor. Else, `never`.
 *
 * Consider using {@link ClassLike} where walking the inheritance chain is necessary.
 * @template [T=Constructor_Unknown]
 * @since 3.0.0
 */
export type ConstructorLike<T = Constructor_Unknown>
  = T extends Constructor_Unknown
    ? T extends ConstructorConstraint<T>
      ? T & ConstructorConstraint<T>
      : T & Constructor_Unknown
    : never;

/**
 * A type representing unknown {@link ClassLike} types.
 * @since 3.0.0
 */
export type ClassLike_Unknown
  = IClass<
    Constructor_Unknown
    & WithProto<SuperClassLike | BaseClassProto>
  >;

/**
 * A subset of {@link ProtoOrSuperClass} suitable for a class's `[[Prototype]]`
 * @since 3.0.0
 */
export type SuperClassLike = BaseClass<Constructor_Unknown> | ClassLike_Unknown;

/**
 * A terrible type. Use it if you must, but prefer other types when possible.
 *
 * Covers most SuperClass/Prototype types.
 * A class that does not extend another class will satisfy {@link BaseClass}.
 *
 * If a type extends {@link ProtoOrSuperClass} and is `null`, you cannot get the
 * type's keys. See {@link ./OwnKeyOf.ts}.
 * @template [T=ReturnType<typeof Reflect.getPrototypeOf>] `null` or an `object`-like type.
 * @since 3.0.0
 */
export type ProtoOrSuperClass<T extends object | null = ReturnType<typeof Reflect.getPrototypeOf>>
  = T extends null ? null
    : T extends object
      ? T extends ConstructorLike<T>
        ? T extends ClassLike<T & WithProto<SuperClassLike | BaseClassProto>>
          ? T extends BaseClass<T> ? ClassLike<BaseClass<T>>
            : ClassLike<T>
          : T extends BaseClass<T>
            ? BaseClass<T>
            : ConstructorLike<T>
        : T extends FunctionLike<infer FunctionConstraint>
          ? T extends FunctionConstraint
            ? FunctionLike<T>
            : T & FunctionLike<FunctionConstraint>
          : T extends object
            ? T & object
            : never
      : never;

/**
 * The {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain prototype chain} of any `object`-like type.
 * Not to be confused with the _instance_ `.prototype` chain!
 * ```
 * > util.isDeepStrictEqual(Object.getOwnPropertyDescriptors({}.__proto__), Object.getOwnPropertyDescriptors(Object.prototype))
 * true
 * ```
 * @template Object0 Any type with its `[[Prototype]]` attached as a `__proto__` property. The type of `__proto__` must extend {@link ProtoOrSuperClass}.
 * @template [Limit=16]
 * The maximum depth of recursion.
 * Affects the maximum length of the returned type.\
 * CAUTION: Larger values will severely degrade performance.
 * 50 or more will trigger infinite-or-near-infinite-recursion errors.
 * @template [CurrentLevel=0] (INTERNAL) The current depth of the prototype chain.
 * @since 3.0.0
 */
export type ProtoChainOfObject<
  Object0 extends WithProto<ProtoOrSuperClass>,
  Limit extends Integer<number> = 16,
  CurrentLevel extends Integer<number> = 0,
> = PropertyDescriptorMap<Object0['__proto__']> extends PropertyDescriptorMap<ObjectConstructor['prototype']>
  ? [Object0]
  : Object0['__proto__'] extends WithProto<ProtoOrSuperClass>
    ? CurrentLevel extends Limit ? [Object0]
      : [
          Object0,
          ...ProtoChainOfObject<Object0['__proto__'], Limit, Increment<CurrentLevel>>,
        ]
    : never;

/**
 * The {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain prototype chain} of an object (particularly, a class).
 * @template Class Any type with its `[[Prototype]]` attached as a `__proto__` property.
 * The type of `__proto__` must extend {@link SuperClassLike} or {@link BaseClassProto}.
 * @template [Limit=16]
 * The maximum depth of recursion.
 * Affects the maximum length of the returned type.\
 * CAUTION: Larger values will severely degrade performance.
 * 50 or more will trigger infinite-or-near-infinite-recursion errors.
 * @template [CurrentLevel=0] (INTERNAL) The current depth of the prototype chain.
 * @since 3.0.0
 */
export type ProtoChainOfClass<
  Class extends WithProto<SuperClassLike | BaseClassProto>,
  Limit extends Integer<number> = 16,
  CurrentLevel extends Integer<number> = 0,
> = Class['__proto__'] extends BaseClassProto ? [Class]
  : Class['__proto__'] extends SuperClassLike
    ? CurrentLevel extends Limit ? [Class]
      : [
          Class,
          ...ProtoChainOfClass<Class['__proto__'], Limit, Increment<CurrentLevel>>,
        ]
    : never;

/**
 * The {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain prototype chain} of a class instance.
 * @template Class A constructor type with its `[[Prototype]]` attached as a `__proto__` property.
 * @template [Limit=16]
 * The maximum depth of recursion.
 * Affects the maximum length of the returned type.\
 * CAUTION: Larger values will severely degrade performance.
 * 50 or more will trigger infinite-or-near-infinite-recursion errors.
 * @template [CurrentLevel=0] (INTERNAL) The current depth of the prototype chain.
 * @since 3.0.0
 */
export type ProtoChainOfClassInstance<
  Class extends ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>,
  Limit extends Integer<number> = 16,
  CurrentLevel extends Integer<number> = 0,
> = Class['__proto__'] extends BaseClassProto ? [InstanceType<Class>]
  : Class['__proto__'] extends SuperClassLike
    ? CurrentLevel extends Limit ? [InstanceType<Class>]
      : [
          InstanceType<Class>,
          ...ProtoChainOfClassInstance<Class['__proto__'], Limit, Increment<CurrentLevel>>,
        ]
    : never;

/**
 * Augment a class type to expose properties not exposed by TypeScript by default.
 * Note: is `Class & ...`
 * @template Class The typeof any class. If the type is unknown, wrap it with {@link ConstructorConstraint}.
 * @since 3.0.0
 */
// defined as `type` because interfaces cannot extend their generic parameters
export type IClass<Class extends ConstructorConstraint<Class>>
  = Class
    & {
      prototype: InstanceType<Class>;
      name: ConstructorConstraint<Class>['name'];
      length: ConstructorConstraint<Class>['length'];
    };

/**
 * A more fleshed-out Class type.
 *
 * Note: is `Class & ...`
 *
 * In addition to the Constructor constraint, this type...
 * - Sets the type of the immediate superclass.
 * - Sets `prototype` to {@link InstanceType}
 * @template Class The `typeof MyClass`. If this class extends a class, pass `typeof MySuperClass` to the generic argument {@link Class}.
 * @example
 * type Class_MyClass = ClassLike<typeof MyClass & WithProto<BaseClass<typeof MyBaseClass>>;
 * @since 3.0.0
 */
export type ClassLike<
  Class extends ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>,
> = Class extends BaseClass<Class> ? Class
  : Class['__proto__'] extends BaseClassProto ? BaseClass<Class>
    : Class['__proto__'] extends ConstructorLike<Class['__proto__']>
      ? IClass<Class> & WithProto<ConstructorLike<Class['__proto__']>>
      // Here, __proto__ is retained via Class
      : IClass<Class>;

/**
 * If {@link T} is a class or constructor, {@link InstanceType}<{@link T}>. Else, {@link T}.
 * @template T `null` or any `object`-like type.
 * @since 3.0.0
 */
export type InstanceTypeOrSelf<T extends object | null> = T extends ConstructorLike
  ? T extends ConstructorLike<T>
    ? InstanceType<T>
    : T
  : T;

/**
 * Interface for attaching a `__proto__` to an object e.g. `T0 & WithProto<T1>`
 * @template __proto__ the type of the an object's `[[Prototype]]`.
 * @since 3.0.0
 */
export interface WithProto<__proto__ extends ProtoOrSuperClass> {
  ['__proto__']: __proto__;
}
