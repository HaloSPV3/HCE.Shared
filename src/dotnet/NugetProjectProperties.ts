import { type } from 'arktype';
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.js';
import {
  tBooleanString,
  tEmptyOrBooleanString,
  type BooleanString,
  type EmptyOrBooleanString,
} from '../utils/miscTypes.js';
import {
  getPrototypesChainOf,
  listOwnGetters,
  type ClassLike,
  type ProtoChainOfClass,
  type WithProto,
} from '../utils/reflection.js';
import { MSBuildProjectProperties, type Class_MSBPP } from './MSBuildProjectProperties.js';

const Type_RepositoryType = type('""|"git"|"tfs"');
const Type_SymbolPackageFormat = type('"symbols.nupkg" | "snupkg"');

/**
 * A readonly record of a .csproj or .fsproj with NuGet configuration properties in
 * addition to those specified by {@link MSBuildProjectProperties}. This record
 * should be considered immutable. A new instance should be constructed from MSBuild's evaluation output.
 * @see https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#pack-target-inputs
 */
export class NugetProjectProperties extends MSBuildProjectProperties {
  // #region private
  private _isPackable: BooleanString | undefined;
  private _suppressDependenciesWhenPacking: BooleanString | undefined;
  private _packageVersion: string | undefined;
  private _packageId: string | undefined;
  private _packageDescription: string | undefined;
  private _authors: string | undefined;
  private _copyright: string | undefined;
  private _packageRequireLicenseAcceptance: BooleanString | undefined;
  private _developmentDependency: EmptyOrBooleanString | undefined;
  private _packageLicenseExpression: string | undefined;
  private _packageLicenseFile: string | undefined;
  private _packageProjectUrl: string | undefined;
  private _packageIcon: string | undefined;
  private _packageReleaseNotes: string | undefined;
  private _packageReadmeFile: string | undefined;
  private _packageTags: string | undefined;
  private _packageOutputPath: string | undefined;
  private _includeSymbols: EmptyOrBooleanString | undefined;
  private _includeSource: EmptyOrBooleanString | undefined;
  private _packageType: string | undefined;
  private _isTool: EmptyOrBooleanString | undefined;
  private _repositoryUrl: string | undefined;
  private _repositoryType: '' | 'git' | 'tfs' | undefined;
  private _repositoryCommit: string | undefined;
  private _symbolPackageFormat: 'symbols.nupkg' | 'snupkg' | undefined;
  private _noPackageAnalysis: string | undefined;
  private _minClientVersion: string | undefined;
  private _includeBuiltOutput: BooleanString | undefined;
  private _includeContentInPack: BooleanString | undefined;
  private _buildOutputTargetFolder: string | undefined;
  private _contentTargetFolders: string | undefined;
  private _nuspecFile: string | undefined;
  private _nuspecBasePath: string | undefined;
  private _nuspecProperties: string | undefined;
  private _title: string | undefined;
  private _company: string | undefined;
  private _product: string | undefined;
  // #endregion private

