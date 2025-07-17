import { describe, it } from 'node:test';
import { insertPlugin } from '../src/insertPlugins.js';
import { deepStrictEqual, notDeepStrictEqual } from 'node:assert';

await describe('insertPlugin', async () => {
  await it('can insert plugins where specified', () => {
    let plugins: [string, unknown][] = [['A', {}], ['C', {}]];
    plugins = insertPlugin(plugins, ['A'], ['B'], ['C']);
    deepStrictEqual(
      plugins,
      [['A', {}], ['B', {}], ['C', {}]],
    );
  });
  await it('never inserts plugins as strings', () => {
    let plugins: [string, unknown][] = [['A', undefined], ['C', undefined]];
    plugins = insertPlugin(plugins, ['A'], ['B'], ['C']);
    notDeepStrictEqual(
      plugins,
      [['A', undefined], 'B', ['C', undefined]],
    );
  });
  await it('throws when a sorting order is impossible', () => {
    let plugins: [string, unknown][] = [['C', {}], ['A', {}]];
    try {
      plugins = insertPlugin(plugins, ['A'], ['B'], ['C']);
    }
    catch { /* empty */ }
    deepStrictEqual(
      plugins,
      [['C', {}], ['A', {}]],
    );
  });
});
