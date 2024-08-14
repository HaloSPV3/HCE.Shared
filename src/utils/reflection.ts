/**
 * Returns the names of the non-static, not-inherited getters derived from the
 * given prototype or prototype of the given object.
 * @param instanceOrPrototype An instantiated object or a prototype.
 * @returns An array of names of getters that were not inherited from a parent class.
 */
export function listOwnGetters(instanceOrPrototype: object): string[] {
  // if prototype in instance, then it's not an instance. Assign prototype.
  const prototype: object | null = ('prototype' in instanceOrPrototype && typeof instanceOrPrototype.prototype === 'object' && instanceOrPrototype.prototype !== null)
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

/**
 * Converts a descriptors object to an array, filters the array for getters, and returns the getters array.
 * @param descriptors An object like the return value of Object.getOwnPropertyDescriptors
 * @returns An array of getters' key-Descriptor pairs
 */
export function filterForGetters(descriptors: ReturnType<typeof Object.getOwnPropertyDescriptors>): [string, PropertyDescriptor][] {
  return Object.entries(
    descriptors,
  ).filter(
    e => typeof e[1].get === 'function' && e[0] !== '__proto__',
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = readonly any[]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IClass = abstract new (...args: Args[]) => any
type ConstructorLike<T> = IClass | (abstract new (...args: Args) => T) | (new (...args: Args) => T)

/**
 * Get the property descriptors of the class or constructor similar to {@link Object.getOwnPropertyDescriptors}, but with more options--including recursion.
 * @param classDef A class or constructor requiring the 'new' keyword for instantiation.
 * @param instanceProps If true, only the instance properties are returned. Else, only static properties are returned.
 * @param recurse If true, recurse through super classes (as defined by extends) and return their properties.
 * @returns An array of PropertyDescriptor objects.
 * todo: refactor!: change instanceProps to flag enum (instanceProps, staticProps, allProps)
 */
export function getOwnPropertyDescriptors(classDef: ConstructorLike<unknown>, instanceProps: boolean, recurse: boolean): ReturnType<typeof Object.getOwnPropertyDescriptors>[] {
  let currentNameDesc: ReturnType<typeof Reflect.getOwnPropertyDescriptor>
  let current = classDef
  let parent: object | null
  const descriptors: ReturnType<typeof Object.getOwnPropertyDescriptors>[] = []

  if (instanceProps) {
    if (!recurse) {
      descriptors.push(Object.getOwnPropertyDescriptors(current.prototype))
      return descriptors
    }

    /* conditions:
     * - current.name exists
     * - typeof current.name === 'string'
     * - current.name is readonly and non-enumerable
     * - current.name !== ''
     * - parent is not null
     * - parent is a constructor function (or class definition)
     */
    while (
      'name' in current
      && typeof current.name === 'string'
      && (currentNameDesc = Reflect.getOwnPropertyDescriptor(current, 'name')) !== undefined
      && currentNameDesc.writable === false
      && currentNameDesc.enumerable === false
      && current.name !== ''
      && (parent = Reflect.getPrototypeOf(current)) !== null
      && isConstructor(parent)) {
      descriptors.push(Object.getOwnPropertyDescriptors(current.prototype))
      current = parent
    }
    return descriptors
  }
  /* else !instanceProps */
  if (!recurse)
    return [Object.getOwnPropertyDescriptors(classDef)]
  while (
    'name' in current
    && typeof current.name === 'string'
    && (currentNameDesc = Reflect.getOwnPropertyDescriptor(current, 'name')) !== undefined
    && currentNameDesc.writable === false
    && currentNameDesc.enumerable === false
    && current.name !== ''
    && (parent = Reflect.getPrototypeOf(current)) !== null
    && isConstructor(parent)) {
    descriptors.push(Object.getOwnPropertyDescriptors(current)) // only difference to above WHILE is the the lack of prototype
    current = parent
  }
  return descriptors
}

/**
 * Iterate through the class and its base classes until an anonymous function is reached.
 * Returns all class instance prototypes--excluding the anonymous function--in descending order, with index 0 being the prototype of {@link classDef}
 */
export function getPrototypes(classDef: ConstructorLike<unknown>) {
  // instance prototypes
  const prototypes = []
  let current: ConstructorLike<unknown> = classDef
  let parent: object | null
  let prototypeOfCurrent
  while (
    (null !== (parent = Reflect.getPrototypeOf(current)))
    && isConstructor(parent)
    && '' !== parent.name
    && undefined !== (prototypeOfCurrent = getFunctionPrototype(current))
  ) {
    // assume current is a Class symbol/constructor. Object.getOwnPropertyDescriptors on current will include static properties.
    if (prototypeOfCurrent !== undefined)
      prototypes.push(prototypeOfCurrent)
    /*
     * Assign the super class to current.
     * If the argument is a class, Object.getPrototypeOf method returns the
     * superclass.
     */
    if (parent !== undefined)
      current = parent
  }
  return prototypes
  /*
    assuming current is NugetProjectProperties...
    Reflect.getPrototypeOf(current).name is 'MSBuildProjectProperties'
   */
}

/**
 * If obj is a function (or class), return obj.prototype. Else, return undefined.
 * @param obj
 * @returns
 */
export function getFunctionPrototype(obj: unknown): object | undefined {
  try {
    if (typeof obj === 'function')
      return obj.prototype
    return undefined
  }
  catch {
    return undefined
  }
}

/**
 * A very jank function to determine if an object can be the target of Reflect.construct.
 * @param obj
 * @returns
 */
export function isConstructor<T>(obj: T): obj is T & ConstructorLike<T> {
  if (typeof obj !== 'function')
    return false
  try {
    Reflect.construct<Args, T>(obj as new (...args: Args) => T, Object.freeze([]) as Readonly<Args>)
    return true
  }
  catch (e) {
    if (e instanceof TypeError && e.name === 'TypeError' && e.message.endsWith(' is not a constructor'))
      return false
    return true
  }
}
