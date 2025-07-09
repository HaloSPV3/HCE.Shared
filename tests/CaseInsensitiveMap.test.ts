import { describe, it } from 'node:test';
import { CaseInsensitiveMap } from '../src/CaseInsensitiveMap.js';
import { deepStrictEqual, ok, strictEqual } from 'node:assert';

const cim = new CaseInsensitiveMap([['KEY0', 'value']]);

await describe('cim.get', async () => {
  await it('returns value with case-matching key', () => {
    strictEqual(cim.get('KEY0'), 'value');
  });
  await it('returns value with case-insensitive key', () => {
    strictEqual(cim.get('key0'), 'value');
  });
});

await describe('cim.has', async () => {
  await it('returns true with case-matching key', () => {
    strictEqual(cim.has('KEY0'), true);
  });
  await it('returns true with case-insensitive key', () => {
    strictEqual(cim.has('key0'), true);
  });
});

await describe('cim.set', async () => {
  await it('sets/adds entry in-place', () => {
    deepStrictEqual(cim.set('KEY1', 'unique-value'), cim);
    strictEqual(cim.get('key1'), 'unique-value');
  });
});

await describe('cim.delete', async () => {
  await it('deletes entries case-insensitively', () => {
    cim.set('DeleteMe', '');
    ok(cim.delete('deleteme'));
    strictEqual(cim.has('deleteME'), false);
  });
});
