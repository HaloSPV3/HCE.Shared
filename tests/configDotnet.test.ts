import { describe, it } from 'node:test';
import { appendPlugins, getConfig, insertAndEditPlugins } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet';
import { notDeepStrictEqual, ok, strictEqual } from 'node:assert';
import { fileSync, setGracefulCleanup } from 'tmp';
import { unlinkSync, writeFileSync } from 'node:fs';
import { env } from 'node:process';

await describe('configDotnet', async () => {
	await describe('appendPlugins', () => {
		strictEqual(appendPlugins.name, 'appendPlugins');

		it('throws Error when Options parameters lacks "plugins"', () => {
			let x = undefined;
			try {
				x = appendPlugins({}, [], [])
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


		await it('does not throw when projectToPackAndPush contains at least one item', () => {
			env['SKIP_TOKEN'] = 'true';
			const actual = (() => {
				setGracefulCleanup();
				const tmpProj = fileSync({ postfix: '.csproj', discardDescriptor: true });
				writeFileSync(tmpProj.name, '<Project> <PropertyGroup> <TargetFramework>net6.0</TargetFramework> <RuntimeIdentifier>win7-x86</RuntimeIdentifier> </PropertyGroup> </Project>')
				try {
					return getConfig([tmpProj.name], [tmpProj.name])
				}
				catch (err) {
					if (err instanceof AggregateError)
						return err;
					else if (err instanceof Error)
						return err;
					else
						return new Error(String(err));
				}
				finally {
					unlinkSync(tmpProj.name)
				}
			})();
			ok(!(actual instanceof Error), '`actual` should not be an Error.\n' + actual.message)
		})

		await it('throws Error when projectsToPublish is an empty array.', () => {
			const actual = (() => {
				try {
					return getConfig([], false);
				} catch (error) {
					return error as Error;
				}
			})();
			ok(actual instanceof Error)
			ok(actual.message.includes("projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path."));
		})
	});
});
