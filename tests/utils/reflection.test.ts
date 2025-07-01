import { ok } from 'node:assert';
import { deepStrictEqual } from 'node:assert/strict';
import { describe, it, skip } from 'node:test';
import {
  MSBuildProjectProperties as MSBPP,
  type Class_MSBPP,
} from '../../src/dotnet/MSBuildProjectProperties.js';
import {
  NugetProjectProperties,
  type Class_NPP,
} from '../../src/dotnet/NugetProjectProperties.js';
import type { BooleanString } from '../../src/utils/miscTypes.js';
import {
  filterForGetters,
  getOwnPropertyDescriptors,
  getOwnPropertyDescriptorsRecursively,
  getPrototypesChainOf,
  isConstructor,
  listOwnGetters,
  type BaseClass,
  type ClassLike,
  type getPrototypeOf,
  type GetterDescriptor,
  type InstanceTypeOrSelf,
  type OwnGetterDescriptorMap,
  type OwnKeyOf,
  type OwnPropertyDescriptorMap,
  type PropertyDescriptorMap,
  type ProtoChainOfClass,
  type ProtoOrSuperClass,
  type RecursedPropertyDescriptorMap,
  type RecursedPropertyDescriptorMapArray,
  type WithProto,
} from '../../src/utils/reflection.js';
import type { PickKeys } from 'ts-essentials';
class TestClass0 {
  private static readonly _booleanDefault = true;
  private static readonly _stringDefault = '';
  public static get BooleanDefault(): true { return this._booleanDefault; }
  public static get StringDefault(): '' { return this._stringDefault; }

  public static IsStringDefault(s: string): s is '' { return s === ''; }

  public readonly InheritedProperty = 0;
}
type Class_TestClass0 = ClassLike<BaseClass<typeof TestClass0>>;

class TestClass1 extends TestClass0 {
  private _boolean: boolean | undefined;
  private _string: string | undefined;

  constructor(boolean?: boolean, string?: string) {
    super();
    if (boolean)
      this._boolean = boolean;
    if (string)
      this._string = string;
  }

  public get Boolean() { return this._boolean ??= TestClass0.BooleanDefault; }
  public get String() { return this._string ??= TestClass0.StringDefault; }

  public IsStringDefault(): boolean { return this.String === ''; }
}

type Class_TestClass1 = ClassLike<typeof TestClass1 & WithProto<Class_TestClass0>>;

await describe('filterForGetters', async () => {
  await it('can filter a class instance\'s OwnPropertyDescriptorMap to an array of getters\' property descriptors', () => {
    const descriptorMap = getOwnPropertyDescriptors(TestClass1 as Class_TestClass1, 'Instance');
    const getterMap = filterForGetters(descriptorMap);
    const getterKeys = Reflect.ownKeys(getterMap) as (keyof typeof getterMap)[];
    deepStrictEqual(
      getterKeys.toSorted((a, b) => String(a).localeCompare(String(b))),
      ['Boolean', 'String'],
    );
  });
  await it('can filter a class\'s static getters from an OwnPropertyDescriptorMap to an OwnGetterDescriptorMap', () => {
    const descriptorMap = getOwnPropertyDescriptors(TestClass0 as ClassLike<BaseClass<typeof TestClass0>>, 'Static');
    const gettersMap = filterForGetters(descriptorMap);
    const getterKeys = Reflect.ownKeys(gettersMap) as (keyof typeof gettersMap)[];
    deepStrictEqual(
      getterKeys.toSorted((a, b) => String(a).localeCompare(String(b))),
      ['BooleanDefault', 'StringDefault'],
    );
  });
});

// #region dangerousTypes https://stackoverflow.com/a/55128956/14894786

// https://stackoverflow.com/a/55128956/14894786
// oh boy don't do this
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type LastOf<T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  = UnionToIntersection<T extends any ? () => T : never> extends () => (infer R) ? R : never;

// TS4.0+
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Push<T extends any[], V> = [...T, V];

// TS4.1+
type TuplifyUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false>
  = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