  /**
   * Initialize a readonly record of an MSBuild project's properties, including those related to NuGet.
   * @param msbuildProjectFullPath @inheritdoc {@link NugetProjectProperties.MSBuildProjectFullPath}
   * @param properties The dictionary returned by MSBuild's `-getProperty:propname,...` argument
   */
  constructor(
    msbuildProjectFullPath: string,
    properties: CaseInsensitiveMap<string, string>,
  ) {
    /* runtime type checks */
    // check msbuildProjectFullPath in super
    // strictEqual(typeof msbuildProjectFullPath, 'string', TypeError(`msbuildProjectFullPath should be a string, not ${typeof msbuildProjectFullPath}!`))
    /* properties MUST be instance of CaseInsensitiveMap for `consumables`! */
    // strictEqual(properties instanceof CaseInsensitiveMap, true, `arg 'properties' should be instanceof ${CaseInsensitiveMap.name}`)

    /**
     * names of properties to consume in this constructor instead of its super.
     * These are the names of getters, lowercased.
     */
    const keysToMoveOut = NPPGetterNames.InstanceGetters;
    /** Entries to remove from {@link properties} and apply to `this` after calling `super` */
    const consumables = new CaseInsensitiveMap<string, string>();
    // move property by key from `properties` to `consumables`. The types of keys and values in `properties` do not matter here.
    for (const key of keysToMoveOut) {
      const value = NugetProjectProperties.getAndForget(properties, key);
      if (value !== undefined)
        consumables.set(key, value);
    }

    // Pass the remainder to super
    super(msbuildProjectFullPath, properties);

    /** convert values to strings */
    for (const [value, key] of consumables.entries()) {
      if (typeof value !== 'string')
        consumables.set(key, String(value));
    }

    const _getAndForget = (key: string) => NugetProjectProperties.getAndForget(consumables, key);
    let data;
    this._authors = _getAndForget('Authors');
    this._buildOutputTargetFolder = _getAndForget('BuildOutputTargetFolder');
    this._company = _getAndForget('Company');
    this._contentTargetFolders = _getAndForget('ContentTargetFolders');
    this._copyright = _getAndForget('Copyright');
    if (tEmptyOrBooleanString.allows(data = _getAndForget('DevelopmentDependency')))
      this._developmentDependency = data;
    if (tBooleanString.allows(data = _getAndForget('IncludeBuiltOutput')))
      this._includeBuiltOutput = data;
    if (tBooleanString.allows(data = _getAndForget('IncludeContentInPack')))
      this._includeContentInPack = data;
    if (tEmptyOrBooleanString.allows(data = _getAndForget('IncludeSource')))
      this._includeSource = data;
    if (tEmptyOrBooleanString.allows(data = _getAndForget('IncludeSymbols')))
      this._includeSymbols = data;
    if (tBooleanString.allows(data = _getAndForget('IsPackable')))
      this._isPackable = data;
    if (tEmptyOrBooleanString.allows(data = _getAndForget('IsTool')))
      this._isTool = data;
    this._minClientVersion = _getAndForget('MinClientVersion');
    this._noPackageAnalysis = _getAndForget('NoPackageAnalysis');
    this._nuspecBasePath = _getAndForget('NuspecBasePath');
    this._nuspecFile = _getAndForget('NuspecFile');
    this._nuspecProperties = _getAndForget('NuspecProperties');
    this._packageDescription = _getAndForget('PackageDescription');
    this._packageIcon = _getAndForget('PackageIcon');
    this._packageId = _getAndForget('PackageId');
    this._packageLicenseExpression = _getAndForget('PackageLicenseExpression');
    this._packageLicenseFile = _getAndForget('PackageLicenseFile');
    this._packageOutputPath = _getAndForget('PackageOutputPath');
    this._packageProjectUrl = _getAndForget('PackageProjectUrl');
    this._packageReadmeFile = _getAndForget('PackageReadmeFile');
    this._packageReleaseNotes = _getAndForget('PackageReleaseNotes');
    if (tBooleanString.allows(data = _getAndForget('PackageRequireLicenseAcceptance')))
      this._packageRequireLicenseAcceptance = data;
    this._packageTags = _getAndForget('PackageTags');
    this._packageType = _getAndForget('PackageType');
    this._packageVersion = _getAndForget('PackageVersion');
    this._product = _getAndForget('Product');
    this._repositoryCommit = _getAndForget('RepositoryCommit');
    if (Type_RepositoryType.allows(data = _getAndForget('RepositoryType')))
      this._repositoryType = data;
    this._repositoryUrl = _getAndForget('RepositoryUrl');
    if (tBooleanString.allows(data = _getAndForget('SuppressDependenciesWhenPacking')))
      this._suppressDependenciesWhenPacking = data;
    if (Type_SymbolPackageFormat.allows(data = _getAndForget('SymbolPackageFormat')))
      this._symbolPackageFormat = data;
    this._title = _getAndForget('Title');
  }

  /**
   * @returns A string-formatted boolean. If 'false', the project's `Pack`
   * Target (if available) will no-op.
   *
   * Default: `"true"`
   */
  get IsPackable(): BooleanString {
    return this._isPackable ??= 'true';
  }

  /**
   * @returns `"true"` or `"false"`. If "true", the package's dependencies are
   * excluded from the generated NuGet package.
   *
   * Default: `"false"`
   */
  get SuppressDependenciesWhenPacking(): BooleanString {
    return this._suppressDependenciesWhenPacking ??= 'false';
  }

