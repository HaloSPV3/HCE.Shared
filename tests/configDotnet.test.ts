import { describe, todo } from 'node:test';
import { appendPlugins, getConfig, insertAndEditPlugins } from '@halospv3/hce.shared-config/semanticReleaseConfigDotnet';

await describe('configDotnet', async () => {
	await todo(insertAndEditPlugins.name, (t) => {
		t.todo('Insert/splice modifies the config');
		t.todo('Plugins are inserted at the correct index');
		t.todo('Git plugin options are added only when the Git plugin is already in array');
	});

	await todo(appendPlugins.name);

	await todo(getConfig.name);
});