// #endregion dangerousTypes
await describe('getOwnPropertyDescriptors', async () => {
  await it('can be used to list all own, non-inherited getters of a class instance', () => {
    const ownPropertyDescriptorMapOfTestClass1Instance = getOwnPropertyDescriptors(
      TestClass1 as Class_TestClass1,
      'Instance',
    );
    const ownInstanceGetterNames: (keyof TestClass1)[] = [];

    for (const key of Reflect.ownKeys(ownPropertyDescriptorMapOfTestClass1Instance) as (OwnKeyOf<TestClass1, TestClass0>)[]) {
      const element = ownPropertyDescriptorMapOfTestClass1Instance[key];
      if (typeof element.get === 'function')
        ownInstanceGetterNames.push(key);
    }

    deepStrictEqual(
      ownInstanceGetterNames.toSorted((a, b) => a.localeCompare(b)),
      ['Boolean', 'String'],
    );
  });
  await it('can be used to list all own and inherited static methods of a class', () => {
    const arrayOfOwnPropertyDescriptorMaps = getOwnPropertyDescriptorsRecursively(
      NugetProjectProperties as Class_NPP,
      'Static',
    ) satisfies [OwnPropertyDescriptorMap<Class_NPP>, OwnPropertyDescriptorMap<Class_MSBPP>];

    deepStrictEqual(
      arrayOfOwnPropertyDescriptorMaps[0],
      {
        length: {
          value: 2,
          writable: false,
          enumerable: false,
          configurable: true,
        },
        name: {
          value: 'NugetProjectProperties',
          writable: false,
          enumerable: false,
          configurable: true,
        },
        prototype: {
          value: NugetProjectProperties.prototype,
          writable: false,
          enumerable: false,
          configurable: false,
        },
      },
    );
    deepStrictEqual(
      arrayOfOwnPropertyDescriptorMaps[1],
      {
        length: {
          value: 2,
          writable: false,
          enumerable: false,
          configurable: true,
        },
        name: {
          value: 'MSBuildProjectProperties',
          writable: false,
          enumerable: false,
          configurable: true,
        },
        prototype: {
          value: MSBPP.prototype,
          writable: false,
          enumerable: false,
          configurable: false,
        },
        GetFullPath: {
          // eslint-disable-next-line @typescript-eslint/unbound-method
          value: MSBPP.GetFullPath,
          writable: true,
          enumerable: false,
          configurable: true,
        },
        getAndForget: {
          value: Reflect.getOwnPropertyDescriptor(MSBPP as Class_MSBPP & { getAndForget: typeof MSBPP['getAndForget'] }, 'getAndForget')?.value as TypedPropertyDescriptor<typeof MSBPP['getAndForget']>,
          writable: true,
          enumerable: false,
          configurable: true,
        },
      },
    );

    const keys: NoRepetition<
      'length'
      | 'name'
      | 'prototype'
      | 'GetFullPath'
      | 'getAndForget'
    > = [
      ...Reflect.ownKeys(arrayOfOwnPropertyDescriptorMaps[1]) as ('getAndForget' | OwnKeyOf<typeof arrayOfOwnPropertyDescriptorMaps[1], { __proto__: undefined }>)[],
      ...Reflect.ownKeys(arrayOfOwnPropertyDescriptorMaps[0]) as OwnKeyOf<typeof arrayOfOwnPropertyDescriptorMaps[0], typeof arrayOfOwnPropertyDescriptorMaps[1]>[],
    ] as [
      ...TuplifyUnion<
        Exclude<
          keyof typeof arrayOfOwnPropertyDescriptorMaps[1] | keyof typeof arrayOfOwnPropertyDescriptorMaps[0],
          'constructor' | '__proto__'
        >
      >,
    ];

    const staticMethodNames: NoRepetition<'GetFullPath' | 'getAndForget'> = keys.filter(
      key =>
        typeof MSBPP[key] === 'function',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    ) as NoRepetition<PickKeys<typeof MSBPP, Function>>;
    deepStrictEqual(
      staticMethodNames,
      ['GetFullPath', 'getAndForget'],
    );
  });
});

// https://stackoverflow.com/a/63116449/14894786
// for TypeScript 4
type PushFront<TailT extends unknown[], HeadT>
    = ((head: HeadT, ...tail: TailT) => void) extends ((...array: infer ArrayT) => void) ? ArrayT : never;

type NoRepetition<U extends string, ResultT extends unknown[] = []> = {
  [k in U]: PushFront<ResultT, k> | NoRepetition<Exclude<U, k>, PushFront<ResultT, k>>
}[U];

