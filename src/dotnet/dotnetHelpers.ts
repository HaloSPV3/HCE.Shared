import { ok } from 'node:assert/strict';
import { getEnvVarValue } from '../envUtils.js';
import { MSBuildProject, MSBuildProjectPreDefinedProperties } from './MSBuildProject.js';
import { GithubNugetRegistryInfo } from './GithubNugetRegistryInfo.js';
import { GitlabNugetRegistryInfo } from './GitlabNugetRegistryInfo.js';

function formatDotnetPublish(projectsToPublish: string[], publishProperties: string[]): string {
	/* Fun Fact: You can define a property and get the evaluated value in the same command!
	```pwsh
	dotnet msbuild .\src\HXE.csproj -property:RuntimeIdentifiers="""place;holder""" -getProperty:RuntimeIdentifiers
	place;holder
	```
	 enclosing with """ is required in pwsh to prevent the semicolon from breaking the string.
	*/
	if (!(Array.isArray(projectsToPublish) && projectsToPublish.length > 0))
		throw new Error(`Type of projectsToPublish (${typeof projectsToPublish}) is not allowed. Expected a string[] where length > 0.`);

	// each may have TargetFramework OR TargetFrameworks (plural)
	const evaluatedProjects: MSBuildProject[] = projectsToPublish.map(
		(proj) => new MSBuildProject(proj, publishProperties),
	);
	// args appended to "dotnet publish", joined by space

	return evaluatedProjects.flatMap(proj => {
		const args: string[] = [proj.Properties.FullPath];

		function appendCustomProperties(publishProperties: string[]) {
			// convert to dictionary and filter for user-defined properties.
			const dictionary = Object.entries(proj.Properties).filter(
				(p) => !publishProperties.includes(p[0]),
			);
			if (dictionary.length > 0) {
				/* format remaining properties as "-p:Property=Value" and append to args */
				args.push(
					...dictionary.map((keyValuePair) => `-p:${keyValuePair[0]}=${keyValuePair[1]}`),
				);
			}
		}
		appendCustomProperties(publishProperties);

		const cmdPermutations: string[][] = []; // forEach, run dotnet [...args,...v]

		function formatFrameworksAndRuntimes() {
			const RIDs: string[] =
				proj.Properties.RuntimeIdentifiers.length > 0
					? proj.Properties.RuntimeIdentifiers.split(';')
					: [];
			const TFMs: string[] =
				proj.Properties.TargetFrameworks.length > 0
					? proj.Properties.TargetFrameworks.split(';')
					: [];
			if (RIDs.length > 0) {
				if (TFMs.length > 0) {
					for (const RID of RIDs) {
						for (const TFM of TFMs) {
							cmdPermutations.push(['--runtime', RID, '--framework', TFM]);
						}
					}
				} else {
					// assume singular TFM. No need to specify it.
					for (const RID of RIDs) {
						cmdPermutations.push(['--runtime', RID]);
					}
				}
			} else if (TFMs.length > 0) {
				for (const TFM of TFMs) {
					cmdPermutations.push(['--framework', TFM]);
				}
			}
		}
		formatFrameworksAndRuntimes();

		return cmdPermutations.length > 0
			? cmdPermutations.map((permArgs) => [...args, ...permArgs]) // string[][]
			: [args]; // string[][]
	}).map((args) => `dotnet publish ${args.join(' ')}`).join(' && ');
}

function formatDotnetPack(projectsToPackAndPush: string[] | false): string {
	return projectsToPackAndPush === false
		? ""
		: projectsToPackAndPush
			.map(v => `dotnet pack ${v}`)
			.join(' && ');
}