  /**
   * @returns A semver-compatible version number in the form
   * Major.Minor.Patch[-Suffix], where -Suffix identifies prerelease versions.
   *
   * Default: {@link Version}
   * @example "1.0.0", "1.0.0-beta", "1.0.0-beta-00345"
   */
  get PackageVersion(): string {
    return this._packageVersion ??= this.Version;
  }

  /**
   * @returns The ID of the resulting NuGet package.
   *
   * Default: {@link AssemblyName}
   */
  get PackageId(): string {
    return this._packageId ??= this.AssemblyName;
  }

  /**
   * @returns A long description of the package for UI display.
   *
   * Default: {@link Description}
   */
  get PackageDescription(): string {
    return this._packageDescription ??= this.Description;
  }

  /**
   * @returns A semicolon-separated list of the package's authors, matching the
   * profile names on nuget.org. These are displayed in the NuGet Gallery on
   * nuget.org and are used to cross-reference packages by the same authors.
   *
   * Default: {@link AssemblyName `AssemblyName`}
   */
  get Authors(): string {
    return this._authors ??= this.AssemblyName;
  }

  /**
   * @returns Copyright details for the package.
   *
   * Default: `''`
   */
  get Copyright(): string {
    return this._copyright ??= '';
  }

  /**
   * @returns A string-formatted boolean. If `"true"`, the client must prompt the
   * consumer to accept the package license before installing the package.
   *
   * Default: `"false"`
   */
  get PackageRequireLicenseAcceptance(): BooleanString {
    return this._packageRequireLicenseAcceptance ??= 'false';
  }

  /**
   * This boolean only affects the package created from the project.
   * @see
   * {@link https://github.com/NuGet/Home/wiki/DevelopmentDependency-support-for-PackageReference DevelopmentDependency support for PackageReference}
   * @returns A string-formatted boolean. If `"true"`, the package is marked as
   * a development-only dependency and is prevented from being included as a
   * dependency in other packages. With PackageReference (NuGet 4.8+), this flag
   * also means that compile-time assets are excluded from compilation.
   *
   * Default: `''` (`false`-y)
   */
  get DevelopmentDependency(): EmptyOrBooleanString {
    return this._developmentDependency ??= '';
  }

  /**
   * @returns The {@link https://spdx.org/licenses/ SPDX license identifier} or
   * expression.
   *
   * Default: `''`
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-a-license-expression-or-a-license-file Packing a license expression or a license file}
   * @example "Apache-2.0"
   */
  get PackageLicenseExpression(): string {
    return this._packageLicenseExpression ??= '';
  }

  /**
   * @returns The path to a license file within the package if you're using a
   * custom license or a license that hasn't been assigned an SPDX identifier.
   *
   * Default: `''`
   */
  get PackageLicenseFile(): string {
    return this._packageLicenseFile ??= '';
  }

  /**
   * @returns The package's project URL.
   *
   * Default: `''`
   */
  get PackageProjectUrl(): string {
    return this._packageProjectUrl ??= '';
  }

  /**
   * @returns The package icon path, relative to the root of the package.
   *
   * Default: `''`
   * @description You must pack the referenced icon image file. By default, it
   * is not packed.
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-an-icon-image-file Packing an icon image file},
   * {@link https://learn.microsoft.com/en-us/nuget/reference/nuspec#icon icon metadata}
   */
  get PackageIcon(): string {
    return this._packageIcon ??= '';
  }

  /**
   * @returns Release notes for the package.
   *
   * Default: `''`
   */
  get PackageReleaseNotes(): string {
    return this._packageReleaseNotes ??= '';
  }

  /**
   * @returns The path of the package's README file relative to the package's
   * root.
   *
   * Default: `''`
   * @description You must pack the referenced readme file. By default, it is
   * not packed.
   */
  get PackageReadmeFile(): string {
    return this._packageReadmeFile ??= '';
  }

  /**
   * @returns A semicolon-delimited list of tags that designates the package.
   *
   * Default : `''`
   */
  get PackageTags(): string {
    return this._packageTags ??= '';
  }

  /**
   * @returns A relative or absolute path determining the where the packed
   * package will be dropped.
   *
   * Default: {@link OutputPath}
   */
  get PackageOutputPath(): string {
    return this._packageOutputPath ??= this.OutputPath;
  }

