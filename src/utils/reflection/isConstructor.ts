/**
 * A very jank function to determine if an object can be the target of Reflect.construct.
 * Unfortunately, many functions have a constructor in their prototype. These
 * functions are treated like classes due to JavaScript's poor distinction between
 * classes and functions.\
 * Typescript can enforce "new" keyword usage, but overriding the type
 * allows you to `new isConstructor()` despite this function not intended to be
 * used with the `new` keyword.
 * #### NOTE: Only works when targeting ES6/ES2015 or later.
 * > If your project or a dependent project is compiled to < ES6, this function will always return `false`; classes and constructors were introduced in ES6/ES2015.
 * @param obj Anything.
 * @returns `true` if the obj is a constructor. Else, `false`.
 * @since 3.0.0
 * @see https://stackoverflow.com/a/49510834
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isConstructor(obj: unknown): obj is abstract new (...args: any[]) => any {
  // Method 0 - filter
  if (typeof obj !== 'function')
    return false;

  // Method 1
  // statically-defined class
  if (/^class\s/.test(obj.toString()))
    return true;

  /* Method 2
   * > class class_ {}; function func(){}
   * undefined
   * > class_.prototype.constructor.name === class_.name
   * true
   * > func.prototype?.constructor?.name === func.name
   * false
   * typeof String.prototype ==='object'
   * > true
   * typeof Function.prototype === 'object';
   * > false
   * typeof Function.prototype
   * > 'function'
   */
  const prototype: unknown = obj.prototype;
  if ((typeof prototype === 'object' || typeof prototype === 'function')
    && prototype !== null
    && 'constructor' in prototype
    && typeof prototype.constructor === 'function') {
    const _ctor = prototype.constructor as (new (...arguments_: unknown[]) => unknown);
    const _name = Reflect.getOwnPropertyDescriptor(
      _ctor,
      'name',
    );
    // short-circuit if `obj.prototype.constructor` is a function, but not a constructor. Return false.
    return (
      _ctor === obj
      && _name?.writable === false
      && _name.enumerable === false
      && _name.configurable === true
    );
  }

  // Short-circuit
  // Method 3 catches exceptions when !isConstructor. When debugging, that's annoying.
  return false;

  // Method 3
  // isConstructable (See https://stackoverflow.com/a/49510834)
  // try {
  //   // @ts-expect-error ts(2351): Type 'Function' has no construct signatures.
  //   new new Proxy(obj, { construct: () => ({}) })()
  //   return true
  // }
  // catch {
  //   return false
  // }
}
