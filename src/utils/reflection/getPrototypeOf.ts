import type { ProtoOrSuperClass, WithProto } from './inheritance.ts';

/**
 * A nearly useless wrapper for {@link Reflect.getPrototypeOf}
 * @param object An object with the internal `__proto__` property present in its type.
 * @returns The `__proto__` of the `object` param.
 */
export function getPrototypeOf<
  T extends WithProto<ProtoOrSuperClass>,
>(object: T): T['__proto__'] {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return Reflect.getPrototypeOf(object) as T['__proto__'];
}
