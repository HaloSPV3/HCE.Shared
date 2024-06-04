import { ok } from 'node:assert/strict';
import type { NuGetRegistryInfo } from './dotnetHelpers.js';
import { env } from 'node:process'

/**
 * @todo support custom base URL for private GitHub instances
 * @param tokenEnvVar The name of the environment variable containing the NUGET token 
 * @returns `true` if the token is 
 * @throws
 * - TypeError: The environment variable ${tokenEnvVar} is undefined!
 * - Error: 
 *   - The value of the token in ${tokenEnvVar} begins with 'github_pat_' which means it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.
 *   - The GitHub API response header lacked "x-oauth-scopes". This indicates the token we provided is not a workflow token nor a Personal Access Token (classic) and can never have permission to push packages.
 */
export async function tokenCanWritePackages(tokenEnvVar: string) {
	/* double-check the token exists */
	const info = isTokenDefined(tokenEnvVar);
	ok(info.isDefined)

	if (info.fallback)
		tokenEnvVar = info.fallback;

	const tokenValue = env[tokenEnvVar];
	if (tokenValue === undefined)
		throw new TypeError(`The environment variable ${tokenEnvVar} is undefined!`)

	if (tokenValue.startsWith('github_pat_'))
		throw new Error(`The value of the token in ${tokenEnvVar} begins with 'github_pat_' which means it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.`)

	// CJS compatibility - import { request } from '@octokit/request
	const request = (await import('@octokit/request')).request;
	const response = await request('GET /', {
		headers: {
			authorization: `Bearer ${tokenValue}`
		}
	});
	const scopes = response.headers['x-oauth-scopes'];
	if (scopes)
		return scopes.includes('write:packages')

	throw new Error('GitHub API response header lacked "x-oauth-scopes". This indicates the token we provided is not a workflow token nor a Personal Access Token (classic) and can never have permission to push packages.')
}

/** returns the value of {@link env.GITHUB_REPOSITORY_OWNER} */
function getOwner(): string | undefined {
	return env.GITHUB_REPOSITORY_OWNER;
}

export const nugetGitHubUrlBase = 'https://nuget.pkg.github.com';

/** @deprecated use {@link getNugetGitHubUrl()} instead. */
export const nugetGitHubUrl: string | undefined = getNugetGitHubUrl();

export function getNugetGitHubUrl() {
	const owner = getOwner();
	if (owner)
		return `${nugetGitHubUrlBase}/${owner}/index.json`;
	return undefined;
}

/**
 * If tokenEnvVar is NOT 'GITHUB_TOKEN', then test if the token is defined and return the boolean. 
 * Else If tokenEnvVar is 'GITHUB_TOKEN' and defined, then return true.
 * Else If tokenEnvVar is 'GITHUB_TOKEN' and undefined, then set tokenEnvVar to 'GH_TOKEN', test if GH_TOKEN is defined, and return the boolean.
 * @param tokenEnvVar the name of the environment variable with the token's value. Defaults to 'GITHUB_TOKEN'. If environment variable 'GITHUB_TOKEN' is undefined, falls back to 'GH_TOKEN'.
 * @returns `{isDefined: true}` if the token is defined. Else, if tokenEnvVar is 'GITHUB_TOKEN' (default) and token is defined, returns `true`. Else, if 'GH_TOKEN' is defined, returns `true`. Else, returns `false`
 */
export function isTokenDefined(tokenEnvVar = 'GITHUB_TOKEN'): { isDefined: boolean, fallback?: string } {
	if (tokenEnvVar !== 'GITHUB_TOKEN')
		return {
			isDefined: (env[tokenEnvVar /* custom */] !== undefined && env[tokenEnvVar /* custom */] !== 'undefined')
		};
	else if (env[tokenEnvVar /* GITHUB_TOKEN */] !== undefined && env[tokenEnvVar /* GITHUB_TOKEN */] !== 'undefined')
		return {
			isDefined: true
		};
	else return {
		isDefined: (env[tokenEnvVar = 'GH_TOKEN'] !== undefined && env[tokenEnvVar] !== 'undefined'),
		fallback: 'GH_TOKEN'
	};
}

