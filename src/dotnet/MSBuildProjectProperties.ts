import { strictEqual } from 'node:assert/strict';
import { existsSync } from 'node:fs';
import node_path from 'node:path';
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.js';
import type { BaseClass, ClassLike } from '../utils/reflection.js';

/**
 * Known properties. Additional properties may be added upon request.
 *
 * todo: add Reserved properties, Well-Known properties, Common properties, and more. Maybe as sub classes.
 * See:
 * - [MSBuild Reserved and Well-known Properties](https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-reserved-and-well-known-properties?view=vs-2022)
 * - [Common MSBuild project properties](https://learn.microsoft.com/en-us/visualstudio/msbuild/common-msbuild-project-properties?view=vs-2022)
 * - [Microsoft.NET.Sdk](https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props)
 * - [Microsoft.NET.Sdk.Web](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/web-sdk?view=aspnetcore-8.0&toc=%2Fdotnet%2Fnavigate%2Ftools-diagnostics%2Ftoc.json&bc=%2Fdotnet%2Fbreadcrumb%2Ftoc.json#properties)
 * - [Microsoft.NET.Sdk.Razor](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/sdk?view=aspnetcore-8.0&toc=%2Fdotnet%2Fnavigate%2Ftools-diagnostics%2Ftoc.json&bc=%2Fdotnet%2Fbreadcrumb%2Ftoc.json)
 * - [Microsoft.NET.Sdk.Desktop](https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props-desktop)
 */
export class MSBuildProjectProperties {
  // #region static

  /**
   * Resolve the given path if it is not absolute. If the path exists, it is returned. Else, an Error is thrown.
   * @param path The full file path of an MSBuild project.
   * @returns The absolute path to the MSBuild project file.
   */
  static GetFullPath(path: string) {
    if (!node_path.isAbsolute(path))
      path = node_path.resolve(path);
    if (!existsSync(path))
      throw new Error(`${node_path.basename(path)} could not be found at "${path}"`);
    return path;
  }

  /**
   * Note: This method may remove elements from {@link properties}.\
   * Try to get an element from {@link properties} by its {@link key}.
   * If an element is found, it is removed and the value of the element is returned.
   * Otherwise, `undefined` is returned.
   * @param properties The CaseInsensitiveMap of properties passed to the constructor.
   * @param key The key of the property to get from {@link properties}
   * @returns If found, the value of the `[string, string]` tuple found in {@link properties}. Else, `undefined`.
   */
  protected static getAndForget(
    properties: CaseInsensitiveMap<string, string>,
    key: string,
  ): string | undefined {
    const v: string | undefined = properties.get(key);
    if (v !== undefined)
      properties.delete(key);
    return v;
  }

  // #endregion static
  // #endregion static

  // #region private
  private _msbuildProjectFullPath: string | undefined;
  private _assemblyName: string | undefined;
  private _description: string | undefined;
  private _outputPath: string | undefined;
  private _runtimeIdentifier: string | undefined;
  private _runtimeIdentifiers: string | undefined;
  private _targetFramework: string | undefined;
  private _targetFrameworks: string | undefined;
  private _version: string | undefined;
  private _versionPrefix: string | undefined;
  private _versionSuffix: string | undefined;
  // #endregion private

  constructor(
    msbuildProjectFullPath: string,
    properties: CaseInsensitiveMap<string, string>,
  ) {
    // runtime type checks
    strictEqual(
      typeof msbuildProjectFullPath,
      'string',
      new TypeError(
        `msbuildProjectFullPath should be a string, not ${typeof msbuildProjectFullPath}!`,
      ),
    );
    strictEqual(
      properties instanceof CaseInsensitiveMap,
      true,
      `arg 'properties' should be instanceof ${CaseInsensitiveMap.name}`,
    );
    strictEqual(
      [...properties.keys()].every((v): v is string => typeof v === 'string'),
      true,
      'all keys in arg \'properties\' should be strings',
    );

    this._msbuildProjectFullPath = MPP.GetFullPath(msbuildProjectFullPath);
    this._assemblyName = MPP.getAndForget(properties, 'AssemblyName');
    this._description = MPP.getAndForget(properties, 'Description');
    this._outputPath = MPP.getAndForget(properties, 'OutputPath');
    this._runtimeIdentifier = MPP.getAndForget(properties, 'RuntimeIdentifier');
    this._runtimeIdentifiers = MPP.getAndForget(
      properties,
      'RuntimeIdentifiers',
    );
    this._targetFramework = MPP.getAndForget(properties, 'TargetFramework');
    this._targetFrameworks = MPP.getAndForget(properties, 'TargetFrameworks');
    this._version = MPP.getAndForget(properties, 'Version');
    this._versionPrefix = MPP.getAndForget(properties, 'VersionPrefix');
    this._versionSuffix = MPP.getAndForget(properties, 'VersionSuffix');
    // rest
    for (const key of properties.keys()) {
      const value = MPP.getAndForget(properties, key);
      if (value !== undefined) {
        Object.defineProperty(this, key, {
          value: value,
          writable: false,
          enumerable: true,
          configurable: true,
        });
      }
    }
  }

