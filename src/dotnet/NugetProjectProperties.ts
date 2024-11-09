import { MSBuildProjectProperties } from './MSBuildProjectProperties.js'
import { CaseInsensitiveMap } from '../CaseInsensitiveMap.js'
import { type } from 'arktype'
import { isOfType, tBooleanString, type BooleanString, tEmptyOrBooleanString, type EmptyOrBooleanString } from '../utils/miscTypes.js'
import { listOwnGetters } from '../utils/reflection.js'

/**
 * A readonly record of a .csproj or .fsproj with NuGet configuration properties in
 * addition to those specified by {@link MSBuildProjectProperties}. This record
 * should be considered immutable. A new instance should be constructed from MSBuild's evaluation output.
 * @export
 * @class {@link NugetProjectProperties}
 * @extends {MSBuildProjectProperties}
 * @see https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#pack-target-inputs
 */
export class NugetProjectProperties extends MSBuildProjectProperties {
  // #region private
  private _isPackable: BooleanString | undefined
  private _suppressDependenciesWhenPacking: BooleanString | undefined
  private _packageVersion: string | undefined
  private _packageId: string | undefined
  private _packageDescription: string | undefined
  private _authors: string | undefined
  private _copyright: string | undefined
  private _packageRequireLicenseAcceptance: BooleanString | undefined
  private _developmentDependency: EmptyOrBooleanString | undefined
  private _packageLicenseExpression: string | undefined
  private _packageLicenseFile: string | undefined
  private _packageProjectUrl: string | undefined
  private _packageIcon: string | undefined
  private _packageReleaseNotes: string | undefined
  private _packageReadmeFile: string | undefined
  private _packageTags: string | undefined
  private _packageOutputPath: string | undefined
  private _includeSymbols: EmptyOrBooleanString | undefined
  private _includeSource: EmptyOrBooleanString | undefined
  private _packageType: string | undefined
  private _isTool: EmptyOrBooleanString | undefined
  private _repositoryUrl: string | undefined
  private _repositoryType: '' | 'git' | 'tfs' | undefined
  private _repositoryCommit: string | undefined
  private _symbolPackageFormat: 'symbols.nupkg' | 'snupkg' | undefined
  private _noPackageAnalysis: string | undefined
  private _minClientVersion: string | undefined
  private _includeBuiltOutput: BooleanString | undefined
  private _includeContentInPack: BooleanString | undefined
  private _buildOutputTargetFolder: string | undefined
  private _contentTargetFolders: string | undefined
  private _nuspecFile: string | undefined
  private _nuspecBasePath: string | undefined
  private _nuspecProperties: string | undefined
  private _title: string | undefined
  private _company: string | undefined
  private _product: string | undefined
  // #endregion private

  /**
   * Initialize a readonly record of an MSBuild project's properties, including those related to NuGet.
   * @param msbuildProjectFullPath @inheritdoc {@link NugetProjectProperties.MSBuildProjectFullPath}
   * @param properties The dictionary returned by MSBuild's `-getProperty:propname,...` argument
   */
  constructor(msbuildProjectFullPath: string, properties: CaseInsensitiveMap<string, string>) {
    /* runtime type checks */
    // check msbuildProjectFullPath in super
    // strictEqual(typeof msbuildProjectFullPath, 'string', TypeError(`msbuildProjectFullPath should be a string, not ${typeof msbuildProjectFullPath}!`))
    /* properties MUST be instance of CaseInsensitiveMap for `consumables`! */
    // strictEqual(properties instanceof CaseInsensitiveMap, true, `arg 'properties' should be instanceof ${CaseInsensitiveMap.name}`)

    /**
     * names of properties to consume in this constructor instead of its super.
     * These are the names of getters, lowercased.
     */
    const keysToMoveOut = listOwnGetters(NPP)
      .map(v => v.toLowerCase())
    /** Entries to remove from {@link properties} and apply to `this` after calling `super` */
    const consumables = new CaseInsensitiveMap<string, string>()
    // move property by key from `properties` to `consumables`. The types of keys and values in `properties` do not matter here.
    for (const key of keysToMoveOut) {
      const value = NPP.getAndForget(properties, key)
      if (value !== undefined)
        consumables.set(key, value)
    }

    // Pass the remainder to super
    super(msbuildProjectFullPath, properties)

    /** filter out entries with undefined values; convert values to strings */
    consumables.forEach((key, value, map) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (value === undefined)
        map.delete(key)
      if (typeof value !== 'string')
        consumables.set(key, String(value))
    })

