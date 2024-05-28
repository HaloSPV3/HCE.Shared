import { describe, it } from 'node:test';
import { appendPlugins, getConfig, insertAndEditPlugins } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet';
import { notDeepStrictEqual, ok, strictEqual } from 'node:assert';

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

		await it('throws Error when projectsToPublish is an empty array, projectsToPackAndPush are both empty arrays.', () => {
			const actual = (() => {
				try {
					return getConfig([], false);
				} catch (error) {
					return error as Error;
				}
			})();
			ok(actual instanceof Error)
			strictEqual(actual.message, "getConfig cannot continue. One or more errors occurred.\nprojectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path.")
		})
	});
});
