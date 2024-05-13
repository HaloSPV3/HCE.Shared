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

import { log } from 'node:console';
import type { Options, PluginSpec } from 'semantic-release';
import { configureDotnetNugetPush, configurePrepareCmd } from './dotnet/dotnetHelpers.js';
import { baseConfig, defaultPlugins } from './semanticReleaseConfig.js';
import { setupGitPluginSpec } from './setupGitPluginSpec.js';

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
	const newConfig = config;
	// const insertAndEditCommands = [];
	newConfig.plugins = [...(config.plugins ?? defaultPlugins)];

	newConfig.plugins = setupGitPluginSpec(newConfig.plugins as PluginSpec[]);

	return newConfig;
}

export function appendPlugins(
	config: Options,
	projectsToPublish: string[],
	projectsToPackAndPush: string[],
) {
	const newConfig = config;
	if (newConfig.plugins === undefined)
		throw new Error('Plugins array was undefined when it should be an array!');
	(newConfig.plugins as PluginSpec[]).push(
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
	return newConfig;
}

/**
 * @type {import("semantic-release").Options}
 */
export function getConfig(projectsToPublish: string[], projectsToPackAndPush: string[]) {
	if (process.argv.includes('--debug') || process.argv.includes('--verbose')) {
		log(`hce.shared-config:\n${JSON.stringify(baseConfig, null, 2)}`);
	}

	let newConfig = { ...baseConfig };
	newConfig = insertAndEditPlugins(newConfig);
	newConfig = appendPlugins(newConfig, projectsToPublish, projectsToPackAndPush);

	if (process.argv.includes('--debug') || process.argv.includes('--verbose')) {
		log(`modified plugins array:\n${JSON.stringify(newConfig.plugins, null, 2)}`);
	}
}
