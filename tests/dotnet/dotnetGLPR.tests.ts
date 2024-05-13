import { ok } from 'node:assert';
import { todo } from 'node:test';
import {
	getGitlabNugetRegistryPair,
	GitLabTokenEnvVar,
	nugetGitLabUrl,
	nugetGitLabUrlBase,
} from '@halospv3/hce.shared-config/dotnet/dotnetGLPR';

ok(GitLabTokenEnvVar);
ok(nugetGitLabUrlBase === undefined || typeof nugetGitLabUrlBase === 'string');
ok(nugetGitLabUrl === undefined || typeof nugetGitLabUrl === 'string');

await todo(getGitlabNugetRegistryPair.name, async () => {
	await todo('sufficient token permissions');
	await todo('insufficient token permissions');
	await todo('custom url');
	await todo('custom token');
});