  get MSBuildProjectFullPath(): string {
    return this._msbuildProjectFullPath ??= '';
  }

  /**
   * @returns The name of the assembly.
   *
   * Default: {@link https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-reserved-and-well-known-properties#:~:text=MSBuildProjectDirectory,-Reserved MSBuildProjectDirectory}
   */
  get AssemblyName(): string {
    return this._assemblyName ??= '';
  }

  /**
   * A long description for the assembly.
   * If {@link NugetProperties.PackageDescription} is not specified, then this property is also used as the description of the package.
   * @returns The value of the `Description` property.
   */
  get Description(): string {
    return this._description ??= '';
  }

  /**
   * @returns The path of the build output.
   */
  get OutputPath(): string {
    return this._outputPath ??= '';
  }

  /**
   * Set Version -OR- VersionPrefix.
   * @returns The value of the `Version` property.
   */
  get Version(): string {
    return this._version ??= '';
  }

  /**
   * Set Version -OR- VersionPrefix.\
   * Setting {@link NugetProperties.PackageVersion} overwrites {@link VersionPrefix}
   * @returns The MAJOR.MINOR.PATCH string of the version.
   * @see {@link VersionSuffix}
   */
  get VersionPrefix(): string {
    return this._versionPrefix ??= '';
  }

  /**
   * The effect of this property on the package version depends on the values of the Version and VersionPrefix properties, as shown in the following table:
   * | Properties with values | Package version |
   * | ---------------------- | --------------- |
   * | None                   | 1.0.0           |
   * | Version                | $(Version)      |
   * | VersionPrefix only     | $(VersionPrefix) |
   * | VersionSuffix only     | 1.0.0-$(VersionSuffix) |
   * | VersionPrefix and VersionSuffix | $(VersionPrefix)-$(VersionSuffix) |
   * \
   * Setting {@link PackageVersion} overwrites {@link VersionSuffix}
   * @returns The string appended to the end of the MAJOR.MINOR.PATCH semver string (i.e. {@link VersionPrefix})
   */
  get VersionSuffix(): string {
    return this._versionSuffix ??= '';
  }

  /**
   * @returns The {@link https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props#targetframework Target Framework}
   * @see
   * https://learn.microsoft.com/en-us/nuget/reference/target-frameworks#supported-frameworks
   * https://learn.microsoft.com/en-us/dotnet/standard/frameworks
   */
  get TargetFramework(): string {
    return this._targetFramework ??= '';
  }

  /**
   * @returns The {@link https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props#targetframeworks Target Frameworks} (plural)
   * @see
   * https://learn.microsoft.com/en-us/nuget/reference/target-frameworks#supported-frameworks
   * https://learn.microsoft.com/en-us/dotnet/standard/frameworks
   */
  get TargetFrameworks(): string {
    return this._targetFrameworks ??= '';
  }

  /**
   * @returns
   * > The {@link https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props#runtimeidentifier `Runtime Identifier`} property lets you specify a single runtime
   * > identifier (RID) for the project. The RID enables publishing a
   * > self-contained deployment.
   * @see
   * https://learn.microsoft.com/en-us/dotnet/core/rid-catalog
   */
  get RuntimeIdentifier(): string {
    return this._runtimeIdentifier ??= '';
  }

  /**
   * @returns
   * > The {@link https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props#runtimeidentifiers `RuntimeIdentifiers`} property lets you specify a
   * > semicolon-delimited list of runtime identifiers (RIDs) for the project.
   * > Use this property if you need to publish for multiple runtimes.
   * > `RuntimeIdentifiers` is used at restore time to ensure the right assets
   * > are in the graph.
   * @see
   * https://learn.microsoft.com/en-us/dotnet/core/rid-catalog
   */
  get RuntimeIdentifiers(): string {
    return this._runtimeIdentifiers ??= '';
  }
}

const MPP = MSBuildProjectProperties;
export type Class_MSBPP = ClassLike<BaseClass<typeof MSBuildProjectProperties>>;
