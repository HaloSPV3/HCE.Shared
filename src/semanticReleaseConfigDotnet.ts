/** Semantic-Release Config Factory (dotnet)
 * A functional Semantic-Release configuration for dotnet projects
 *
 * extends {@link baseConfig }
 *
 * <-- TABLE OF CONTENTS -->
 * - evaluateProperties
 * - configureDotnetRelease
 * - Insert-Edit Plugins
 * - Append Plugins
 *
 */

import { inspect } from 'node:util';
import type { Options, PluginSpec } from 'semantic-release';
import type { Options as SRExecOptions } from '@semantic-release/exec';
import debug from './debug.js';
import { configureDotnetNugetPush, configurePrepareCmd } from './dotnet/dotnetHelpers.js';
import { getEnvVarValue } from './envUtils.js';
import { baseConfig } from './semanticReleaseConfig.js';

type UnArray<T> = T extends Array<infer U> ? U : T;
interface SRConfigDotnetOptions extends Omit<typeof baseConfig, "plugins"> {
	plugins: (UnArray<typeof baseConfig.plugins> | [string, SRExecOptions])[]
};

/**
 * Description placeholder
 *
 * @public
 * @class semanticReleaseConfigDotnet
 * @typedef {semanticReleaseConfigDotnet}
 */
public class semanticReleaseConfigDotnet {
	private options: SRConfigDotnetOptions;

	/**
	 * Creates an instance of semanticReleaseConfigDotnet.
	 * Configures {@link baseConfig} with `@semantic-release/exec` to `dotnet` publish, pack, and push.
	 * 
	 * @constructor
	 * @public
	 * @param {string[]} projectsToPublish An array of dotnet projects' relative paths. If
	 * empty or unspecified, tries getting projects' semi-colon-separated relative
	 * paths from the `PROJECTS_TO_PUBLISH` environment variable. If configured as
	 * recommended, the projects' publish outputs will be zipped to '$PWD/publish'
	 * for use in the `publish` semantic-release step (typically, GitHub release).
	 * @param {string[]} packAndPushProjects An array of dotnet projects' relative paths. If
	 * false, `dotnet pack` and `dotnet nuget push` will be left out of the exec
	 * commands. If empty or unspecified, tries getting projects' semi-colon-separated 
	 * relative paths from the `PROJECTS_TO_PACK_AND_PUSH` environment variable.
	 * If configured as recommended, `dotnet pack` will output the nupkg/snupk 
	 * files to `$PWD/publish` where they will be globbed by `dotnet nuget push`.
	 * @param {string[]} signProjectPackages
	 */
	public constructor(projectsToPublish: string[], packAndPushProjects: string[], signProjectPackages: string[]) {
		if (!packAndPushProjects.every(v => signProjectPackages.includes(v)))
			throw new Error('all signProjectPackages should be in packAndPushProjects');

		this.options = baseConfig;
		this.options.plugins.map(pluginSpec => typeof pluginSpec === "string" ? [pluginSpec, {}] : pluginSpec);

	}

	public async insertPlugin(afterPluginsIDs: string[], insertPluginIDs: string[], beforePluginsIDs: string[]) {
		const errors: Error[] = [];
		const pluginIDs = new Array(...this.options.plugins).map(v => typeof v === "string" ? v : v[0]);

		// if any beforePluginIDs are ordered before the last afterPlugin, throw. Impossible to sort.

		const indexOfLastAfter = afterPluginsIDs
			.filter(v => pluginIDs.includes(v))
			.map(v => pluginIDs.indexOf(v))
			.sort()
			.find((_v, i, obj) => i === (obj.length - 1));
		if (!indexOfLastAfter)
			throw new ReferenceError("An attempt to get the last element of an array returned undefined.");

		const indicesOfBefore = beforePluginsIDs
			.filter(v => pluginIDs.includes(v))
			.map(v => pluginIDs.indexOf(v));

		for (const index of indicesOfBefore) {
			if (index <= indexOfLastAfter) {
				errors.push(
					new Error(
						`insertPlugin was instructed to insert one or more plugins after [${afterPluginsIDs.map(v => `"${v}"`).join(", ")}] and before [${beforePluginsIDs.map(v => `"${v}"`).join(", ")}], but ${pluginIDs[indexOfLastAfter]} comes after ${pluginIDs[index]}!`
					)
				)
			}
		}
		if (errors.length > 0)
			throw new AggregateError(errors);
	}


