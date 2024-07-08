import { existsSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';

export type StringBoolean = "true" | "false";

/**
 * Known properties. Additional properties may be added upon request.
 */
export class MSBuildProjectProperties {
    public static readonly InstanceProperties: readonly string[] = Object.freeze(Object.keys(MSBuildProjectProperties.prototype));

    public constructor(fullPath: string, ...rest: string[]) {
        this.FullPath = fullPath;
        if (!isAbsolute(this.FullPath)) this.FullPath = resolve(this.FullPath);
        if (!existsSync(this.FullPath))
            throw new Error(
                `Project ${basename(fullPath)} could not be found at "${this.FullPath}"`
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

    public readonly FullPath: string = "";

    public readonly AssemblyName: string = "";

    /**
     * A long description for the assembly.
     * If {@link NugetProperties.PackageDescription} is not specified, then this property is also used as the description of the package.
     */
    public readonly Description: string = "";

    /** Set Version -OR- VersionPrefix. */
    public readonly Version: string = "";

    /**
     * Set Version -OR- VersionPrefix.
     * @remarks Setting {@link NugetProperties.PackageVersion} overwrites {@link VersionPrefix}
     */
    public readonly VersionPrefix: string = "";

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
    public readonly VersionSuffix: string = "";

    public readonly TargetFramework: string = "";

    public readonly TargetFrameworks: string = "";

    public readonly RuntimeIdentifier: string = "";

    public readonly RuntimeIdentifiers: string = "";
}
