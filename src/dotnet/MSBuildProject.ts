import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';

/**
* Known properties. Additional properties may be added upon request.
*/
class MSBuildProjectProperties {
	[Property: string]: string;

	FullPath = '';

	TargetFramework = '';

	TargetFrameworks = '';

	RuntimeIdentifier = '';

	RuntimeIdentifiers = '';

	constructor(fullPath: string, exists = true) {
		this.FullPath = fullPath;
		if (!isAbsolute(this.FullPath)) this.FullPath = resolve(this.FullPath);
		if (!existsSync(this.FullPath) && exists)
			throw new Error(
				`Project ${basename(this.FullPath)} could not be found at "${this.FullPath}"`,
			);
	}
}

export class MSBuildProject {
	/**
	 * All pre-defined properties of {@link MSBuildProjectProperties}
	 */
	public static PredefinedProperties: string[] = Object.keys(MSBuildProjectProperties.prototype);
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
}
