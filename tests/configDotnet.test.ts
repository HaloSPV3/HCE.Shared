import { appendPlugins, getConfig, insertAndEditPlugins } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet';
import { notDeepStrictEqual, ok, strictEqual } from 'node:assert';
import { unlinkSync, writeFileSync } from 'node:fs';
import { env } from 'node:process';
import { describe, it } from 'node:test';
import { fileSync, setGracefulCleanup } from 'tmp';

await describe('configDotnet', async () => {
	await describe('appendPlugins', () => {
		strictEqual(appendPlugins.name, 'appendPlugins');

		it('throws Error when Options parameters lacks "plugins"', async () => {
			let x = undefined;
			try {
				x = await appendPlugins({}, [], [])
			}
			catch (error) {
				strictEqual(error instanceof Error, true)
			}
			strictEqual(x, undefined)
		});
	});

	await describe('insertAndEditPlugins', () => {
		strictEqual(insertAndEditPlugins.name, 'insertAndEditPlugins');

		it('modifies the Options object when expected to do so', () => {
			const x = {};
			const y = insertAndEditPlugins({ ...x })
			notDeepStrictEqual(x, y);
		});
		it('inserts plugins at the correct positions', { todo: true });
		it('Git plugin options are added only when the Git plugin is already in array', { todo: true });
	});

	await describe('getConfig', async () => {
		strictEqual(getConfig.name, 'getConfig');


		await it('does not throw when projectToPackAndPush contains at least one item', async () => {
			env['GITHUB_REPOSITORY_OWNER'] = "HaloSPV3";
			env['SKIP_TOKEN'] = 'true';
			setGracefulCleanup();
			const tmpProj = fileSync({ postfix: '.csproj', discardDescriptor: true });
			writeFileSync(tmpProj.name, '<Project> <PropertyGroup> <TargetFramework>net6.0</TargetFramework> <RuntimeIdentifier>win7-x86</RuntimeIdentifier> </PropertyGroup> </Project>')
			let actual = undefined;
			try {
				actual = await getConfig([tmpProj.name], [tmpProj.name])
			}
			catch (err) {
				if (err instanceof Error)
					actual = err;
				else
					actual = new Error(String(err));
			}
			finally {
				unlinkSync(tmpProj.name)
			}

			ok(!(actual instanceof Error), '`actual` should not be an Error.\n' + actual.stack)
		})

		await it('throws Error when projectsToPublish is an empty array.', async () => {
			let actual = undefined;
			try {
				actual = await getConfig([], false);
			} catch (error) {
				actual = error as Error;
			}

			ok(actual instanceof Error)
			ok(actual.message.includes("projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path."));
		})
	});
});
