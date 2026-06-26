/* eslint-disable unicorn/name-replacements */
import { getEnv as getEnvironment, getEnvVarValue as getEnvironmentVariableValue } from '../../src/utils/env.ts';
import { strictEqual } from 'node:assert/strict';
import { env } from 'node:process';
import { describe, it } from 'node:test';

await describe('env', { concurrency: true }, async () => {
  await describe('getEnvVarValue', async () => {
    await it('returns value of TEMP when told to do so', () => {
      strictEqual(getEnvironmentVariableValue('TEMP'), env['TEMP']);
    });

    await it(
      'can load .env file and variable value in process.env is identical to value in .env file',
      { todo: true },
    );
  });

  await describe('getEnv', async () => {
    await it('returns ProcessEnv object', () => {
      const o = getEnvironment() satisfies NodeJS.ProcessEnv;
      strictEqual(isProcessEnvironment(o), true);
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
function isProcessEnvironment(object: object): object is NodeJS.ProcessEnv {
  return (
    Object.keys(object).every(v => typeof v === 'string')
    && Object.values(object).every(
      v => v === undefined || typeof v === 'string',
    )
  );
}
