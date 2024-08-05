import { existsSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';

export type StringBoolean = "true" | "false";

/**
 * Known properties. Additional properties may be added upon request.
 * 
 * todo: add Reserved properties, Well-Known properties, Common properties, and more. Maybe as sub classes.\
 * See: 
 * - [MSBuild Reserved and Well-known Properties](https://learn.microsoft.com/en-us/visualstudio/msbuild/msbuild-reserved-and-well-known-properties?view=vs-2022)
 * - [Common MSBuild project properties](https://learn.microsoft.com/en-us/visualstudio/msbuild/common-msbuild-project-properties?view=vs-2022)
 * - [Microsoft.NET.Sdk](https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props)
 * - [Microsoft.NET.Sdk.Web](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/web-sdk?view=aspnetcore-8.0&toc=%2Fdotnet%2Fnavigate%2Ftools-diagnostics%2Ftoc.json&bc=%2Fdotnet%2Fbreadcrumb%2Ftoc.json#properties)
 * - [Microsoft.NET.Sdk.Razor](https://learn.microsoft.com/en-us/aspnet/core/razor-pages/sdk?view=aspnetcore-8.0&toc=%2Fdotnet%2Fnavigate%2Ftools-diagnostics%2Ftoc.json&bc=%2Fdotnet%2Fbreadcrumb%2Ftoc.json)
 * - [Microsoft.NET.Sdk.Desktop](https://learn.microsoft.com/en-us/dotnet/core/project-sdk/msbuild-props-desktop)
 */
export class MSBuildProjectProperties {
    static readonly InstanceProperties: readonly string[] = Object.freeze(Object.keys(MSBuildProjectProperties.prototype));

    /**
     * Resolve the given path is not absolute. If the path exists, it is returned. Else, an Error is thrown.
     * @param path 
     * @returns 
     */
    static GetFullPath(path: string) {
        if (!isAbsolute(path))
            path = resolve(path);
        if (!existsSync(path))
            throw new Error(`${basename(path)} could not be found at "${path}"`);
        return path;
    }

    constructor(msbuildProjectFullPath: string, ...rest: string[]) {
        this.MSBuildProjectFullPath = msbuildProjectFullPath;
        if (!isAbsolute(this.MSBuildProjectFullPath)) this.MSBuildProjectFullPath = resolve(this.MSBuildProjectFullPath);
        if (!existsSync(this.MSBuildProjectFullPath))
            throw new Error(
                `Project ${basename(msbuildProjectFullPath)} could not be found at "${this.MSBuildProjectFullPath}"`
            );

        // filter rest for only property names not yet defined.
        const instanceMembersLowerCase: string[] = MSBuildProjectProperties.InstanceProperties.map(v => v.toLowerCase());
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
        Object.assign(this, remainingProps);
    }

    readonly [Property: string]: string;

    readonly MSBuildProjectFullPath: string = "";

    readonly AssemblyName: string = "";

    /**
     * A long description for the assembly.
     * If {@link NugetProperties.PackageDescription} is not specified, then this property is also used as the description of the package.
     */
    readonly Description: string = "";

    /** Set Version -OR- VersionPrefix. */
    readonly Version: string = "";

    /**
     * Set Version -OR- VersionPrefix.
     * @remarks Setting {@link NugetProperties.PackageVersion} overwrites {@link VersionPrefix}
     */
    readonly VersionPrefix: string = "";

    /**
     * The effect of this property on the package version depends on the values of the Version and VersionPrefix properties, as shown in the following table:
     * | Properties with values | Package version |
     * | ---------------------- | --------------- |
     * | None                   | 1.0.0           |
     * | Version                | $(Version)      |
     * | VersionPrefix only     | $(VersionPrefix) |
     * | VersionSuffix only     | 1.0.0-$(VersionSuffix) |
     * | VersionPrefix and VersionSuffix | $(VersionPrefix)-$(VersionSuffix) |
     * @remarks Setting {@link PackageVersion} overwrites {@link VersionSuffix}
     */
    readonly VersionSuffix: string = "";

    readonly TargetFramework: string = "";

    readonly TargetFrameworks: string = "";

    readonly RuntimeIdentifier: string = "";

    readonly RuntimeIdentifiers: string = "";
}
