/**
 * A type for casting a property descriptor to a getter descriptor.\
 * Cast to this only after checking `typeof propertyDescriptor.get === 'function`
 * @template [T=unknown] The type of the property.
 * @since 4.0.0
 */
export type GetterDescriptor<T = unknown> = Omit<TypedPropertyDescriptor<T>, 'get'>
  & Required<Pick<TypedPropertyDescriptor<T>, 'get'>>;
