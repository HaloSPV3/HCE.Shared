import type { InstanceOrStatic } from '../miscTypes.js';
import type { BaseClassProto, ClassLike, ConstructorConstraint, SuperClassLike, WithProto } from './inheritance.js';
import type { InstancePropertyDescriptorMap } from './InstancePropertyDescriptorMap.js';
import type { OwnPropertyDescriptorMap } from './OwnPropertyDescriptorMap.js';

/**
 * Get the property descriptors of the class or constructor similar to {@link Object.getOwnPropertyDescriptors}, but with more options--including recursion.
 * @template {InstanceOrStatic} _InstanceOrStatic 'Instance' or 'Static'. Determines the return type.
 * @param classDefinition A class or constructor, cast to {@link ClassLike}.
 * @param instanceOrStatic 'Instance' or 'Static'. Determines the return type.
 * @template {ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>} Class
 * The typeof {@link classDefinition}.
 * {@link WithProto}<{@link SuperClassLike}> is necessary for walking the
 * prototype chain for both Instance  and Static properties.
 * If unspecified, the return type may be incorrect.
 * @returns ({@link instanceOrStatic} === 'Instance') ? {@link InstancePropertyDescriptorMap<Class>}\
 * : ({@link instanceOrStatic} === 'Static') ? {@link OwnPropertyDescriptorMap<Class>}\
 * : never
 * @throws {TypeError}
 * @since 3.0.0
 */
export function getOwnPropertyDescriptors<
  Class extends ClassLike<ConstructorConstraint<Class> & WithProto<SuperClassLike | BaseClassProto>>,
  _InstanceOrStatic extends InstanceOrStatic,
>(
  classDefinition: Class,
  instanceOrStatic: _InstanceOrStatic,
): [_InstanceOrStatic] extends ['Instance']
  ? InstancePropertyDescriptorMap<Class>
  : [_InstanceOrStatic] extends ['Static']
      ? OwnPropertyDescriptorMap<Class>
      : never {
  switch (instanceOrStatic) {
    case 'Instance': {
      return Object.getOwnPropertyDescriptors(classDefinition.prototype) as [Extract<typeof instanceOrStatic, 'Instance'>] extends ['Instance']
        ? InstancePropertyDescriptorMap<Class>
        : [_InstanceOrStatic] extends ['Static']
            ? OwnPropertyDescriptorMap<Class>
            : never;
    }
    case 'Static': {
      return Object.getOwnPropertyDescriptors(classDefinition) as [Extract<typeof instanceOrStatic, 'Static'>] extends ['Instance']
        ? InstancePropertyDescriptorMap<Class>
        : [_InstanceOrStatic] extends ['Static']
            ? OwnPropertyDescriptorMap<Class>
            : never;
    }
    default: {
      throw new TypeError('Argument `instanceOrStatic` must be "Instance" or "Static".');
    }
  }
}