    const _getAndForget = (key: string) => NPP.getAndForget(consumables, key)
    let data
    this._authors = _getAndForget('Authors')
    this._buildOutputTargetFolder = _getAndForget('BuildOutputTargetFolder')
    this._company = _getAndForget('Company')
    this._contentTargetFolders = _getAndForget('ContentTargetFolders')
    this._copyright = _getAndForget('Copyright')
    if (isOfType(data = _getAndForget('DevelopmentDependency'), tEmptyOrBooleanString))
      this._developmentDependency = data
    if (isOfType(data = _getAndForget('IncludeBuiltOutput'), tBooleanString))
      this._includeBuiltOutput = data
    if (isOfType(data = _getAndForget('IncludeContentInPack'), tBooleanString))
      this._includeContentInPack = data
    if (isOfType(data = _getAndForget('IncludeSource'), tEmptyOrBooleanString))
      this._includeSource = data
    if (isOfType(data = _getAndForget('IncludeSymbols'), tEmptyOrBooleanString))
      this._includeSymbols = data
    if (isOfType(data = _getAndForget('IsPackable'), tBooleanString))
      this._isPackable = data
    if (isOfType(data = _getAndForget('IsTool'), tEmptyOrBooleanString))
      this._isTool = data
    this._minClientVersion = _getAndForget('MinClientVersion')
    this._noPackageAnalysis = _getAndForget('NoPackageAnalysis')
    this._nuspecBasePath = _getAndForget('NuspecBasePath')
    this._nuspecFile = _getAndForget('NuspecFile')
    this._nuspecProperties = _getAndForget('NuspecProperties')
    this._packageDescription = _getAndForget('PackageDescription')
    this._packageIcon = _getAndForget('PackageIcon')
    this._packageId = _getAndForget('PackageLicenseExpression')
    this._packageLicenseExpression = _getAndForget('')
    this._packageLicenseFile = _getAndForget('PackageLicenseFile')
    this._packageOutputPath = _getAndForget('PackageOutputPath')
    this._packageProjectUrl = _getAndForget('PackageProjectUrl')
    this._packageReadmeFile = _getAndForget('PackageReadmeFile')
    this._packageReleaseNotes = _getAndForget('PackageReleaseNotes')
    if (isOfType(data = _getAndForget('PackageRequireLicenseAcceptance'), tBooleanString))
      this._packageRequireLicenseAcceptance = data
    this._packageTags = _getAndForget('PackageTags')
    this._packageType = _getAndForget('PackageType')
    this._packageVersion = _getAndForget('PackageVersion')
    this._product = _getAndForget('Product')
    this._repositoryCommit = _getAndForget('RepositoryCommit')
    if (isOfType(data = _getAndForget('RepositoryType'), type('""|"git"|"tfs"')))
      this._repositoryType = data
    this._repositoryUrl = _getAndForget('RepositoryUrl')
    if (isOfType(data = _getAndForget('SuppressDependenciesWhenPacking'), tBooleanString))
      this._suppressDependenciesWhenPacking = data
    if (isOfType(data = _getAndForget('SymbolPackageFormat'), type('"symbols.nupkg" | "snupkg"')))
      this._symbolPackageFormat = data
    this._title = _getAndForget('Title')
  }

  /**
   * A Boolean value that specifies whether the project can be packed.
   * The default value is `true`.
   * @default "true"
   */
  get IsPackable(): BooleanString {
    return this._isPackable ??= 'true'
  }

  /**
   * Set to `true` to suppress package dependencies from the generated NuGet package.
   * @default "false"
   */
  get SuppressDependenciesWhenPacking(): BooleanString {
    return this._suppressDependenciesWhenPacking ??= 'false'
  }

  /**
   * A specific version number in the form Major.Minor.Patch[-Suffix], where
   * -Suffix identifies prerelease versions.
   * If not specified, the default value is 1.0.0.
   * @remarks This is semver compatible, for example 1.0.0, 1.0.0-beta, or 1.0.0-beta-00345.
   * @defaultValue {@link Version}
   */
  get PackageVersion(): string {
    return this._packageVersion ??= this.Version
  }

  /**
   * Specifies the name for the resulting package.
   * If not specified, the pack operation will default to using the
   * AssemblyName or directory name as the name of the package.
   * @defaultValue {@link AssemblyName}
   */
  get PackageId(): string {
    return this._packageId ??= this.AssemblyName
  }

  /**
   * A long description of the package for UI display.
   * @defaultValue {@link Description}
   */
  get PackageDescription(): string {
    return this._packageDescription ??= this.Description
  }

  /**
   * A semicolon-separated list of packages authors, matching the profile
   * names on nuget.org.
   * These are displayed in the NuGet Gallery on nuget.org and are used to
   * cross-reference packages by the same authors.
   * If not specified, the default value is the {@link AssemblyName}.
   */
  get Authors(): string {
    return this._authors ??= this.AssemblyName
  }

  /** Copyright details for the package. */
  get Copyright(): string {
    return this._copyright ??= ''
  }

  /**
   * A Boolean value that specifies whether the client must prompt the
   * consumer to accept the package license before installing the package.
   * @default "false"
   */
  get PackageRequireLicenseAcceptance(): BooleanString {
    return this._packageRequireLicenseAcceptance ??= 'false'
  }

  /**
   * This boolean only affects the package created from the project.
   * A Boolean value that specifies whether the package is marked as a
   * development-only dependency, which prevents the package from being
   * included as a dependency in other packages. With PackageReference (NuGet
   * 4.8+), this flag also means that compile-time assets are excluded from
   * compilation.
   * For more information, see [DevelopmentDependency support for
   * PackageReference](https://github.com/NuGet/Home/wiki/DevelopmentDependency-support-for-PackageReference).
   */
  get DevelopmentDependency(): EmptyOrBooleanString {
    return this._developmentDependency ??= ''
  }

  /**
   * An [SPDX license identifier](https://spdx.org/licenses/) or expression,
   * for example, `Apache-2.0`.
   * For more information, see [Packing a license expression or a license file](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-a-license-expression-or-a-license-file).
   */
  get PackageLicenseExpression(): string {
    return this._packageLicenseExpression ??= ''
  }

  /**
   * Path to a license file within the package if you're using a custom
   * license or a license that hasn't been assigned an SPDX identifier.
   */
  get PackageLicenseFile(): string {
    return this._packageLicenseFile ??= ''
  }

  get PackageProjectUrl(): string {
    return this._packageProjectUrl ??= ''
  }

  /**
   * Specifies the package icon path, relative to the root of the package. For
   * more information, see [Packing an icon image file](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-an-icon-image-file).
   * @remarks You need to explicitly pack the referenced icon image file. For
   * more information, see [Packing an icon image file](
   * https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-an-icon-image-file)
   * and [icon metadata](https://learn.microsoft.com/en-us/nuget/reference/nuspec#icon).
   */
  get PackageIcon(): string {
    return this._packageIcon ??= ''
  }

  /** Release notes for the package. */
  get PackageReleaseNotes(): string {
    return this._packageReleaseNotes ??= ''
  }

  /**
   * Readme for the package.
   * @remarks You need to explicitly pack the referenced readme file.
   */
  get PackageReadmeFile(): string {
    return this._packageReadmeFile ??= ''
  }

  /** A semicolon-delimited list of tags that designates the package. */
  get PackageTags(): string {
    return this._packageTags ??= ''
  }

  /**
   * Determines the output path in which the packed package will be dropped.
   * Default is `$(OutputPath)` ({@link This.OutputPath}).
   */
  get PackageOutputPath(): string {
    return this._packageOutputPath ??= this.OutputPath
  }

  /**
   * This Boolean value indicates whether the package should create an
   * additional symbols package when the project is packed. The symbols
   * package's format is controlled by the `SymbolPackageFormat` property. For
   * more information, see
   * [IncludeSymbols](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#includesymbols).
   * @remarks When using MSBuild -t:pack -p:IncludeSymbols=true, the
   * corresponding .pdb files are copied along with other output files (.dll,
   * .exe, .winmd, .xml, .json, .pri). Note that setting IncludeSymbols=true
   * creates a regular package and a symbols package.
   */
  get IncludeSymbols(): EmptyOrBooleanString {
    return this._includeSymbols ??= ''
  }

  /**
   * This Boolean value indicates whether the pack process should create a
   * source package. The source package contains the library's source code as
   * well as PDB files. Source files are put under the `src/ProjectName`
   * directory in the resulting package file. For more information, see
   * [IncludeSource](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#includesource).
   */
  get IncludeSource(): EmptyOrBooleanString {
    return this._includeSource ??= ''
  }

  /**
   * @default ""
   */
  get PackageType(): string {
    return this._packageType ??= ''
  }

  /**
   * Specifies whether all output files are copied to the *tools* folder
   * instead of the *lib* folder. For more information, see
   * [IsTool](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#istool).
   * @default ""
   */
  get IsTool(): EmptyOrBooleanString {
    return this._isTool ??= ''
  }

  /**
   * Repository URL used to clone or retrieve source code. Example:
   * _[https://github.com/NuGet/NuGet.Client.git](https://github.com/NuGet/NuGet.Client.git)_.
   */
  get RepositoryUrl(): string {
    return this._repositoryUrl ??= ''
  }

  /**
   * Repository type. Examples: git (default), tfs.
   * @default "git"
   */
  get RepositoryType(): 'git' | 'tfs' | '' {
    return this._repositoryType ??= ''
  }

  /**
   * Optional repository commit or changeset to indicate which source the
   * package was built against. {@link RepositoryUrl} must also be specified for
   * this property to be included. Example:
   * _0e4d1b598f350b3dc675018d539114d1328189ef_ (NuGet 4.7.0+).
   * @requires targets: ["pack", "publish"] // "restore" will not work.
   */
  get RepositoryCommit(): string {
    return this._repositoryCommit ??= ''
  }

  /**
   * Specifies the format of the symbols package. If "symbols.nupkg", a
   * legacy symbols package is created with a .symbols.nupkg extension
   * containing PDBs, DLLs, and other output files. If "snupkg", a snupkg
   * symbol package is created containing the portable PDBs. The default
   * is "symbols.nupkg".
   * @defaultValue "symbols.nupkg"
   */
  get SymbolPackageFormat(): 'symbols.nupkg' | 'snupkg' {
    return this._symbolPackageFormat ??= 'symbols.nupkg'
  }

  /**
   * Specifies that `pack` should not run package analysis after building the package.
   * @default ""
   */
  get NoPackageAnalysis(): string {
    return this._noPackageAnalysis ??= ''
  }

  /**
   * Specifies the minimum version of the NuGet client that can install
   * this package, enforced by nuget.exe and the Visual Studio Package
   * Manager.
   * @default ""
   */
  get MinClientVersion(): string {
    return this._minClientVersion ??= ''
  }

  /**
   * This Boolean value specifies whether the build output assemblies should
   * be packed into the .nupkg file or not.
   * @remarks Useful for creating dummy packages i.e. packages with minimal
   * size for testing nuget pushes. When this is false, you still need at
   * least one file. And beware of version collisions!
   * @default "true"
   */
  get IncludeBuildOutput(): BooleanString {
    return this._includeBuiltOutput ??= 'true'
  }

  /**
   * This Boolean value specifies whether any items that have a type of
   * Content are included in the resulting package automatically.
   * @default "true"
   */
  get IncludeContentInPack(): BooleanString {
    return this._includeContentInPack ??= 'true'
  }

  /**
   * Specifies the folder where to place the output assemblies. The output assemblies (and other output files) are copied into their respective framework folders. For more information, see [Output assemblies](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#output-assemblies).
   */
  get BuildOutputTargetFolder(): string {
    return this._buildOutputTargetFolder ??= ''
  }

  /**
   * Specifies the default location of where all the content files should go
   * if `PackagePath` is not specified for them.
   * For more information, see [Including content in a
   * package](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#including-content-in-a-package).
   * @default "content;contentFiles"
   */
  get ContentTargetFolders(): string {
    return this._contentTargetFolders ??= 'content;contentFiles'
  }

  /**
   * Relative or absolute path to the *.nuspec* file being used for packing.
   * If specified, it's used **exclusively** for packaging information, and
   * any information in the projects is not used.
   * For more information, see [Packing using a .nuspec](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file).
   */
  get NuspecFile(): string {
    return this._nuspecFile ??= ''
  }

  /**
   * Base path for the *.nuspec* file.
   * For more information, see [Packing using a .nuspec](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file).
   */
  get NuspecBasePath(): string {
    return this._nuspecBasePath ??= ''
  }

  /**
   * Semicolon separated list of key=value pairs.
   * For more information, see [Packing using a .nuspec](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file).
   */
  get NuspecProperties(): string {
    return this._nuspecProperties ??= ''
  }

  /**
   * A human-friendly title of the package, typically used in UI displays as
   * on nuget.org and the Package Manager in Visual Studio.
   */
  get Title(): string {
    return this._title ??= this.PackageId
  }

  /**
   * Company is company information.
   * If not specified, the default value is the {@link Authors} value.
   */
  get Company(): string {
    return this._company ??= this.Authors
  }

  /**
   * Product is product information.
   * @defaultValue {@link AssemblyName}
   */
  get Product(): string {
    return this._product ??= this.AssemblyName
  }
}

const NPP = NugetProjectProperties

/** @module NugetProjectProperties */
