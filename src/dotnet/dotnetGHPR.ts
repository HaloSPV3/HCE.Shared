import type { NuGetRegistryInfo } from './dotnetHelpers.js';

// todo: support custom base URL for private GitHub instances
async function tokenCanWritePackages(tokenEnvVar: string) {
	const tokenValue = process.env[tokenEnvVar];
	if (tokenValue === undefined)
		throw new TypeError(`The environment variable ${tokenEnvVar} is undefined!`)
	const reqH = { authorization: `token ${tokenValue}` };
	// CJS compatibility - import { request } from '@octokit/request
	const request = (await import('@octokit/request')).request;
	const response = await request('GET /', { headers: reqH });
	const scopes = response.headers['x-oauth-scopes'];
	if (scopes) {
		return scopes.includes('write:packages') || scopes.includes('write:packages');
	}
	return false;
}

const { GITHUB_REPOSITORY_OWNER } = process.env;

export const nugetGitHubUrlBase = 'https://nuget.pkg.github.com';
export const nugetGitHubUrl = GITHUB_REPOSITORY_OWNER
	? `${nugetGitHubUrlBase}/${GITHUB_REPOSITORY_OWNER}/index.json`
	: undefined;

/**
 * Get a {@link NuGetRegistryInfo} for pushing to your GitHub Packages NuGet registry.
 * todo: add support for private, custom GitHub instances. Token is only validated against github.com.
 * @export
 * @param {string} [tokenEnvVar="GITHUB_TOKEN"] The name of environment variable storing the GitHub Packages NuGet registry API key. Defaults to `"GITHUB_TOKEN"`;
 * @param {string} [url=tokenEnvVar] The url of the GitHub Packages NuGet registry. Defaults to {@link nugetGitHubUrl}.
 * @returns {(NuGetRegistryInfo | undefined)} a {@link NuGetRegistryInfo} object if {@link tokenEnvVar} and {@link url} are defined. Else, `undefined`.
 * note: `url` defaults to job's repository owner's GitHub registry in GitHub Actions workflow. If GITHUB_REPOSITORY_OWNER is not defined, then an error will be logged and `undefined` will be returned.
 */
export async function getGithubNugetRegistryPair(
	tokenEnvVar = 'GITHUB_TOKEN',
	url: string | undefined = nugetGitHubUrl,
): Promise<NuGetRegistryInfo | undefined> {
	// yes, this is stupid. No, I won't change it.
	const isTokenDefined = process.env[tokenEnvVar] !== undefined;
	const isUrlDefined = url !== undefined;
	const canTokenWritePackages = isTokenDefined ? await tokenCanWritePackages(tokenEnvVar) : false;

	const errors: Error[] = [];

	if (!isTokenDefined)
		errors.push(
			new Error(
				`The environment variable ${tokenEnvVar} was specified as the source of the token to push a NuGet package to GitHub, but the environment variable does not exist.`,
			),
		);
	if (!isUrlDefined) {
		errors.push(
			new Error(
				'The url for the GitHub Packages NuGet registry was undefined.\n' +
				'If running in a GitHub Actions workflow, something is seriously wrong.\n' +
				'If running in a different CI/CD pipeline and you wish to cross-push to GHPR, ensure GITHUB_REPOSITORY_OWNER is set correctly.\n',
			),
		);
	}
	if (!canTokenWritePackages) {
		// yes, this is a critical error that should be fixed before Semantic Release can succeed.
		// yes, this is incredibly irritating to deal with in local runs.
		errors.push(
			new Error(
				'The provided GitHub token has insufficient permissions or is a fine-grained permissions token. Only class Personal Access Tokens (classic) or workflow tokens with `repo` or `write:packages` permission can push a package.',
			),
		);
	}

	// conditions checked so `url` is certainly defined
	if (isTokenDefined && isUrlDefined && canTokenWritePackages)
		return { tokenEnvVar, url };

	if (process.env['SKIP_TOKEN'] === 'true')
		return undefined;
	throw new Error(`One more more errors occurred when getting GHPR url-token pair. Errors:\n${errors.map(v => v.message).join('\n')}`);
}
