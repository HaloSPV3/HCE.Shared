import { ok, strictEqual } from 'node:assert';
import { describe, it } from 'node:test';
import {
	getGithubNugetRegistryPair,
	nugetGitHubUrl,
	nugetGitHubUrlBase,
} from '@halospv3/hce.shared-config/dotnet/dotnetGHPR';

await describe('dotnetGHPR', async (c) => {
	await it(`nugetGitHubUrl is defined`, { signal: c.signal }, () => {
		const { GITHUB_REPOSITORY_OWNER } = process.env;
		if (GITHUB_REPOSITORY_OWNER) {
			ok(nugetGitHubUrl);
			strictEqual(typeof nugetGitHubUrl, "string", `nugetGitHubUrl should be a string when GITHUB_REPOSITORY_OWNER is in process environment! It is "${typeof nugetGitHubUrl}"`);
			strictEqual(typeof nugetGitHubUrlBase, "string", `nugetGitHubUrlBase should be a string! It is "${typeof nugetGitHubUrlBase}"`);
			ok(nugetGitHubUrl.startsWith(nugetGitHubUrlBase));
		}
		else {
			strictEqual(nugetGitHubUrl, undefined);
		}
	});

	await it('getGitHubNugetRegistryPair is function', () => {
		strictEqual(typeof getGithubNugetRegistryPair, "function", "getGitHubNugetRegistryPair must be a function.");
	});

	await it('getGithubNugetRegistryPair', { signal: c.signal }, (t) => {
		t.todo('mock insufficient token');
		t.todo('mock sufficient token');
		t.todo('mock custom token environment variable');
		t.todo('mock custom url');
	});
})
