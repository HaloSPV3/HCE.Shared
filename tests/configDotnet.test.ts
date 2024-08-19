import { getConfig, insertAndEditPlugins } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet';
import { notDeepStrictEqual, ok, strictEqual } from 'node:assert';
import { unlinkSync, writeFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { fileSync, setGracefulCleanup } from 'tmp';

await describe('configDotnet', async () => {
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
			process.env.GITHUB_REPOSITORY_OWNER = "HaloSPV3";
			process.env.SKIP_TOKEN = 'true';
			setGracefulCleanup();
			const tmpProj = fileSync({ postfix: '.csproj', discardDescriptor: true });
			writeFileSync(tmpProj.name, '<Project> <PropertyGroup> <TargetFramework>net6.0</TargetFramework> <RuntimeIdentifier>win7-x86</RuntimeIdentifier> </PropertyGroup> </Project>')
			let actual = undefined;
			try {
				actual = await getConfig([tmpProj.name], [tmpProj.name])
			}
			catch (err) {
				actual = err instanceof Error ? err : new Error(String(err));
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