await describe('getOwnPropertyDescriptorsRecursively', async () => {
  await it('can be used to list all own and inherited instance getters of a class (You _can_, but it sucks so much. Use getPrototypes and listOwnGetters, instead!)', () => {
    const recursedInstancePropertyDescriptorMaps: [
      RecursedPropertyDescriptorMap<Class_TestClass1, 'Instance'>,
      RecursedPropertyDescriptorMap<Class_TestClass0, 'Instance'>,
    ] = getOwnPropertyDescriptorsRecursively(
      TestClass1 as Class_TestClass1,
      'Instance',
    );

    const getterMaps = recursedInstancePropertyDescriptorMaps.map(
      (v) => {
        return filterForGetters(v);
      }) as [
      OwnGetterDescriptorMap<InstanceType<typeof TestClass1>, InstanceType<typeof TestClass0>>,
      OwnGetterDescriptorMap<InstanceType<typeof TestClass0>, null>,
    ];

    const keys: NoRepetition<'Boolean' | 'String'> = getterMaps.flatMap((
      map:
        OwnGetterDescriptorMap<InstanceType<Class_TestClass1>, InstanceType<Class_TestClass0>>
        | OwnGetterDescriptorMap<InstanceType<Class_TestClass0>, null>,
    ) => {
      if (map === getterMaps[0]) {
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        const keys: NoRepetition<'Boolean' | 'String'> = Reflect.ownKeys(getterMaps[0]) as NoRepetition<Exclude<keyof typeof getterMaps[0], typeof TestClass1['IsStringDefault']['name'] & 'IsStringDefault'>>;
        return keys;
      }
      else if (map === getterMaps[1]) {
        /**
         * TypeScript does not differentiate getters and readonly fields.
         *
         * {@link TestClass0#InheritedProperty} must be excluded manually.
         */
        const keys: [] = Reflect.ownKeys(getterMaps[1]) as NoRepetition<Exclude<keyof typeof getterMaps[1], 'InheritedProperty'>>;
        return keys;
      }
      else throw new RangeError('Current getterMap is unexpected');
    }) satisfies ('Boolean' | 'String')[] as NoRepetition<'Boolean' | 'String'>;

    deepStrictEqual(keys.sort(), ['Boolean', 'String']);
  });
});

await describe('getPrototypesChain', async () => {
  await it('return expected classes', () => {
    const actual_classes: [Class_TestClass1, Class_TestClass0] = getPrototypesChainOf(TestClass1 as Class_TestClass1, 'classes');
    const expected_classes = [TestClass1 as Class_TestClass1, TestClass0 as Class_TestClass0];
    deepStrictEqual(actual_classes, expected_classes);

    const actual_instances: [InstanceType<Class_TestClass0>] = getPrototypesChainOf(TestClass0 as Class_TestClass0, 'classInstances');
    const expected_instances = [TestClass0.prototype] as const;
    deepStrictEqual(actual_instances, expected_instances);
  });

  await it('returns expected instance prototypes', () => {
    const actualNpp: [TestClass1, TestClass0] = getPrototypesChainOf(TestClass1 as Class_TestClass1, 'classInstances');
    const expectedNpp: [TestClass1, TestClass0] = [
      TestClass1.prototype,
      TestClass0.prototype,
    ];
    deepStrictEqual(actualNpp, expectedNpp);

    const actualMpp = getPrototypesChainOf(TestClass0 as Class_TestClass0, 'classInstances');
    const expectedMpp = [TestClass0.prototype];
    deepStrictEqual(actualMpp, expectedMpp);
  });
});

await describe('isConstructor', async () => {
  await it('returns true for a ClassLike arg', () => {
    deepStrictEqual(isConstructor(TestClass1), true);
    deepStrictEqual(isConstructor(TestClass0), true);
    deepStrictEqual(isConstructor(Object), true);
    deepStrictEqual(isConstructor(String), true);
    deepStrictEqual(isConstructor(Function), true);
  });
  /**
   * Unfortunately, many functions have a constructor in their prototype. These
   * functions are treated like classes due to JavaScript's poor distinction between
   * classes and functions.\
   * Typescript can enforce "new" keyword usage, but overriding the type
   * allows you to `new isConstructor()` despite this function not intended to be
   * used with the `new` keyword.
   */
  await skip('returns false for functions that cannot be constructed with Reflect.construct', () => {
    deepStrictEqual(isConstructor(isConstructor), false);
  });
  await it('returns false for args that are not or do not have constructors', () => {
    deepStrictEqual(isConstructor({}), false);
    deepStrictEqual(isConstructor('test'), false);
  });
});

