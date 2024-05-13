import { ok } from 'node:assert';
import { describe, test, todo } from 'node:test';
import {
	configureDotnetNugetPush,
	configurePrepareCmd,
	nugetDefault,
} from '@halospv3/hce.shared-config/dotnet/dotnetHelpers';

await describe('dotnetHelpers', async () => {
	await todo(configurePrepareCmd.name);

	ok(typeof nugetDefault === 'object');
	await todo('nugetDefault');

	await test(configureDotnetNugetPush.name, (t) => {
		t.todo(`${configureDotnetNugetPush.name}: nupkgDir - default`);
		t.todo(`${configureDotnetNugetPush.name}: nupkgDir - custom`);
		t.todo(`${configureDotnetNugetPush.name}: registries - default`);
		t.todo(`${configureDotnetNugetPush.name}: registries - custom`);
		t.todo(`${configureDotnetNugetPush.name}: pushToGitHub adds github defaults`);
	});

});