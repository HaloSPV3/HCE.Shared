import { existsSync } from 'node:fs';
import { basename, isAbsolute, resolve } from 'node:path';

/**
 * Known properties. Additional properties may be added upon request.
 */
export class MSBuildProjectProperties {
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