  /**
   * @returns A string-formatted boolean indicating whether the package should
   * create an additional symbols package when the project is packed. The
   * symbols package's format is controlled by the `SymbolPackageFormat`
   * property.
   *
   * Default: `''` (false-y)
   * @description When using `MSBuild -t:pack -p:IncludeSymbols=true`, the
   * corresponding .pdb files are copied along with other output files (.dll,
   * .exe, .winmd, .xml, .json, .pri). Note that setting `IncludeSymbols=true`
   * creates a regular package and a symbols package.
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#includesymbols IncludeSymbols}
   */
  get IncludeSymbols(): EmptyOrBooleanString {
    return this._includeSymbols ??= '';
  }

  /**
   * @returns A string-formatted boolean indicating whether the pack process
   * should create a source package. The source package contains the library's
   * source code as well as PDB files. Source files are put under the
   * `src/ProjectName` directory in the resulting package file.
   *
   * Default: `''` (false-y)
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#includesource IncludeSource}
   */
  get IncludeSource(): EmptyOrBooleanString {
    return this._includeSource ??= '';
  }

  /**
   * @returns A semicolon-separated list of tags indicating the package's
   * intended use. Custom types are allowed, but cannot be installed via Visual
   * Studio nor nuget.exe. See https://github.com/NuGet/Home/issues/10468.
   *
   * Package types can be version e.g. `PackageType1, 1.0.0.0;PackageType2`
   *
   * Default: `''`
   * @example "Dependency ", "DotnetTool", "MSBuildSdk", "Template"
   * @see {@link https://learn.microsoft.com/en-us/nuget/create-packages/set-package-type?tabs=dotnet Set a NuGet package type}
   */
  get PackageType(): string {
    return this._packageType ??= '';
  }

  /**
   * @returns A string-formatted boolean specifying whether all output files are
   * copied to the *tools* folder instead of the *lib* folder.
   *
   * Default: `''` (false-y)
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#istool IsTool}
   */
  get IsTool(): EmptyOrBooleanString {
    return this._isTool ??= '';
  }

  /**
   * @returns The repository URL used to clone or retrieve source code.
   *
   * Default: `''`
   * @example "https://github.com/NuGet/NuGet.Client.git".
   */
  get RepositoryUrl(): string {
    return this._repositoryUrl ??= '';
  }

  /**
   * @returns The repository type.
   *
   * Default: `''`
   * @example "git", "fts"
   */
  get RepositoryType(): typeof Type_RepositoryType.inferOut {
    return this._repositoryType ??= '';
  }

  /**
   * @returns The (optional) repository commit or changeset to indicate which
   * source the package was built against. {@link RepositoryUrl} must also be
   * specified for this property to be included.
   *
   * Default: `''`
   * @description This is evaluated only during the "Pack" and "Publish"
   * Targets. If using nuget.exe or Visual Studio, NuGet 4.7.0 or later is
   * required.
   * @example "0e4d1b598f350b3dc675018d539114d1328189ef"
   */
  get RepositoryCommit(): string {
    return this._repositoryCommit ??= '';
  }

  /**
   * @returns A string specifying the format of the symbols package. If
   * "symbols.nupkg", a legacy symbols package is created with a .symbols.nupkg
   * extension containing PDBs, DLLs, and other output files. If "snupkg", a
   * snupkg symbol package is created containing the portable PDBs. The default
   * is "symbols.nupkg".
   *
   * Default: "symbols.nupkg"
   * @example "symbols.nupkg", "snupkg"
   */
  get SymbolPackageFormat(): typeof Type_SymbolPackageFormat.inferOut {
    return this._symbolPackageFormat ??= 'symbols.nupkg';
  }

  /**
   * @returns A string-formatted boolean specifying that `pack` should not run
   * package analysis after building the package.
   *
   * Default: `''` (false-y)
   */
  // todo: change ReturnType to EmptyOrBooleanString
  get NoPackageAnalysis(): string {
    return this._noPackageAnalysis ??= '';
  }

  /**
   * @returns A string specifying the minimum version of the NuGet client that
   * can install this package, enforced by nuget.exe and the Visual Studio
   * Package Manager.
   *
   * Default: `''`
   */
  get MinClientVersion(): string {
    return this._minClientVersion ??= '';
  }

