if (!env.GITHUB_REPOSITORY_OWNER)
	env.GITHUB_REPOSITORY_OWNER = "HaloSPV3";
const owner = env.GITHUB_REPOSITORY_OWNER;

import {
	getGithubNugetRegistryPair,
	getNugetGitHubUrl,
	isTokenDefined,
	nugetGitHubUrlBase,
	tokenCanWritePackages
} from '@halospv3/hce.shared-config/dotnet/dotnetGHPR';
import type { NuGetRegistryInfo } from '@halospv3/hce.shared-config/dotnet/dotnetHelpers';
import { getEnv, getEnvVarValue } from '@halospv3/hce.shared-config/envUtils';
import { deepStrictEqual, notStrictEqual, ok, strictEqual } from 'node:assert';
import { env } from 'node:process';
import { beforeEach, describe, it, todo } from 'node:test';
import { configDotenv, type DotenvConfigOptions } from 'dotenv';
import { dirname, join } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';

const dotenvPath = join(dirname(dirname(import.meta.dirname)), '.env');
if (!existsSync(dotenvPath))
	writeFileSync(dotenvPath, '')
const dotenvOptions: DotenvConfigOptions = { path: dotenvPath }

await describe('dotnetGHPR', async () => {
	await describe('tokenCanWritePackages', async () => {
		await it('returns true when GITHUB_TOKEN is valid and GITHUB_REPOSITORY_OWNER is defined', async (t) => {
			if (getEnvVarValue('GITHUB_TOKEN')?.startsWith('ghp') !== true) {
				t.skip('Personal GITHUB_TOKEN is unavailable for testing');
				return;
			}

			if (!getEnvVarValue('GITHUB_REPOSITORY_OWNER')) {
				t.skip('GITHUB_REPOSITORY_OWNER is unavailable for testing.')
				return;
			}

			const url = getNugetGitHubUrl();
			ok(url);

			const canWrite = await tokenCanWritePackages('GITHUB_TOKEN', url)
			ok(canWrite, 'tokenCanWritePackages determined GITHUB_TOKEN failed ');
		})

		await it('returns false when GITHUB_TOKEN is invalid', async (t) => {
			if (!getEnvVarValue('GITHUB_REPOSITORY_OWNER')) {
				t.skip('GITHUB_REPOSITORY_OWNER is unavailable for testing.')
				return;
			}
			const warnBak = console.warn;
			try {
				console.warn = () => { return };
				const url = getNugetGitHubUrl();
				ok(url);

				const TOKEN_CANNOT_WRITE = 'TOKEN_CANNOT_WRITE';
				getEnv(undefined, { TOKEN_CANNOT_WRITE })
				const canWrite = await tokenCanWritePackages(TOKEN_CANNOT_WRITE);
				strictEqual(canWrite, false);
			}
			finally {
				console.warn = warnBak;
			}
		});
	});

	await describe('getNugetGitHubUrl', async () => {
		await it('returns string when GITHUB_REPOSITORY_OWNER is defined', () => {
			env.GITHUB_REPOSITORY_OWNER = owner;
			deepStrictEqual(getNugetGitHubUrl(), `${nugetGitHubUrlBase}/${env.GITHUB_REPOSITORY_OWNER}/index.json`)
		});

		await it('returns undefined when GITHUB_REPOSITORY_OWNER is undefined', () => {
			const warnBak = console.warn;
			try {
				delete env.GITHUB_REPOSITORY_OWNER;
				console.warn = () => { return }
				deepStrictEqual(getNugetGitHubUrl(), undefined);
			} finally {
				env.GITHUB_REPOSITORY_OWNER = owner;
				console.warn = warnBak
			}
		});
	});

	await describe('isTokenDefined', async () => {
		await it('is a function', () => {
			strictEqual(typeof isTokenDefined, 'function')
		});

		await it('returns true when custom token is defined', () => {
			env["CUSTOM_TOKEN_DEFINED"] = "unchecked value";
			deepStrictEqual(
				isTokenDefined('CUSTOM_TOKEN_DEFINED'),
				{ isDefined: true } as ReturnType<typeof isTokenDefined>
			);
		});

		await it('returns false when custom token is undefined', () => {
			deepStrictEqual(
				isTokenDefined("CUSTOM_TOKEN_UNDEFINED"),
				{ isDefined: false } as ReturnType<typeof isTokenDefined>
			);
		});

		const bakGH_TOKEN = 'GH_TOKEN' in env && env.GH_TOKEN !== 'undefined'
			? env.GH_TOKEN
			: undefined;
		const bakGITHUB_TOKEN = 'GITHUB_TOKEN' in env && env.GITHUB_TOKEN !== 'undefined'
			? env.GITHUB_TOKEN
			: undefined;

		await it('returns true when GITHUB_TOKEN is defined', () => {
			delete env.GH_TOKEN
			delete env.GITHUB_TOKEN

			env["GITHUB_TOKEN"] = bakGITHUB_TOKEN ?? bakGH_TOKEN ?? "unchecked value";
			deepStrictEqual(
				isTokenDefined(),
				{ isDefined: true } as ReturnType<typeof isTokenDefined>
			);
			if ("GITHUB_TOKEN" in env)
				delete env.GITHUB_TOKEN
		}).finally(async () => {
			await it('returns true and fallback:"GH_TOKEN" when GITHUB_TOKEN is undefined, but fallback GH_TOKEN is defined', () => {
				env.GH_TOKEN = bakGITHUB_TOKEN ?? bakGH_TOKEN ?? "unchecked value";
				delete env.GITHUB_TOKEN;
				deepStrictEqual(
					isTokenDefined(),
					{
						isDefined: true,
						fallback: 'GH_TOKEN'
					} as ReturnType<typeof isTokenDefined>
				)
			}).finally(async () => {
				await it('returns false and fallback:"GH_TOKEN" when GITHUB_TOKEN and GH_TOKEN are undefined', (t) => {
					delete env.GH_TOKEN;
					delete env.GITHUB_TOKEN;
					const dotenv = getEnv();
					if (dotenv.GH_TOKEN) {
						t.skip('GH_TOKEN is defined in .env, so this test will be skipped for the sake of sanity');
						return;
					}
					const _isTokenDefinedInfo = isTokenDefined()
					deepStrictEqual(
						_isTokenDefinedInfo,
						{
							isDefined: false,
							fallback: 'GH_TOKEN'
						} as ReturnType<typeof isTokenDefined>
					)
				});
			})
		}).finally(() => {
			// restore
			if (bakGH_TOKEN)
				env.GH_TOKEN = bakGH_TOKEN;
			else
				delete env.GH_TOKEN;
			if (bakGITHUB_TOKEN)
				env.GITHUB_TOKEN = bakGITHUB_TOKEN;
			else
				delete env.GITHUB_TOKEN;
		});
	});

	await describe('getGithubNugetRegistryPair', async () => {
		beforeEach(() => {
			if (!env.GITHUB_REPOSITORY_OWNER)
				env.GITHUB_REPOSITORY_OWNER = "HaloSPV3";
			configDotenv(dotenvOptions);
		})
		const _dotenv = configDotenv(dotenvOptions);
		strictEqual(_dotenv.error, undefined)

		await it('getGitHubNugetRegistryPair is function', () => {
			const t = typeof getGithubNugetRegistryPair;
			strictEqual(t, "function");
		});

		await it("can return when classic or workflow GITHUB_TOKEN or GH_TOKEN is defined with write:packages.", async (t) => {
			const GITHUB_REPOSITORY_OWNER = env.GITHUB_REPOSITORY_OWNER = "HaloSPV3";
			const _nugetGitHubUrl = `https://nuget.pkg.github.com/${GITHUB_REPOSITORY_OWNER}/index.json`;
			const tokenEnvVar = "GITHUB_TOKEN";
			const _isTokenDefinedInfo = isTokenDefined();
			const _dotenv = configDotenv(dotenvOptions);

			strictEqual(_dotenv.error, undefined);

			if (!_isTokenDefinedInfo.isDefined) {
				t.skip('SKIP: GitHub token unavailable. To test a valid token, create a ".env" file in the repo root and add "GITHUB_TOKEN=ghp_****".')
				return;
			}

			let pair: NuGetRegistryInfo | Error | undefined = undefined;
			let canWritePackages: boolean | Error = false;

			try {
				canWritePackages = await tokenCanWritePackages(
					_isTokenDefinedInfo.fallback ?? tokenEnvVar);
			}
			catch (err) {
				canWritePackages = err instanceof Error ? err : new Error(String(err));
			}

			strictEqual(canWritePackages, true, 'unable to push packages');

			try {
				env.GITHUB_REPOSITORY_OWNER ??= owner;
				pair = await getGithubNugetRegistryPair();
			} catch (err) {
				pair = err instanceof Error ? err : new Error(String(err));
			}

			if (pair instanceof Error)
				strictEqual(pair, undefined);
			else if (pair === undefined)
				notStrictEqual(pair, undefined);
			else
				deepStrictEqual(pair.url, _nugetGitHubUrl)
		});

		todo('mock insufficient token');
		todo('mock sufficient token');
		todo('mock custom url');
	});
})