/**
 * Get a {@link NuGetRegistryInfo} for pushing to your GitHub Packages NuGet registry.
 * todo: add support for private, custom GitHub instances. Token is only validated against github.com.
 * @export
 * @param {string | 'GITHUB_TOKEN' | 'GH_TOKEN'} [tokenEnvVar="GITHUB_TOKEN"] The name of environment variable storing the GitHub Packages NuGet registry API key. Defaults to `"GITHUB_TOKEN"`. If GITHUB_TOKEN is undefined, fallback to GH_TOKEN;
 * @param {string} [url=tokenEnvVar] The url of the GitHub Packages NuGet registry. Defaults to return value of {@link getNugetGitHubUrl()}.
 * @returns {(NuGetRegistryInfo | undefined)} a {@link NuGetRegistryInfo} object if {@link tokenEnvVar} and {@link url} are defined. Else, `undefined`.
 * note: `url` defaults to job's repository owner's GitHub registry in GitHub Actions workflow. If GITHUB_REPOSITORY_OWNER is not defined, then an error will be logged and `undefined` will be returned.
 */
export async function getGithubNugetRegistryPair(
	tokenEnvVar: string | 'GITHUB_TOKEN' | 'GH_TOKEN' = 'GITHUB_TOKEN',
	url: string | undefined = getNugetGitHubUrl(),
): Promise<NuGetRegistryInfo | undefined> {
	const errors: Error[] = [];
	const _isTokenDefinedInfo = isTokenDefined(tokenEnvVar);
	let canTokenWritePackages = undefined;

	if ((url ??= getNugetGitHubUrl()) === undefined) {
		errors.push(
			new Error(
				'The url for the GitHub Packages NuGet registry was undefined.\n' +
				'If running in a GitHub Actions workflow, something is seriously wrong.\n' +
				'If running in a different CI/CD pipeline and you wish to cross-push to GHPR, ensure GITHUB_REPOSITORY_OWNER is set correctly.\n',
			),
		);
	}

	if (_isTokenDefinedInfo.isDefined) {
		if (_isTokenDefinedInfo.fallback)
			tokenEnvVar = _isTokenDefinedInfo.fallback;
		try {
			canTokenWritePackages = await tokenCanWritePackages(tokenEnvVar);
		}
		catch (err) {
			if (err instanceof Error)
				errors.push(err);
			else
				errors.push(new Error(String(err)));
		}
	}
	else {
		const errMsg = `The environment variable ${tokenEnvVar} was specified as the source of the token to push a NuGet package to GitHub, but the environment variable does not exist.`
			+ `${_isTokenDefinedInfo.fallback === undefined ? '' : ` The fallback environment variable ${_isTokenDefinedInfo.fallback} is also undefined.`}`;
		errors.push(new Error(errMsg));
	}

	if (canTokenWritePackages === false) {
		// yes, this is a critical error that should be fixed before Semantic Release can succeed.
		// yes, this is incredibly irritating to deal with in local runs.
		errors.push(
			new Error(
				'The provided GitHub token has insufficient permissions or is a fine-grained permissions token. Only class Personal Access Tokens (classic) or workflow tokens with `repo` or `write:packages` permission can push a package.',
			),
		);
	}

	// conditions checked so `url` is certainly defined
	if (_isTokenDefinedInfo.isDefined && url !== undefined && canTokenWritePackages)
		return { tokenEnvVar, url };

	const aggErr = new Error(`One more more errors occurred when getting GHPR url-token pair. Errors:\n${errors.map(v => v.stack).join('\n')}`);

	if (env['SKIP_TOKEN'] === 'true' && aggErr.message.length > 0) {
		console.error('WARN: errors were thrown, but SKIP_TOKEN is defined.\n' + aggErr.stack)
		return undefined;
	}
	throw aggErr;
}
