import type { GetterDescriptor } from './GetterDescriptor.js';

/**
 * A function for inferring a {@link TypedPropertyDescriptor} is a {@link GetterDescriptor}
 * @param propertyDescriptor The {@link TypedPropertyDescriptor} to inspect.
 * @returns `true` if {@link propertyDescriptor} describes a getter. Else, `false.
 * @since 3.0.0
 */
export function isGetterDescriptor<T>(propertyDescriptor: TypedPropertyDescriptor<T>): propertyDescriptor is GetterDescriptor<T> {
  return typeof propertyDescriptor.get === 'function';
};
