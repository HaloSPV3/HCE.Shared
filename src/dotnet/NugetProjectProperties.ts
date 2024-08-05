import { MSBuildProjectProperties } from './MSBuildProjectProperties.js';
import { type BooleanString } from '../utils/miscTypes.js';

// https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#pack-target-inputs

/**
 * A readonly record of a .csproj or .fsproj.
 * Get a new record
 *
 * @export
 * @class {@link NugetProjectProperties}
 * @extends {MSBuildProjectProperties}
 */
export class NugetProjectProperties extends MSBuildProjectProperties {
    static override readonly InstanceProperties: readonly string[] = Object.keys(NugetProjectProperties.prototype);

    constructor(fullPath: string, ...rest: string[]) {
        // filter rest for only property names not yet defined.
        const instanceMembersLowerCase: string[] = NugetProjectProperties.InstanceProperties.map(v => v.toLowerCase());
        const remainingProps: Record<string, string>[] = [...rest].filter(v => {
            const lc = v.toLowerCase()
            if (instanceMembersLowerCase.includes(lc)) {
                instanceMembersLowerCase.splice(instanceMembersLowerCase.indexOf(lc))
                return false;
            }
            return true;
        }).map(v => {
            return { [v]: "" } as Record<string, string>
        });
        super(fullPath, ...Object.keys(remainingProps));
    }

    /**
     * A Boolean value that specifies whether the project can be packed.
     * The default value is `true`.
     * @default "true"
     */
    readonly IsPackable: BooleanString = "true";


    /**
     * Set to `true` to suppress package dependencies from the generated NuGet package.
     * @default "false"
     */
    readonly SuppressDependenciesWhenPacking: BooleanString = "false";

    /**
     * A specific version number in the form Major.Minor.Patch[-Suffix], where
     * -Suffix identifies prerelease versions.
     * If not specified, the default value is 1.0.0.
     * @remarks This is semver compatible, for example 1.0.0, 1.0.0-beta, or 1.0.0-beta-00345.
     * @defaultValue {@link Version}
     */
    readonly PackageVersion: string = this.Version;

    /**
     * Specifies the name for the resulting package.
     * If not specified, the pack operation will default to using the
     * AssemblyName or directory name as the name of the package.
     * @defaultValue {@link AssemblyName}
     */
    readonly PackageId: string = this.AssemblyName;

    /**
     * A long description of the package for UI display.
     * @defaultValue {@link Description}
     */
    readonly PackageDescription: string = this.Description;

    /**
     * A semicolon-separated list of packages authors, matching the profile
     * names on nuget.org.
     * These are displayed in the NuGet Gallery on nuget.org and are used to
     * cross-reference packages by the same authors.
     * If not specified, the default value is the {@link AssemblyName}.
     */
    readonly Authors: string = this.AssemblyName;

    /** Copyright details for the package. */
    readonly Copyright: string = "";

    /**
     * A Boolean value that specifies whether the client must prompt the
     * consumer to accept the package license before installing the package.
     * @default "false"
     */
    readonly PackageRequireLicenseAcceptance: BooleanString = "false";

    /**
     * A Boolean value that specifies whether the package is marked as a
     * development-only dependency, which prevents the package from being
     * included as a dependency in other packages. With PackageReference (NuGet
     * 4.8+), this flag also means that compile-time assets are excluded from
     * compilation.
     * For more information, see [DevelopmentDependency support for
     * PackageReference](https://github.com/NuGet/Home/wiki/DevelopmentDependency-support-for-PackageReference).
     */
    readonly DevelopmentDependency: BooleanString | "" = "";

    /**
     * An [SPDX license identifier](https://spdx.org/licenses/) or expression,
     * for example, `Apache-2.0`.
     * For more information, see [Packing a license expression or a license file](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-a-license-expression-or-a-license-file).
     */
    readonly PackageLicenseExpression: string = "";

    /**
     * Path to a license file within the package if you're using a custom
     * license or a license that hasn't been assigned an SPDX identifier.
     */
    readonly PackageLicenseFile: string = "";

    readonly PackageProjectUrl: string = "";

    /**
     * Specifies the package icon path, relative to the root of the package. For
     * more information, see [Packing an icon image file](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-an-icon-image-file).
     * @remarks You need to explicitly pack the referenced icon image file. For
     * more information, see [Packing an icon image file](
     * https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-an-icon-image-file)
     * and [icon metadata](https://learn.microsoft.com/en-us/nuget/reference/nuspec#icon).
     */
    readonly PackageIcon: string = "";

    /** Release notes for the package. */
    readonly PackageReleaseNotes: string = "";

    /**
     * Readme for the package.
     * @remarks You need to explicitly pack the referenced readme file.
     */
    readonly PackageReadmeFile: string = "";

    /** A semicolon-delimited list of tags that designates the package. */
    readonly PackageTags: string = "";