await describe('listOwnGetters', async () => {
  await it('can list all own static getters', () => {
    const getters: never[] = listOwnGetters(
      TestClass1 as Class_TestClass1,
      'Static',
    );
    deepStrictEqual(
      getters,
      [],
    );
  });

  await it('can list all own instance getters', () => {
    deepStrictEqual(
      listOwnGetters(
        TestClass1 as Class_TestClass1,
        'Instance',
      ),
      ['Boolean', 'String'],
    );
  });
});

// #region Notes

/* eslint-disable @typescript-eslint/no-unused-vars */

type _RecursedPropertyDescriptorMapArray_NPP_Instance = RecursedPropertyDescriptorMapArray<Class_NPP, 'Instance'>;
const __RecursedPropertyDescriptorMapArray_NPP_Instance: _RecursedPropertyDescriptorMapArray_NPP_Instance extends [
  RecursedPropertyDescriptorMap<Class_NPP, 'Instance'>,
  RecursedPropertyDescriptorMap<Class_MSBPP, 'Instance'>,
] ? true : false
= true;
ok(__RecursedPropertyDescriptorMapArray_NPP_Instance);

type _RecursedPropertyDescriptorMapArray_NPP_Static = RecursedPropertyDescriptorMapArray<Class_NPP, 'Static'>;
const __RecursedPropertyDescriptorMapArray_NPP_Static: _RecursedPropertyDescriptorMapArray_NPP_Static extends [
  RecursedPropertyDescriptorMap<Class_NPP, 'Static'>,
  RecursedPropertyDescriptorMap<Class_MSBPP, 'Static'>,
] ? true : false
= true;
ok(__RecursedPropertyDescriptorMapArray_NPP_Static);

type _PropertyDescriptorMap_NPP_Instance = PropertyDescriptorMap<NugetProjectProperties>;
const __PropertyDescriptorMap_NPP_Instance: _PropertyDescriptorMap_NPP_Instance extends PropertyDescriptorMap<NugetProjectProperties>
  ? true
  : false
= true;
ok(__PropertyDescriptorMap_NPP_Instance);

type _PropertyDescriptorMap_NPP_Instance_Own = PropertyDescriptorMap<NugetProjectProperties, MSBPP>;
const __PropertyDescriptorMap_NPP_Instance_Own: _PropertyDescriptorMap_NPP_Instance_Own extends PropertyDescriptorMap<NugetProjectProperties, MSBPP>
  ? true
  : false
= true;
ok(__PropertyDescriptorMap_NPP_Instance_Own);

type _PickOwnGetters<T extends object, S extends ProtoOrSuperClass> = Pick<PropertyDescriptorMap<T, S>, keyof OwnGetterDescriptorMap<T, S>>;
const __PickOwnGetters_NPP_Instance: _PickOwnGetters<NugetProjectProperties, MSBPP> extends {
  readonly IsPackable: TypedPropertyDescriptor<BooleanString>;
} ? true
  : false
= true;
ok(__PickOwnGetters_NPP_Instance);

/**
 * @example
 * type _POG_MSBPP = {
 *     prototype: TypedPropertyDescriptor<MSBPP>;
 *     GetFullPath: TypedPropertyDescriptor<(path: string) => string>;
 * }
 */
type _PickOwnGetters_MSBPP = _PickOwnGetters<typeof MSBPP, null>;
const __POG_MSBPP: _PickOwnGetters_MSBPP extends {
  prototype: TypedPropertyDescriptor<MSBPP>;
  GetFullPath: TypedPropertyDescriptor<(path: string) => string>;
} ? true
  : false
= true;
ok(__POG_MSBPP);

/**
 * @example
 * type _OwnGetterDescriptorMap_NPP_MSBPP = {}
 */
type _OwnGetterDescriptorMap_NPP_MSBPP_Static = OwnGetterDescriptorMap<Class_NPP, Class_MSBPP>;
const __OwnGetterDescriptorMap_NPP_MSBPP_Static: _OwnGetterDescriptorMap_NPP_MSBPP_Static extends { [P in OwnKeyOf<Class_NPP, Class_MSBPP>]: GetterDescriptor<Class_NPP[P]> }
  ? true : false = true;
ok(__OwnGetterDescriptorMap_NPP_MSBPP_Static);

