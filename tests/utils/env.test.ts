import { getEnv, getEnvVarValue } from '../../src/utils/env.js';
import { strictEqual } from 'node:assert/strict';
import { env } from 'node:process';
import { describe, it } from 'node:test';

await describe('env', { concurrency: true }, async () => {
  await describe('getEnvVarValue', async () => {
    await it('returns value of TEMP when told to do so', () => {
      strictEqual(getEnvVarValue('TEMP'), env['TEMP']);
    });

    await it(
      'can load .env file and variable value in process.env is identical to value in .env file',
      { todo: true },
    );
  });

  await describe('getEnv', async () => {
    await it('returns ProcessEnv object', () => {
      const o = getEnv() satisfies NodeJS.ProcessEnv;
      strictEqual(isProcessEnv(o), true);
    });

    await it('can pass dotenv options', { todo: true });

    await it('can override loaded variables', { todo: true });
  });
});

/**
 * Determines if the {@link object} satisfies the {@link NodeJS.ProcessEnv} type.
 * @param object any object
 * @returns `true` if the {@link object} satisfies the {@link NodeJS.ProcessEnv} type. Else, `false`.
 */
function isProcessEnv(object: object): object is NodeJS.ProcessEnv {
  return (
    Object.keys(object).every(v => typeof v === 'string')
    && Object.values(object).every(
      v => v === undefined || typeof v === 'string',
    )
  );
}
