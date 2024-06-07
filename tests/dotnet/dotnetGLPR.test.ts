import { describe, it, todo } from 'node:test';
import { ok, strictEqual } from 'node:assert';
import {
	getGitlabNugetRegistryPair,
	GitLabTokenEnvVar,
	nugetGitLabUrl,
	nugetGitLabUrlBase,
} from '@halospv3/hce.shared-config/dotnet/dotnetGLPR';

await describe('dotnetGLPR', async () => {
	await describe('GitLabTokenEnvVar', () => {
		ok(GitLabTokenEnvVar);
	});

	await describe('nugetGitLabUrlBase', () => {
		ok(nugetGitLabUrlBase === undefined || typeof nugetGitLabUrlBase === 'string');
	});

	await describe('nugetGitLabUrl', () => {
		ok(nugetGitLabUrl === undefined || typeof nugetGitLabUrl === 'string');
	});

	await describe('getGitlabNugetRegistryPair', async () => {
		await it('is a function', () => {
			strictEqual(typeof getGitlabNugetRegistryPair, "function")
		});
		await todo('sufficient token permissions');
		await todo('insufficient token permissions');
		await todo('custom url');
		await todo('custom token');
	});
});
