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

import type { Options, PluginSpec } from 'semantic-release';
import { configureDotnetNugetPush, configurePrepareCmd } from './dotnet/dotnetHelpers.js';
import { baseConfig, defaultPlugins } from './semanticReleaseConfig.js';
import { setupGitPluginSpec } from './setupGitPluginSpec.js';
import debug from './debug.js'
import { inspect } from 'node:util';
import { env } from "node:process"

/**
 * TODO: options/params for inserts/edits. NOT ready for production. Currently, this can only add Git plugin's options if undefined or one or more is missing.
 * Insert (`array.splice`) and/or configure plugins.\
 * Can be used to...\
 * ...load plugin A before plugin B\
 * ...edit a plugin's existing configuration
 *
 * @param config An instance of {@link Options}
 * @returns a modified copy of {@link config}
 */
export function insertAndEditPlugins(config: Options): Options {
	// const insertAndEditCommands = [];
	config.plugins = [...(config.plugins ?? defaultPlugins)];

	config.plugins = setupGitPluginSpec(config.plugins as PluginSpec[]);

	return config;
}

/**
 * Currently, only configures `@semantic-release/exec` with `prepareCmd: configurePrepareCmd(projectsToPublish, projectsToPackAndPush)` and `publishCmd: configureDotnetNugetPush()`
 * @param config 
 * @param projectsToPublish 
 * @param projectsToPackAndPush 
 * @returns config with the specified plugins and plugin options.
 */
export function appendPlugins(
	config: Options,
	projectsToPublish: string[],
	projectsToPackAndPush: string[] | false,
): Options {
	if (config.plugins === undefined)
		throw new Error('Plugins array was undefined when it should be an array!');
	(config.plugins as PluginSpec[]).push(
		// APPEND this array of [pluginName, pluginConfig] to plugins
		// https://github.com/semantic-release/exec#usage
		[
			'@semantic-release/exec',
			{
				// 'ZipPublishDir' zips each publish folder to ./publish/*.zip
				prepareCmd: configurePrepareCmd(projectsToPublish, projectsToPackAndPush),
				publishCmd: configureDotnetNugetPush(),
			},
		],
	);
	return config;
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
export function getConfig(projectsToPublish: string[] = [], projectsToPackAndPush: string[] | false = []): Options {
	if (debug.enabled) {
		console.debug('hce.shared-config:\n' + inspect(baseConfig, false, Infinity, true));
	}

	const errors: Error[] = [];

	if (projectsToPublish.length === 0) {
		const _ = env["PROJECTS_TO_PUBLISH"];
		if (_ === undefined)
			errors.push(new Error("projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path."));
		else
			projectsToPublish = _.split(';');
	}

	if (projectsToPackAndPush !== false && projectsToPackAndPush.length === 0) {
		const _ = env["PROJECTS_TO_PACK_AND_PUSH"]
		if (_ === undefined)
			errors.push(new Error("projectsToPackAndPush.length must be > 0 or PROJECTS_TO_PACK_AND_PUSH must be defined and contain at least one path."));
		else
			projectsToPackAndPush = _.split(';');
	}

	if (errors.length > 0) {
		throw new Error(
			[
				"getConfig cannot continue. One or more errors occurred.",
				...(errors.map(v => v.message))
			].join('\n')
		)
	}

	let config = { ...baseConfig };
	config = insertAndEditPlugins(config);
	if (projectsToPublish)
		config = appendPlugins(config, projectsToPublish, projectsToPackAndPush);

	if (debug.enabled) {
		console.debug(`modified plugins array:\n${inspect(config.plugins, false, Infinity)}`);
	}

	return config;
}

export default getConfig;
