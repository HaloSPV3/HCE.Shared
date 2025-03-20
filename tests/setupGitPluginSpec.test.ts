import { setupGitPluginSpec } from '../src/setupGitPluginSpec.js';
import { deepStrictEqual, notDeepStrictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

await describe('setupGitPluginSpec', async () => {
  await it('returns original array if it lacks Git PluginSpec', () => {
    deepStrictEqual(setupGitPluginSpec([]), []);
  });

  await it('modifies provided array if it includes Git PluginSpec', () => {
    notDeepStrictEqual(setupGitPluginSpec([['@semantic-release/git', {}]]), [
      '@semantic-release/git',
    ]);
  });
});
