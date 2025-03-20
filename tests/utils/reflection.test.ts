import { deepStrictEqual } from 'node:assert/strict';
import { describe, it, skip } from 'node:test';
import { MSBuildProjectProperties } from '../../src/dotnet/MSBuildProjectProperties.js';
import { NugetProjectProperties } from '../../src/dotnet/NugetProjectProperties.js';
import {
  filterForGetters,
  getOwnPropertyDescriptors,
  getPrototypes,
  isConstructor,
  listOwnGetters,
} from '../../src/utils/reflection.js';

const NPPInstanceOwnGetters: string[] = [
  'Authors',
  'BuildOutputTargetFolder',
  'Company',
  'ContentTargetFolders',
  'Copyright',
  'DevelopmentDependency',
  'IncludeBuildOutput',
  'IncludeContentInPack',
  'IncludeSource',
  'IncludeSymbols',
  'IsPackable',
  'IsTool',
  'MinClientVersion',
  'NoPackageAnalysis',
  'NuspecBasePath',
  'NuspecFile',
  'NuspecProperties',
  'PackageDescription',
  'PackageIcon',
  'PackageId',
  'PackageLicenseExpression',
  'PackageLicenseFile',
  'PackageOutputPath',
  'PackageProjectUrl',
  'PackageReadmeFile',
  'PackageReleaseNotes',
  'PackageRequireLicenseAcceptance',
  'PackageTags',
  'PackageType',
  'PackageVersion',
  'Product',
  'RepositoryCommit',
  'RepositoryType',
  'RepositoryUrl',
  'SuppressDependenciesWhenPacking',
  'SymbolPackageFormat',
  'Title',
].sort();

await describe('filterForGetters', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(filterForGetters.name, c00.name);
  });
  await it('given a class prototype, can filter a PropertyDescriptors object to an array of getters\' property descriptors', () => {
    deepStrictEqual(
      filterForGetters(
        Object.getOwnPropertyDescriptors(NugetProjectProperties.prototype),
      )
        .map(v => v[0])
        .sort(),
      NPPInstanceOwnGetters,
    );
  });
  await it('given a class, can filter a PropertyDescriptors object to an array of getters\' property descriptors', () => {
    deepStrictEqual(
      filterForGetters(
        Object.getOwnPropertyDescriptors(
          // eslint-disable-next-line @typescript-eslint/no-extraneous-class
          class {
            static #var0: string;

            static get var0() {
              return this.#var0;
            }
          },
        ),
      )
        .map(v => v[0])
        .sort(),
      ['var0'],
    );
  });
});