    /**
     * Determines the output path in which the packed package will be dropped.
     * Default is `$(OutputPath)` ({@link This.OutputPath}).
     */
    readonly PackageOutputPath: string = this.OutputPath ?? "";

    /**
     * This Boolean value indicates whether the package should create an
     * additional symbols package when the project is packed. The symbols
     * package's format is controlled by the `SymbolPackageFormat` property. For
     * more information, see * [IncludeSymbols](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#includesymbols).
     * @remarks When using MSBuild -t:pack -p:IncludeSymbols=true, the
     * corresponding .pdb files are copied along with other output files (.dll,
     * .exe, .winmd, .xml, .json, .pri). Note that setting IncludeSymbols=true
     * creates a regular package and a symbols package.
     */
    readonly IncludeSymbols: BooleanString | "" = "";

    /**
     * This Boolean value indicates whether the pack process should create a
     * source package. The source package contains the library's source code as
     * well as PDB files. Source files are put under the `src/ProjectName`
     * directory in the resulting package file. For more information, see
     * [IncludeSource](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#includesource).
     */
    readonly IncludeSource: BooleanString | "" = "";

    /**
     * @default ""
     */
    readonly PackageType: string = "";

    /**
     * Specifies whether all output files are copied to the *tools* folder
     * instead of the *lib* folder. For more information, see
     * [IsTool](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#istool).
     * @default ""
     */
    readonly IsTool: BooleanString | "" = "";

    /**
     * Repository URL used to clone or retrieve source code. Example:
     * _[https://github.com/NuGet/NuGet.Client.git](https://github.com/NuGet/NuGet.Client.git)_.
     */
    readonly RepositoryUrl: string = "";

    /**
     * Repository type. Examples: git (default), tfs.
     * @default "git"
     */
    readonly RepositoryType: "git" | "tfs" = "git";

    /**
     * Optional repository commit or changeset to indicate which source the
     * package was built against. {@link RepositoryUrl} must also be specified for
     * this property to be included. Example:
     * _0e4d1b598f350b3dc675018d539114d1328189ef_ (NuGet 4.7.0+).
     */
    readonly RepositoryCommit: string = "";

    /**
     * Specifies the format of the symbols package. If "symbols.nupkg", a
     * legacy symbols package is created with a .symbols.nupkg extension
     * containing PDBs, DLLs, and other output files. If "snupkg", a snupkg
     * symbol package is created containing the portable PDBs. The default
     * is "symbols.nupkg".
     * @default "symbols.nupkg"
     */
    readonly SymbolPackageFormat: "symbols.nupkg" | "snupkg" = "symbols.nupkg";

    /**
     * Specifies that `pack` should not run package analysis after building the package.
     * @default ""
     */
    readonly NoPackageAnalysis: string = "";

    /**
     * Specifies the minimum version of the NuGet client that can install
     * this package, enforced by nuget.exe and the Visual Studio Package
     * Manager.
     * @default ""
     */
    readonly MinClientVersion: string = "";

    /**
     * This Boolean value specifies whether the build output assemblies should
     * be packed into the .nupkg file or not.
     * @default "true"
     */
    readonly IncludeBuildOutput: BooleanString = "true";

    /**
     * This Boolean value specifies whether any items that have a type of
     * Content are included in the resulting package automatically.
     * @default "true"
     */
    readonly IncludeContentInPack: BooleanString = "true";

    /**
     * Specifies the folder where to place the output assemblies. The output assemblies (and other output files) are copied into their respective framework folders. For more information, see [Output assemblies](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#output-assemblies).
     */
    readonly BuildOutputTargetFolder: string = "";

    /**
     * Specifies the default location of where all the content files should go
     * if `PackagePath` is not specified for them.
     * For more information, see [Including content in a
     * package](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#including-content-in-a-package).
     * @default "content;contentFiles"
     */
    readonly ContentTargetFolders: string = "content;contentFiles"

    /**
     * Relative or absolute path to the *.nuspec* file being used for packing.
     * If specified, it's used **exclusively** for packaging information, and
     * any information in the projects is not used.
     * For more information, see [Packing using a .nuspec](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file).
     */
    readonly NuspecFile: string = "";

    /**
     * Base path for the *.nuspec* file. 
     * For more information, see [Packing using a .nuspec](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file).
     */
    readonly NuspecBasePath: string = "";

    /**
     * Semicolon separated list of key=value pairs.
     * For more information, see [Packing using a .nuspec](https://learn.microsoft.com/en-us/nuget/reference/msbuild-targets#packing-using-a-nuspec-file).
     */
    readonly NuspecProperties: string = "";

    /**
     * A human-friendly title of the package, typically used in UI displays as
     * on nuget.org and the Package Manager in Visual Studio.
     */
    readonly Title: string = this.PackageId;

    /**
     * Company is company information.
     * If not specified, the default value is the {@link Authors} value.
     */
    readonly Company: string = this.Authors;

    /**
     * Product is product information.
     * @defaultValue {@link AssemblyName}
     */
    readonly Product: string = this.AssemblyName;
}