function formatDotnetNugetSign(dotnetNugetSignArgs: string[]): string {
	switch (dotnetNugetSignArgs.length) {
		case 0:
			return '';
		default:
			return `dotnet nuget sign ${dotnetNugetSignArgs.join(' ')}`;
		// default: {
		//     throw new Error("")
		//     // this needs a rework.
		//     const packagePaths: string[] = [];
		//     dotnetNugetSignArgs.forEach((dotnetNugetSignArg, i) => {
		//         // if current arg doesn't start with '-' and (current arg is first -OR- previous arg also does not start with '-')...
		//         if (!dotnetNugetSignArg.startsWith("-") && (i === 0 || (i > 0 && !dotnetNugetSignArgs[i - 1].startsWith("-")))) {
		//             // ...then it's probably a package path.
		//             packagePaths.push(dotnetNugetSignArg);
		//         }
		//     });
		//     if (packagePaths.length === 0)
		//         return `dotnet nuget sign ${dotnetNugetSignArgs.join(" ")}`
		//     else return
		// }
	}
}

/**
 * Build a prepareCmd string from .NET project paths and `dotnet nuget sign` arguments.
 *
 * todo: parse Solution files to publish all projects with default Publish parameters (as evaluated by MSBuild). If multi-targeting frameworks and/or runtime, evaluate those properties for Publish permutation matrix.
 * todo: cleanup, docs
 * @export
 * @param {string[]} projectsToPublish
 * @param {string[]|false} projectsToPackAndPush Relative and/or full file paths of projects to pass to `dotnet pack`. By default, these will be output to `./publish/`.
 * @param {string[]} dotnetNugetSignArgs Arguments appended to `dotnet nuget sign`. You can also append '&&' if you want to start a new command or if you want to sign different sets of packages with different keys.
 */
export function configurePrepareCmd(
	projectsToPublish: string[],
	projectsToPackAndPush: string[] | false,
	dotnetNugetSignArgs: string[] = ['./publish'],
) {
	// These are later evaluated with MSBuild, but are passed via --framework and --runtime arguments instead of -p:TargetFramework
	const publishProperties = MSBuildProjectPreDefinedProperties;

	return [
		formatDotnetPublish(projectsToPublish, publishProperties),
		formatDotnetPack(projectsToPackAndPush),
		formatDotnetNugetSign(dotnetNugetSignArgs)
	].join(' && ');
}

export interface NuGetRegistryPair {
	tokenEnvVar: string;
	url: string;
	user?: string | undefined;
}
export const nugetDefault: NuGetRegistryPair = {
	tokenEnvVar: 'NUGET_TOKEN',
	url: 'https://api.nuget.org/v3/index.json',
};

/**
 * todo -
 * @param nupkgDir
 * @param registries
 * @param pushToGitHub
 * @returns
 */
export async function configureDotnetNugetPush(
	nupkgDir = './publish',
	registries: NuGetRegistryPair[] = [nugetDefault],
	pushToGitHub = true,
	pushToGitLab = false
) {
	if (registries.some((registry) => registry.url.trim() === ''))
		throw new Error('The URL for one of the provided NuGet registries was empty or whitespace.');

	// if user did not specify a GitHub NuGet Registry, try determine default values and add the Source.
	if (pushToGitHub && !registries.some((reg) => reg.url.startsWith(GithubNugetRegistryInfo.NUGET_PKG_GITHUB_COM))) {
		const ghPair = await new GithubNugetRegistryInfo().toRegistryPair();
		if (ghPair) {
			registries.push(ghPair);
		}
	}
	if (pushToGitLab) {
		const glPair = await new GitlabNugetRegistryInfo().toRegistryPair();
		if (glPair) {
			registries.push(glPair);
		}
	}

	return registries
		.map(
			(registry) => {
				const tokenValue = getEnvVarValue(registry.tokenEnvVar);
				ok(getEnvVarValue('SKIP_TOKEN') === 'true' || tokenValue, `The environment variable ${registry.tokenEnvVar} is undefined!`);
				`dotnet nuget push ${nupkgDir} --source ${registry.url} --token ${tokenValue ?? '**placeholder**'}`
			}
		)
		.join(' && ');
}