  /**
   * @returns A string-formatted boolean value specifying whether the build
   * output assemblies should be packed into the .nupkg file or not.
   *
   * Default: `"true"`
   */
  get IncludeBuildOutput(): BooleanString {
    return this._includeBuiltOutput ??= 'true';
  }

  /**
   * @returns A string-formatted boolean specifying whether any items that have
   * a type of Content are included in the resulting package automatically.
   *
   * Default: `"true"`
   */
  get IncludeContentInPack(): BooleanString {
    return this._includeContentInPack ??= 'true';
  }

  /**
   * @returns The output directory of the output assemblies. The output
   * assemblies (and other output files) are copied into their respective
   * framework folders.
   *
   * Default: `''`
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#output-assemblies Output assemblies}
   */
  // todo: Move to MSBPP
  get BuildOutputTargetFolder(): string {
    return this._buildOutputTargetFolder ??= '';
  }

  /**
   * @returns A semicolon-separated list of default locations of where all the
   * content files should go if `PackagePath` is not specified for them.
   *
   * Default: `"content;contentFiles"`
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#including-content-in-a-package Including content in a package}
   */
  get ContentTargetFolders(): string {
    return this._contentTargetFolders ??= 'content;contentFiles';
  }

  /**
   * @returns The relative or absolute path to the `*.nuspec` file being used
   * for packing. If specified, it's used **exclusively** for packaging
   * information, and any information in the projects is not used.
   *
   * Default: `''`
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file Packing using a .nuspec}
   */
  get NuspecFile(): string {
    return this._nuspecFile ??= '';
  }

  /**
   * @returns The base path for the *.nuspec* file.
   *
   * Default: `''`
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file Packing using a .nuspec}
   */
  get NuspecBasePath(): string {
    return this._nuspecBasePath ??= '';
  }

  /**
   * @returns A semicolon-separated list of key=value pairs.
   *
   * Default: `''`
   * @see
   * {@link https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file Packing using a .nuspec}
   */
  get NuspecProperties(): string {
    return this._nuspecProperties ??= '';
  }

  /**
   * @returns A human-friendly title of the package, typically used in UI displays as
   * on nuget.org and the Package Manager in Visual Studio.
   * Default: {@link PackageId}
   */
  get Title(): string {
    return this._title ??= this.PackageId;
  }

  /**
   * @returns Company name or information.
   *
   * Default: {@link Authors}
   */
  get Company(): string {
    return this._company ??= this.Authors;
  }

  /**
   * @returns Product name or information.
   *
   * Default: {@link AssemblyName}
   */
  get Product(): string {
    return this._product ??= this.AssemblyName;
  }
}

export type Class_NPP = ClassLike<
  typeof NugetProjectProperties
  & WithProto<Class_MSBPP>
>;

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class NPPGetterNames {
  private static _prototypeChain: ProtoChainOfClass<Class_NPP> | undefined;
  private static get PrototypeChain(): [Class_NPP, Class_MSBPP] {
    return this._prototypeChain ??= getPrototypesChainOf(NugetProjectProperties as Class_NPP, 'classes');
  }

  private static _instanceGetters: Exclude<keyof NugetProjectProperties, keyof MSBuildProjectProperties>[] | undefined;
  private static _instanceGettersRecursive: (keyof NugetProjectProperties)[] | undefined;
  private static _StaticGetters: never[] | undefined;
  private static _StaticGettersRecursive: (keyof typeof NugetProjectProperties)[] | undefined;

  public static get InstanceGetters(): Exclude<keyof NugetProjectProperties, keyof MSBuildProjectProperties>[] {
    return this._instanceGetters ??= listOwnGetters(NugetProjectProperties as Class_NPP, 'Instance');
  }

  public static get InstanceGettersRecursive(): (keyof NugetProjectProperties)[] {
    return this._instanceGettersRecursive ??= this.PrototypeChain.flatMap(
      proto => listOwnGetters<typeof proto, 'Instance'>(proto, 'Instance'),
    );
  }

  public static get StaticGetters(): never[] {
    return this._StaticGetters ??= listOwnGetters(NugetProjectProperties as Class_NPP, 'Static');
  };

  public static get StaticGettersRecursive(): ('prototype' | 'GetFullPath')[] {
    return this._StaticGettersRecursive ??= this.PrototypeChain.flatMap(
      proto => listOwnGetters(proto, 'Static'),
    );
  }
}

/** @module NugetProjectProperties */
