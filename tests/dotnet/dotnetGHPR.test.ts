import { ok } from 'node:assert';
import { describe, test } from 'node:test';
import {
	getGithubNugetRegistryPair,
	nugetGitHubUrl,
	nugetGitHubUrlBase,
} from '@halospv3/hce.shared-config/dotnet/dotnetGHPR';

await describe('dotnetGHPR', async () => {
	await test('nugetGitHubUrl is defined', () => {
		ok(nugetGitHubUrl === undefined ? true : nugetGitHubUrl.startsWith(nugetGitHubUrlBase));
	});

	await test(getGithubNugetRegistryPair.name, (t) => {
		t.todo('mock insufficient token');
		t.todo('mock sufficient token');
		t.todo('mock custom token environment variable');
		t.todo('mock custom url');
	});
})
