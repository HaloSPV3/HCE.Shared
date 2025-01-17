/**
 * Returns the names of the instantiated, noninherited getters derived from the
 * given prototype or prototype of the given object.
 * @param instanceOrPrototype An instantiated object or a prototype.
 * @returns An array of names of getters that were not inherited from a parent class.
 * @since 3.0.0
 */
export function listOwnGetters(instanceOrPrototype: object): string[] {
  // if prototype in instance, then it's not an instance. Assign prototype.
  const prototype: object | null = 'prototype' in instanceOrPrototype && typeof instanceOrPrototype.prototype === 'object' && instanceOrPrototype.prototype !== null
    ? instanceOrPrototype.prototype
    : Reflect.getPrototypeOf(instanceOrPrototype)
  const descriptors = Object.getOwnPropertyDescriptors(prototype)
  const names = Object.entries(
    descriptors,
  ).filter(e =>
    typeof e[1].get === 'function' && e[0] !== '__proto__',
  ).map(e => e[0])
  return names
}

type ExceptProto<T> = T extends '__proto__' ? never : Exclude<T, '__proto__'>
type GetterDescriptor = PropertyDescriptor & Required<Pick<PropertyDescriptor, 'get'>>

/**
 * Converts a descriptors object to an array, filters the array for getters, and returns the getters array.
 * @param descriptors An object like the return value of Object.getOwnPropertyDescriptors
 * @returns An array of getters' key-Descriptor pairs
 * @since 3.0.0
 */
