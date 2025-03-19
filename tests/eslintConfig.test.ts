import eslintConfig from '@halospv3/hce.shared-config/eslintConfig';
import { deepStrictEqual, ok } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import { inspect } from 'node:util';

await it('is built', async () => {
  const built = inspect(
    await import('@halospv3/hce.shared-config/eslintConfig'),
    false,
    Infinity,
  );
  const source = inspect(
    await import('../src/eslintConfig.js'),
    false,
    Infinity,
  );
  deepStrictEqual(built, source);
});

await describe('eslintConfig', async () => {
  await it('exports an array', () => {
    ok(Array.isArray(eslintConfig));
  });
  await todo('excludes certain paths from linting');
});