/**
 * @example
 * type _keyof_OwnGetterDescriptorMap_NPP_MSBPP = "IsPackable" | "SuppressDependenciesWhenPacking" | "PackageVersion" | "PackageId" | "PackageDescription" | "Authors" | "Copyright" | "PackageRequireLicenseAcceptance" | "DevelopmentDependency" | "PackageLicenseExpression" | "PackageLicenseFile" | "PackageProjectUrl" | "PackageIcon" | "PackageReleaseNotes" | "PackageReadmeFile" | "PackageTags" | "PackageOutputPath" | "IncludeSymbols" | "IncludeSource" | "PackageType" | "IsTool" | "RepositoryUrl" | "RepositoryType" | "RepositoryCommit" | "SymbolPackageFormat" | "NoPackageAnalysis" | "MinClientVersion" | "IncludeBuildOutput" | "IncludeContentInPack" | "BuildOutputTargetFolder" | "ContentTargetFolders" | "NuspecFile" | "NuspecBasePath" | "NuspecProperties" | "Title" | "Company" | "Product"
 */
type _keyof_OwnGetterDescriptorMap_NPP_MSBPP_Static = keyof OwnGetterDescriptorMap<InstanceType<Class_NPP>, InstanceType<Class_MSBPP>>;
const __keyof_OwnGetterDescriptorMap_NPP_MSBPP_Static: _keyof_OwnGetterDescriptorMap_NPP_MSBPP_Static extends ('IsPackable' | 'SuppressDependenciesWhenPacking' | 'PackageVersion' | 'PackageId' | 'PackageDescription' | 'Authors' | 'Copyright' | 'PackageRequireLicenseAcceptance' | 'DevelopmentDependency' | 'PackageLicenseExpression' | 'PackageLicenseFile' | 'PackageProjectUrl' | 'PackageIcon' | 'PackageReleaseNotes' | 'PackageReadmeFile' | 'PackageTags' | 'PackageOutputPath' | 'IncludeSymbols' | 'IncludeSource' | 'PackageType' | 'IsTool' | 'RepositoryUrl' | 'RepositoryType' | 'RepositoryCommit' | 'SymbolPackageFormat' | 'NoPackageAnalysis' | 'MinClientVersion' | 'IncludeBuildOutput' | 'IncludeContentInPack' | 'BuildOutputTargetFolder' | 'ContentTargetFolders' | 'NuspecFile' | 'NuspecBasePath' | 'NuspecProperties' | 'Title' | 'Company' | 'Product')
  ? true : false = true;
ok(__keyof_OwnGetterDescriptorMap_NPP_MSBPP_Static);
/**
 * @example
 * InstanceType<typeof import('../dotnet/NugetProjectProperties.js').NugetProjectProperties>;
 * const __static: ("prototype" | "GetFullPath")[]
 * (K extends keyof (typeof NugetProjectProperties)) where typeof NugetProjectProperties[K] extends (() => unknown)
 */
const __listOwnInstanceGetters_NPP = listOwnGetters(NugetProjectProperties as Class_NPP, 'Instance');
ok(__listOwnInstanceGetters_NPP);
const __listOwnStaticGetters_NPP: never[] = listOwnGetters(NugetProjectProperties as Class_NPP, 'Static');
ok(__listOwnStaticGetters_NPP);

const _msbpp: typeof MSBPP = {} as ReturnType<typeof getPrototypeOf<Class_NPP>>;
ok(_msbpp);
const _instanceMembers = getOwnPropertyDescriptors(NugetProjectProperties as Class_NPP, 'Instance');
ok(_instanceMembers);

/** @satisfies {[Class_NPP, Class_MSBPP]} */
const _ProtoChainOfNPP: [Class_NPP, Class_MSBPP] = [] as unknown as ProtoChainOfClass<Class_NPP>;
ok(_ProtoChainOfNPP);

type _NPP_WithProto = Class_NPP;
type _NPP_WithProto_InstanceType = InstanceType<_NPP_WithProto>;
type _NPP_Proto_InstanceTypeOrSelf = InstanceTypeOrSelf<_NPP_WithProto['__proto__']>;

type _MSBPP_InstanceTypeOrSelf = InstanceTypeOrSelf<typeof MSBPP>;
// @ts-expect-error unused variable
const __MSBPP_InstanceTypeOrSelf: _MSBPP_InstanceTypeOrSelf = 0 as unknown as _MSBPP_InstanceTypeOrSelf;

type _OwnKeysOf_NPP_Instance = OwnKeyOf<
  _NPP_WithProto_InstanceType,
  _NPP_Proto_InstanceTypeOrSelf