export function filterForGetters<T>(descriptors: ReturnType<typeof Object.getOwnPropertyDescriptors<T>>) {
  return Object.entries(
    descriptors,
  ).filter(
    (e): e is [
      ExceptProto<Extract<keyof typeof descriptors, string>>,
      GetterDescriptor,
    ] => e[0] !== '__proto__' && typeof e[1].get === 'function',
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassLike<T extends abstract new (...args: ConstructorParameters<T>) => InstanceType<T> = abstract new (...args: readonly any[] | any[]) => unknown>
  = abstract new (...args: ConstructorParameters<T>) => InstanceType<T>

/**
 * Get the property descriptors of the class or constructor similar to {@link Object.getOwnPropertyDescriptors}, but with more options--including recursion.
 * @param classDef A class or constructor requiring the 'new' keyword for instantiation.
 * @param instanceProps If true, only the instance properties are returned. Else, only static properties are returned.
 * @param recurse If true, recurse through super classes (as defined by extends) and return their properties.
 * @returns An array of PropertyDescriptor objects.
 * todo: refactor!: change instanceProps to flag enum (instanceProps, staticProps, allProps)
 * @since 3.0.0
 */
export function getOwnPropertyDescriptors<T extends ClassLike<T>>(classDef: T, instanceProps: boolean, recurse: boolean): ReturnType<typeof Object.getOwnPropertyDescriptors>[] {
  if (!recurse) return [Object.getOwnPropertyDescriptors(instanceProps ? classDef.prototype : classDef)]

  let currentNameDesc: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  let current: ClassLike<T> | ClassLike = classDef
  let parent: ClassLike | object | null = null
  const descriptors: ReturnType<typeof Object.getOwnPropertyDescriptors>[] = []

  /** conditions:
   * - {@link current.name} exists
   * - typeof current.name} === 'string'
   * - {@link current.name} is readonly and non-enumerable
   * - {@link current.name} !== ''
   * - {@link parent} is not null
   * - {@link parent} is a constructor function (or class definition)
   */
  function shouldLoop() {
    return 'name' in current
      && 'string' === typeof current.name
      && undefined !== (currentNameDesc = Reflect.getOwnPropertyDescriptor(current, 'name'))
      && false === (currentNameDesc.writable || currentNameDesc.enumerable)
      && '' !== current.name
  }

  // checking instanceProps outside of the `while` adds code redundancy, but slightly improves performance.
  if (instanceProps) {
    while (shouldLoop()) {
      descriptors.push(Object.getOwnPropertyDescriptors(current.prototype))
      if (null !== (parent = Reflect.getPrototypeOf(current)) && isConstructor(parent)) {
        current = parent
      }
      else {
        break
      }
    }
  }
  else /* !instanceProps */ {
    while (shouldLoop()) {
      descriptors.push(Object.getOwnPropertyDescriptors(instanceProps ? current : current.prototype)) // this is the only different to instanceProps' loop
      if (null !== (parent = Reflect.getPrototypeOf(current)) && isConstructor(parent)) {
        current = parent
      }
      else {
        break
      }
    }
  }

  return descriptors
}

/**
 * Iterate through the class and its base classes until an anonymous function is reached.
 * Returns all class instance prototypes--excluding the anonymous function--in descending order, with index 0 being the prototype of {@link classDef}
 *
 * This may work with non-class objects, but support for
 * @since 3.0.0
 */
export function getPrototypes<T extends ClassLike<T>>(classDef: ClassLike<T> | object) {
  // instance prototypes
  const prototypes: object[] = []
  let current: ClassLike<T> | ClassLike | object = classDef
  let parent: ClassLike | object | null
  while (undefined != (parent = Reflect.getPrototypeOf(current))) {
    // assume current is a Class symbol/constructor. Object.getOwnPropertyDescriptors on current will include static properties.
    prototypes.push(parent)
    /*
     * Assign the super class to current.
     * If the argument is a class, Object.getPrototypeOf method returns the
     * superclass.
     */
    if (
      null !== (parent = Reflect.getPrototypeOf(current))
      // && isConstructor(parent)
      // eslint-disable-next-line @stylistic/indent-binary-ops
      && 'name' in parent
      && typeof parent.name === 'string'
      && '' !== parent.name
      && parent !== undefined
    ) {
      current = parent
    }
    else { break }
  }
  return prototypes
  /*
    assuming current is NugetProjectProperties...
    Reflect.getPrototypeOf(current).name is 'MSBuildProjectProperties'
   */
}

/**
 * A very jank function to determine if an object can be the target of Reflect.construct.
 * Unfortunately, many functions have a constructor in their prototype. These
 * functions are treated like classes due to JavaScript's poor distinction between
 * classes and functions.\
 * Typescript can enforce "new" keyword usage, but overriding the type
 * allows you to `new isConstructor()` despite this function not intended to be
 * used with the `new` keyword.
 * @param obj
 * @returns
 * @since 3.0.0
 * @remarks Only works when targeting ES6/ES2015 or later. If your project or a dependent project is compiled to <= ES5/CJS, this function will always return `false`; classes and constructors were introduced in ES6/ES2015.
 * @see https://stackoverflow.com/a/49510834
 */
export function isConstructor(obj: unknown): obj is ClassLike {
  // Method 0 - filter
  if (typeof obj !== 'function')
    return false

  // Method 1
  // statically-defined class
  if (/^class\s/.test(obj.toString()))
    return true

  function descriptorMatchesConditions(pd: PropertyDescriptor | undefined, obj: { readonly name: string }) {
    if (pd === undefined)
      return false
    return pd.value === obj.name
      && pd.writable === false
      && pd.enumerable === false
      && pd.configurable === true
  }

  /* Method 2
   * > class class_ {}; function func(){}
   * undefined
   * > class_.prototype.constructor.name === class_.name
   * true
   * > func.prototype?.constructor?.name === func.name
   * false
   */
  if (
    typeof obj.prototype?.constructor === 'function'
    && descriptorMatchesConditions(Object.getOwnPropertyDescriptor(obj.prototype.constructor, 'name'), obj)
  ) {
    return true
  }

  // Method 3
  // isConstructable (See https://stackoverflow.com/a/49510834)
  try {
    // @ts-expect-error ts(2351): Type 'Function' has no construct signatures.
    new new Proxy(obj, { construct: () => ({}) })()
    return true
  }
  catch {
    return false
  }
}