await describe('getOwnPropertyDescriptors', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(getOwnPropertyDescriptors.name, c00.name);
  });
  await it('can be used to list all own and inherited instance getters of a class', () => {
    const propNames = getOwnPropertyDescriptors(
      NugetProjectProperties,
      true,
      true,
    )
      .map(o => Object.entries(o))
      .flat()
      .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
      .map(v => v[0]);

    deepStrictEqual(propNames.sort(), [
      'AssemblyName',
      'Authors',
      'BuildOutputTargetFolder',
      'Company',
      'ContentTargetFolders',
      'Copyright',
      'Description',
      'DevelopmentDependency',
      'IncludeBuildOutput',
      'IncludeContentInPack',
      'IncludeSource',
      'IncludeSymbols',
      'IsPackable',
      'IsTool',
      'MSBuildProjectFullPath',
      'MinClientVersion',
      'NoPackageAnalysis',
      'NuspecBasePath',
      'NuspecFile',
      'NuspecProperties',
      'OutputPath',
      'PackageDescription',
      'PackageIcon',
      'PackageId',
      'PackageLicenseExpression',
      'PackageLicenseFile',
      'PackageOutputPath',
      'PackageProjectUrl',
      'PackageReadmeFile',
      'PackageReleaseNotes',
      'PackageRequireLicenseAcceptance',
      'PackageTags',
      'PackageType',
      'PackageVersion',
      'Product',
      'RepositoryCommit',
      'RepositoryType',
      'RepositoryUrl',
      'RuntimeIdentifier',
      'RuntimeIdentifiers',
      'SuppressDependenciesWhenPacking',
      'SymbolPackageFormat',
      'TargetFramework',
      'TargetFrameworks',
      'Title',
      'Version',
      'VersionPrefix',
      'VersionSuffix',
    ]);
  });
  await it('can be used to list all own instance getters of a class', () => {
    let propNames = getOwnPropertyDescriptors(
      NugetProjectProperties,
      true,
      false,
    )
      .map(o => Object.entries(o))
      .flat()
      .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
      .map(v => v[0]);

    deepStrictEqual(propNames.sort(), NPPInstanceOwnGetters);

    propNames = getOwnPropertyDescriptors(MSBuildProjectProperties, true, false)
      .map(o => Object.entries(o))
      .flat()
      .filter(e => typeof e[1].get === 'function' && e[0] !== '__proto__')
      .map(v => v[0]);
    deepStrictEqual(
      propNames.sort(),
      [
        'AssemblyName',
        'Description',
        'MSBuildProjectFullPath',
        'OutputPath',
        'RuntimeIdentifier',
        'RuntimeIdentifiers',
        'TargetFramework',
        'TargetFrameworks',
        'Version',
        'VersionPrefix',
        'VersionSuffix',
      ].sort(),
    );
  });
  await it('can be used to list all own and inherited static methods of a class', () => {
    const propNames = getOwnPropertyDescriptors(
      NugetProjectProperties,
      false,
      true,
    )
      .flatMap(o => Object.entries(o))
      .filter(e => typeof e[1].value === 'function')
      .map(v => v[0]);

    deepStrictEqual(propNames.sort(), ['GetFullPath', 'getAndForget'].sort());
  });
  await it('can be used to list all own static getters of a class', () => {
    const propNames = getOwnPropertyDescriptors(
      NugetProjectProperties,
      false,
      false,
    ).map(o => Object.entries(o))
      .flat()
      .filter(e => typeof e[1].value === 'function')
      .map(v => v[0]);

    deepStrictEqual(propNames.sort(), []);
  });
});

await describe('getPrototypes', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(c00.name, getPrototypes.name);
  });

  await it('return expected classes', () => {
    const actualNpp = getPrototypes(NugetProjectProperties);
    const expectedNpp = [NugetProjectProperties, MSBuildProjectProperties];
    deepStrictEqual(actualNpp, expectedNpp);

    const actualMpp = getPrototypes(MSBuildProjectProperties);
    const expectedMpp = [MSBuildProjectProperties];
    deepStrictEqual(actualMpp, expectedMpp);
  });

  await it('returns expected instance prototypes', () => {
    const actualNpp = getPrototypes(NugetProjectProperties, 'classInstances');
    const expectedNpp = [
      NugetProjectProperties.prototype,
      MSBuildProjectProperties.prototype,
    ];
    deepStrictEqual(actualNpp, expectedNpp);

    const actualMpp = getPrototypes(MSBuildProjectProperties, 'classInstances');
    const expectedMpp = [MSBuildProjectProperties.prototype];
    deepStrictEqual(actualMpp, expectedMpp);
  });
});

await describe('isConstructor', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(isConstructor.name, c00.name);
  });
  await it('returns true for a ClassLike arg', () => {
    deepStrictEqual(isConstructor(NugetProjectProperties), true);
    deepStrictEqual(isConstructor(MSBuildProjectProperties), true);
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

await describe('listOwnGetters', async (c00) => {
  await it('has expected name', () => {
    deepStrictEqual(listOwnGetters.name, c00.name);
  });
  await it('returns expected values', () => {
    deepStrictEqual(
      listOwnGetters(NugetProjectProperties).sort(),
      NPPInstanceOwnGetters.sort(),
    );
  });
});
