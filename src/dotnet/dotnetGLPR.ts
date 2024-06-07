import { getEnv, getEnvVarValue } from '../envUtils.js';
import type { NuGetRegistryInfo } from './dotnetHelpers.js';

const { CI_API_V4_URL, CI_PROJECT_ID } = getEnv();
const nameof = {
	CI_API_V4_URL: 'CI_API_V4_URL',
	CI_PROJECT_ID: 'CI_PROJECT_ID',
};

export const GitLabTokenEnvVar = 'CI_JOB_TOKEN';
export const nugetGitLabUrlBase = CI_API_V4_URL;
export const nugetGitLabUrl: string | undefined =
	CI_API_V4_URL && CI_PROJECT_ID
		? `${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/packages/nuget/index.json`
		: undefined;

/**
 * Get a {@link NuGetRegistryInfo} for pushing to your GitLab Packages NuGet registry.
 * @export
 * @param {string} [tokenEnvVar=GitLabTokenEnvVar] The name of environment variable storing the GitLab Packages NuGet registry API key. Defaults to {@link GitLabTokenEnvVar}.
 * @param {string} [url=nugetGitLabUrl] The url of the GitLab Packages NuGet registry. Defaults to {@link nugetGitLabUrl}.
 * @returns {(NuGetRegistryInfo | undefined)} a {@link NuGetRegistryInfo} object if {@link tokenEnvVar} and {@link url} are defined. Else, undefined.
 */
export function getGitlabNugetRegistryPair(
	tokenEnvVar: string = GitLabTokenEnvVar,
	url: string | undefined = nugetGitLabUrl,
): NuGetRegistryInfo | undefined {
	// yes, this is stupid. No, I won't change it.
	if (!getEnvVarValue(tokenEnvVar)) {
		console.error(
			new Error(
				`The environment variable ${tokenEnvVar} was specified as the source of the token to push a NuGet package to GitLab, but the environment variable does not exist.`,
			),
		);
		return undefined;
	}
	if (url) {
		return { tokenEnvVar, url };
	}
	console.error(
		new Error(
			`The environment variables ${nameof.CI_API_V4_URL} or ${nameof.CI_PROJECT_ID} do not exist and a custom GitLab Packages NuGet registry URL was not provided.`,
		),
	);
	return undefined;
}
