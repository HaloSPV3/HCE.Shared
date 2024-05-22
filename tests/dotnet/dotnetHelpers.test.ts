import { deepStrictEqual, ok, strictEqual } from 'node:assert';
import { describe, it, todo } from 'node:test';
import {
	configureDotnetNugetPush,
	configurePrepareCmd,
	nugetDefault,
} from '@halospv3/hce.shared-config/dotnet/dotnetHelpers';

await describe('dotnetHelpers', async () => {
	await todo("configurePrepareCmd", () => {
		ok(typeof configureDotnetNugetPush === "function");
		strictEqual(typeof configureDotnetNugetPush, "function");
		strictEqual(configurePrepareCmd.name, "configurePrepareCmd");
	});

	await it('nugetDefault is as expected', () => {
		const expected = {
			tokenEnvVar: 'NUGET_TOKEN',
			url: 'https://api.nuget.org/v3/index.json',
		};
		deepStrictEqual(nugetDefault, expected);
	});


	await it("configureDotnetNugetPush works", (t) => {
		strictEqual(typeof configureDotnetNugetPush, 'function');
		strictEqual(configureDotnetNugetPush.name, "configureDotnetNugetPush");

		t.todo(`nupkgDir - default`);
		t.todo(`nupkgDir - custom`);
		t.todo(`registries - default`);
		t.todo(`registries - custom`);
		t.todo(`pushToGitHub adds github defaults`);
	});

});