	/**
	 * generate dotnet commands for @semantic-release/exec, appending commands with ' && ' when necessary.
	 *
	 * @public
	 * @async
	 * @param {string[]} projectsToPublish
	 * @param {?string[]} [projectsToPackAndPush]
	 * @returns {*}
	 * @see https://github.com/semantic-release/exec#usage 
	 */
	public async setupDotnetCommands_0(
		projectsToPublish: string[],
		projectsToPackAndPush?: string[],
	) {
		const srExecIndex = this.options.plugins.findIndex(v => v[0] === "@semantic-release/exec");
		const execOptions = this.options.plugins[srExecIndex] as SRExecOptions;

		const prepareCmdAppendix = configurePrepareCmd(projectsToPublish, projectsToPackAndPush);

		// 'ZipPublishDir' zips each publish folder to ./publish/*.zip
		execOptions.prepareCmd = execOptions.prepareCmd && execOptions.prepareCmd.length > 0
			? execOptions.prepareCmd + " && " + prepareCmdAppendix
			: prepareCmdAppendix;

		if (projectsToPackAndPush) {
			const verifyConditionsCmdAppendix = await getTokenTestingCommands();

			const publishCmdAppendix = await configureDotnetNugetPush();
			execOptions.publishCmd = (execOptions.publishCmd && execOptions.publishCmd.length > 0)
				? execOptions.publishCmd + " && " + publishCmdAppendix
				: publishCmdAppendix;
		}
	}

	async toOptions(): Promise<Options> {
		return this.options;
	}
}


/**
 * Configures {@link baseConfig} with `@semantic-release/exec` to `dotnet` publish, pack, and push.
 * @param projectsToPublish An array of dotnet projects' relative paths. If
 * empty or unspecified, tries getting projects' semi-colon-separated relative
 * paths from the `PROJECTS_TO_PUBLISH` environment variable. If configured as
 * recommended, the projects' publish outputs will be zipped to '$PWD/publish'
 * for use in the `publish` semantic-release step (typically, GitHub release).
 * @param projectsToPackAndPush An array of dotnet projects' relative paths. If
 * false, `dotnet pack` and `dotnet nuget push` will be left out of the exec
 * commands. If empty or unspecified, tries getting projects'
 * semi-colon-separated relative paths from the `PROJECTS_TO_PACK_AND_PUSH`
 * environment variable. If configured as recommended, `dotnet pack` will output
 * the nupkg/snupk files to `$PWD/publish` where they will be globbed by `dotnet
 * nuget push`.
 * @returns a semantic-release Options object, based on `@halospv3/hce.shared-config` (our base config), with the `@semantic-release/exec` plugin configured to `dotnet publish`, `pack`, and `push` the specified projects.
 */
export async function getConfig(projectsToPublish: string[], projectsToPackAndPush?: string[]): Promise<Options> {
	if (debug.enabled) {
		debug.log('hce.shared-config:\n' + inspect(baseConfig, false, Infinity, true));
	}

	const errors: Error[] = [];

	if (projectsToPublish.length === 0) {
		const _ = getEnvVarValue("PROJECTS_TO_PUBLISH");
		if (_ === undefined)
			errors.push(new Error("projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path."));
		else
			projectsToPublish = _.split(';');
	}

	if (!projectsToPackAndPush) {
		const _ = getEnvVarValue("PROJECTS_TO_PACK_AND_PUSH")
		if (_ === undefined)
			errors.push(new Error("projectsToPackAndPush.length must be > 0 or PROJECTS_TO_PACK_AND_PUSH must be defined and contain at least one path."));
		else
			projectsToPackAndPush = _.split(';');
	}

	if (errors.length > 0) {
		throw new Error(
			[
				"getConfig cannot continue. One or more errors occurred.",
				...(errors.map(v => v.stack))
			].join('\n')
		)
	}

	let config = { ...baseConfig };
	config = insertAndEditPlugins(config);
	if (projectsToPublish)
		throw new Error("function appendPlugins is being refactored to an instance method of class SemanticReleaseConfigDotnet.")

	if (debug.enabled) {
		console.debug(`modified plugins array:\n${inspect(config.plugins, false, Infinity)}`);
	}

	return config;
}

export default getConfig;
