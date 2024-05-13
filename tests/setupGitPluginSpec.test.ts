import { ok } from 'node:assert/strict';
import { describe, todo } from 'node:test';
import { setupGitPluginSpec } from '@halospv3/hce.shared-config/setupGitPluginSpec';

await describe('setupGitPluginSpec', async () => {
    // placeholder. Remove when tests are implemented.
    ok(typeof setupGitPluginSpec === 'function');

    await todo('if git plugin included, return modified plugins array');
    await todo('if git plugin NOT included, return original plugins array');
});
