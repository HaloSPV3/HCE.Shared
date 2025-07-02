import { ok } from 'node:assert/strict';
import { spawnSync, type ExecException, type SpawnSyncReturns } from 'node:child_process';
import { getEnvVarValue } from '../envUtils.js';
import { createDummyNupkg } from './createDummyNupkg.js';
import type { NuGetRegistryInfo } from './dotnetHelpers.js';
import { isNativeError } from 'node:util/types';

/**
 * @param tokenEnvVar The name of the environment variable containing the NUGET token
 * @returns `true` if the token can be used to push nupkg to the given Nuget registry
 * @throws
 * - TypeError: The environment variable ${tokenEnvVar} is undefined!
 * - Error:
 *   - The value of the token in ${tokenEnvVar} begins with 'github_pat_' which means it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.
 *   - The GitHub API response header lacked "x-oauth-scopes". This indicates the token we provided is not a workflow token nor a Personal Access Token (classic) and can never have permission to push packages.
 */
export function tokenCanWritePackages(tokenEnvVar: string, url?: string) {
	/* double-check the token exists */
	const info = isTokenDefined(tokenEnvVar);
	ok(info.isDefined)

	if (url === undefined) {
		console.debug(`tokenCanWritePackages was called without a NuGet Source URL. Defaulting to use ${`${nugetGitHubUrlBase}/\${GITHUB_REPOSITORY_OWNER}/index.json`} where GITHUB_REPOSITORY_OWNER is '${getOwner()}'`)
		url = getNugetGitHubUrl();
	}

	if (url === undefined || url === '') 
		throw new Error('The NuGet source is undefined or empty!')

	if (info.fallback)
		tokenEnvVar = info.fallback;

	const tokenValue = getEnvVarValue(tokenEnvVar);
	if (tokenValue === undefined)
		throw new TypeError(`The environment variable ${tokenEnvVar} is undefined!`)

	if (tokenValue.startsWith('github_pat_'))
		throw new Error(`The value of the token in ${tokenEnvVar} begins with 'github_pat_' which means it's a Fine-Grained token. At the time of writing, GitHub Fine-Grained tokens cannot push packages. If you believe this is statement is outdated, report the issue at https://github.com/halospv3/hce.shared/issues/new. For more information, see https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-nuget-registry.`)

	const dummyNupkgPath = createDummyNupkg();

	try {
		let pushResult: SpawnSyncReturns<string> | undefined = undefined;
		try {
			pushResult = spawnSync(
				'dotnet',
				[
					'nuget',
					'push',
					dummyNupkgPath,
					'--source',
					url,
					'--api-key',
					tokenValue,
					'--skip-duplicate',
					'--force-english-output'
				],
				{
					stdio: 'pipe',
					encoding: 'utf8',
					shell: process.platform === 'win32' && spawnSync('dotnet.exe', { windowsHide: true }).status === null
						? 'cmd.exe'
						: undefined,
					windowsHide: true,
				},
			);
		}
		catch (_error) {
				// censor token
				const error = !isNativeError(_error)
					? new Error(`dotnet nuget push failed. \n${String(_error)}`)
					: _error;

				const tokenPattern = new RegExp(tokenValue, 'g');

				error.message = error.message.replace(tokenPattern,'***');

				if (error.stack)
						error.stack = error.stack.replace(tokenPattern, '***');
				if ('cmd' in error && typeof error.cmd === 'string')
						error.cmd = error.cmd.replace(tokenPattern, '***');
				if ('stdout' in error && typeof error.stdout === 'string')
						error.stdout = error.stdout.replace(tokenPattern, '***');
				if ('stderr' in error&& typeof error.stderr === 'string') {
					error.stderr = error.stderr.replace(tokenPattern, '***');
				}
			if ('spawnargs' in error && Array.isArray(error.spawnargs)) {
				error.spawnargs = error.spawnargs.map(arg => {
			return typeof arg === 'string'
				? arg.replace(tokenPattern, '***')
				: arg;
				})
			}

			throw error;
		}

		const errNewline = pushResult.stdout.includes('\r\n') ? '\r\n' : pushResult.stdout.includes('\r') ? '\r' : '\n';

		// if any *lines* start with "error: " or "Error: ", log stderr
		const errorCount = pushResult.stdout.split(errNewline).filter(line => line.trim().startsWith('error: ') || line.trim().startsWith('Error: ')).length;
		if (errorCount > 0)
			console.error(pushResult.stdout);

		// if any lines start with "warn : ", log stdout
		const warningCount = pushResult.stdout.split(errNewline).filter(line => line.trim().startsWith('warn : ')).length;
		if (warningCount > 0)
			console.warn(pushResult.stdout);

		const hasAuthError = pushResult.stdout.includes('401 (Unauthorized)');

		// return true is no lines contain error indicators.
		return errorCount === 0 && hasAuthError === false;
	}
	catch (err) {
		const stdout = (err as ExecException).stdout ?? '';
		console.error((err as ExecException).stack + '\n' + stdout.split('Usage: dotnet nuget push')[0]);
		return false;
	}
}

/** returns the value of GITHUB_REPOSITORY_OWNER */
function getOwner(): string | undefined {
	return getEnvVarValue('GITHUB_REPOSITORY_OWNER')
}

export const nugetGitHubUrlBase = 'https://nuget.pkg.github.com';

/** @deprecated use {@link getNugetGitHubUrl()} instead. */
export const nugetGitHubUrl: string | undefined = getNugetGitHubUrl();

// todo!: refactor to "return string else throw"
export function getNugetGitHubUrl() {
	const owner = getOwner();
	if (owner)
		return `${nugetGitHubUrlBase}/${owner}/index.json`;
	console.warn('GITHUB_REPOSITORY_OWNER is undefined! Default NuGet source for GitHub is unavailable.');
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
	let token = getEnvVarValue(tokenEnvVar /* custom or GITHUB_TOKEN */);

	if (tokenEnvVar !== 'GITHUB_TOKEN')
		return { isDefined: (token !== undefined && token !== 'undefined') };

	/* GITHUB_TOKEN */
	if (token !== undefined && token !== 'undefined')
		return { isDefined: true };

	token = getEnvVarValue('GH_TOKEN');
	return {
		isDefined: (token !== undefined && token !== 'undefined'),
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
export function getGithubNugetRegistryPair(
	tokenEnvVar: string | 'GITHUB_TOKEN' | 'GH_TOKEN' = 'GITHUB_TOKEN',
	url: string | undefined = getNugetGitHubUrl(),
): NuGetRegistryInfo | undefined {
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
			canTokenWritePackages = tokenCanWritePackages(tokenEnvVar, url);
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

	if (getEnvVarValue('SKIP_TOKEN') === 'true' && aggErr.message.length > 0) {
		console.error('WARN: errors were thrown, but SKIP_TOKEN is defined.\n' + aggErr.stack)
		return undefined;
	}
	throw aggErr;
}