>[];
// @ts-expect-error unused variable
const __OwnKeysOf_NPP_Instance: _OwnKeysOf_NPP_Instance = 0 as unknown as _OwnKeysOf_NPP_Instance;

/**
 * Welcome to Node.js v23.10.0.
 * Type ".help" for more information.
 *
 * > class Class0 { }
 * undefined
 *
 * > class Class1 extends Class0 { constructor(){ super() } }
 * undefined
 *
 * > var class1 = new Class1()
 * undefined
 *
 * > class1['prototype']
 * undefined
 *
 * > Class1.constructor
 * [Function: Function]
 *
 * > Class1.constructor.toString()
 * 'function Function() { [native code] }'
 *
 * > class1.constructor
 * [class Class1 extends Class0]
 *
 * > class1.constructor.prototype.
 * class1.constructor.prototype.__proto__             class1.constructor.prototype.hasOwnProperty        class1.constructor.prototype.isPrototypeOf         class1.constructor.prototype.propertyIsEnumerable
 * class1.constructor.prototype.toLocaleString        class1.constructor.prototype.toString              class1.constructor.prototype.valueOf
 *
 * class1.constructor.prototype.constructor
 *
 * > class1.constructor.
 * class1.constructor.__proto__             class1.constructor.hasOwnProperty        class1.constructor.isPrototypeOf         class1.constructor.propertyIsEnumerable  class1.constructor.toLocaleString
 * class1.constructor.valueOf
 *
 * class1.constructor.apply                 class1.constructor.arguments             class1.constructor.bind                  class1.constructor.call                  class1.constructor.caller
 * class1.constructor.constructor           class1.constructor.toString
 *
 * class1.constructor.length                class1.constructor.name                  class1.constructor.prototype
 *
 * > class1.constructor.__proto__
 * [class Class0]
 *
 * > Class1.__proto__
 * [class Class0]
 *
 * > Class0.__proto__.toString()
 * 'function () { [native code] }'
 */

// #region getOwnPropertyDescriptorRecursively

/**
 * PITFALL: TypeScript's language server diagnostics for mouse-over will shorten {@link TypedPropertyDescriptor<string>} to {@link string} and will error if you attempt to assign a {@link string}.
 */
const _getOwnPropertyDescriptorsRecursively_MSBPP_Instance: [{
  readonly MSBuildProjectFullPath: TypedPropertyDescriptor<string>;
  readonly AssemblyName: TypedPropertyDescriptor<string>;
  readonly Description: TypedPropertyDescriptor<string>;
  readonly OutputPath: TypedPropertyDescriptor<string>;
  readonly Version: TypedPropertyDescriptor<string>;
  readonly VersionPrefix: TypedPropertyDescriptor<string>;
  readonly VersionSuffix: TypedPropertyDescriptor<string>;
  readonly TargetFramework: TypedPropertyDescriptor<string>;
  readonly TargetFrameworks: TypedPropertyDescriptor<string>;
  readonly RuntimeIdentifier: TypedPropertyDescriptor<string>;
  readonly RuntimeIdentifiers: TypedPropertyDescriptor<string>;
}] = getOwnPropertyDescriptorsRecursively(MSBPP as Class_MSBPP, 'Instance');
ok(_getOwnPropertyDescriptorsRecursively_MSBPP_Instance);

const _getOwnPropertyDescriptorsRecursively_MSBPP_Static: [{
  GetFullPath: TypedPropertyDescriptor<(path: string) => string>;
}] = getOwnPropertyDescriptorsRecursively(MSBPP as Class_MSBPP, 'Static');
ok(_getOwnPropertyDescriptorsRecursively_MSBPP_Static);

const _ownPropertyDescriptorsRecursive_NPP_Instance = getOwnPropertyDescriptorsRecursively(NugetProjectProperties as Class_NPP, 'Instance');
const _ownPropertyDescriptorsRecursive_NPP_Instance_0 = _ownPropertyDescriptorsRecursive_NPP_Instance[0];
const _ownPropertyDescriptorsRecursive_NPP = getOwnPropertyDescriptorsRecursively(NugetProjectProperties as Class_NPP, 'Static');
ok(_ownPropertyDescriptorsRecursive_NPP);
const _isPackableDescriptor: TypedPropertyDescriptor<'false' | 'true'> = _ownPropertyDescriptorsRecursive_NPP_Instance_0.IsPackable;
ok(_isPackableDescriptor);

// #endregion getOwnPropertyDescriptorRecursively

// #endregion Notes
