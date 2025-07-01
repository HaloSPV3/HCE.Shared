import type { ProtoOrSuperClass, WithProto } from './inheritance.js';

/**
 * A nearly useless wrapper for {@link Reflect.getPrototypeOf}
 * @param object An object with the internal `__proto__` property present in its type.
 * @returns The `__proto__` of the `object` param.
 */
export function getPrototypeOf<
  T extends WithProto<ProtoOrSuperClass>,
>(object: T): T['__proto__'] {
  return Reflect.getPrototypeOf(object) as T['__proto__'];
}
