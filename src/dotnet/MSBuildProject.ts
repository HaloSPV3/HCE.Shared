import { execFileSync } from 'node:child_process';
import { Dirent, existsSync } from 'node:fs';
import { readdir, realpath, stat } from 'node:fs/promises';
import { basename, dirname, isAbsolute, join, resolve } from 'node:path';


/**
 * Known properties. Additional properties may be added upon request.
 */
class MSBuildProjectProperties {
	[Property: string]: string;

	FullPath = '';

	AssemblyName = '';

	TargetFramework = '';

	TargetFrameworks = '';

	RuntimeIdentifier = '';

	RuntimeIdentifiers = '';

	constructor(fullPath: string) {
		this.FullPath = fullPath;
		if (!isAbsolute(this.FullPath)) this.FullPath = resolve(this.FullPath);
		if (!existsSync(this.FullPath))
			throw new Error(
				`Project ${basename(this.FullPath)} could not be found at "${this.FullPath}"`,
			);
	}
}

class NugetProperties extends MSBuildProjectProperties {
	public constructor(
		fullPath: string,
		packageId?: string,
		version?: string,
		authors?: string,
		company?: string,
		product?: string
	) {
		super(fullPath);
		this.PackageId = packageId ?? this.AssemblyName;
		this.Version = version ?? "1.0.0";
		this.Authors = authors ?? this.AssemblyName;
		this.Company = company ?? this.Authors;
		this.Product = product ?? this.AssemblyName;
	}

	/** 
	 * The package identifier. 
	 * Must be unique across nuget.org and any other targets that host the package.
	 * If you don't specify a value, the command uses the AssemblyName. 
	 */
	public readonly PackageId: string;
	/** 
	 * A specific version number in the form Major.Minor.Patch[-Suffix], where -Suffix identifies prerelease versions.
	 * If not specified, the default value is 1.0.0.
	 */
	public readonly Version: string;
	/** 
	 * The authors of the package.
	 * If not specified, the default value is the {@link AssemblyName}.
	 */
	public readonly Authors: string;
	/** 
	 * Company is company information.
	 * If not specified, the default value is the {@link Authors} value.
	 */
	public readonly Company: string;
	/** 
	 * Product is product information. 
	 * If not specified, the default value is the AssemblyName. 
	 */
	public readonly Product: string;

	public static GetOwnPropertyKeys(): string[] {
		return Object.getOwnPropertyNames(NugetProperties.prototype)
	}
}

export class MSBuildProject {
	public static MatrixProperties: string[] = [
		"TargetFramework",
		"TargetFrameworks",
		"RuntimeIdentifier",
		"RuntimeIdentifiers"
	];

	public Properties: MSBuildProjectProperties;

	/**
	 *
	 * @param fullPath The full path of the .NET MSBuild project file.
	 * @param customProperties MSBuild properties to evaluate in addition to those pre-defined in {@link MSBuildProjectProperties}
	 */
	public constructor(fullPath: string, customProperties?: string[]) {
		// super();
		this.Properties = MSBuildProject.evaluateProperties(fullPath, customProperties ?? []);
	}

	/**
	 *
	 * `dotnet msbuild src -getProperty:TargetFramework -getProperty:TargetFrameworks -getProperty:RuntimeIdentifiers -getProperty:IsTrimmable`
	 *
	 * ...produces...
	 *
	 * ```json
	 * {
	 *   "Properties": {
	 *     "TargetFramework": "net6.0",
	 *     "TargetFrameworks": "",
	 *     "RuntimeIdentifiers": "win7-x64;win7-x86;win-arm64;linux-x64;linux-arm64",
	 *     "IsTrimmable": "true",
	 *   }
	 * }
	 * ```
	 *
	 * ...which can can be parsed like...
	 * ```js
	 * var ridArray = JSON.parse(out).Properties.RuntimeIdentifiers.split(';');
	 * ```
	 */
	public static evaluateProperties(fullPath: string, properties: string[]): MSBuildProjectProperties {
		const evaluatedProps: MSBuildProjectProperties = new MSBuildProjectProperties(fullPath);

		// if a default prop isn't in properties, add it
		for (const defaultProp of this.MatrixProperties) {
			if (!properties.includes(defaultProp)) {
				properties.push(defaultProp)
			};
		}
		const getPropArgs: string[] = properties.map((propName) => `-getProperty:${propName}`);
		// should return a single value OR string-encoded JSON object with 'Properties' object-type property.
		const out = execFileSync('dotnet', ['msbuild', evaluatedProps.FullPath, ...getPropArgs], {
			encoding: 'utf8',
			stdio: 'pipe',
		}).trim();
		if (out.startsWith('MSBUILD : error'))
			throw new Error(out);

		let props: Record<string, string>;
		if (out.startsWith('{')) {
			const obj = JSON.parse(out) as object;
			if ("Properties" in obj && typeof obj.Properties === 'object' && obj.Properties !== null)
				props = obj.Properties as Record<string, string>;
			else throw new Error('When evaluating properties with MSBuild, "Properties" could not be found in the deserialized JSON object...\n' + JSON.stringify(obj))
		}
		else {
			props = { [properties[0]]: out.trim() }
		}

		return {
			...evaluatedProps,
			...props,
		};
	}

	public static async PackableProjectsToMSBuildProjects(projectsToPackAndPush: string[]): Promise<MSBuildProject[]> {
		async function toDirEntries(projectsToPackAndPush: string[]): Promise<Dirent[]> {
			async function makeAbsolute(path: string) {
				return isAbsolute(path) ? path : resolve(path);
			}
			const dirEntries: (Dirent | Dirent[])[] = await Promise.all(
				projectsToPackAndPush.map(async (proj) => {
					proj = await realpath(await makeAbsolute(proj));
					const stats = await stat(proj);
					let entries: Dirent[];

					if (stats.isFile()) {
						entries = await readdir(dirname(proj), { withFileTypes: true });
						const dirent: Dirent | undefined = entries.find(v =>
							resolve(v.parentPath, v.name) === proj
						);
						if (dirent)
							return dirent;
						else
							throw new Error(`file "${proj}" not found. It may have been moved or deleted.`);
					}
					if (!stats.isDirectory())
						throw new Error(`"${proj}" is not a file or directory`);

					entries = await readdir(proj, { withFileTypes: true });
					return entries.filter(v =>
						v.isFile() && (v.name.endsWith('.csproj') || v.name.endsWith('.fsproj'))
					);
				})
			);

			return dirEntries.flat();
		}

		const projects: MSBuildProject[] = (await toDirEntries(projectsToPackAndPush))
			.map(v =>
				new MSBuildProject(
					join(v.parentPath, v.name),
					Object.keys(NugetProperties..NugetProperties)
				)
			);
		return projects;
	}
}