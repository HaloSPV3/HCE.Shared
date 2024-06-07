import { setupGitPluginSpec } from '@halospv3/hce.shared-config/setupGitPluginSpec';
import { deepEqual } from 'node:assert';
import { ok } from 'node:assert/strict';
import { describe, todo } from 'node:test';

await describe('setupGitPluginSpec', async () => {
    // placeholder. Remove when tests are implemented.
    ok(typeof setupGitPluginSpec === 'function');

    deepEqual([], setupGitPluginSpec([]));

    await todo('if git plugin included, return modified plugins array');
    await todo('if git plugin NOT included, return original plugins array');
});
