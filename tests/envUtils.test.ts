import { getEnv, getEnvVarValue } from '@halospv3/hce.shared-config/envUtils';
import { strictEqual } from 'node:assert/strict';
import { env } from 'node:process';
import { describe, it } from 'node:test';

await describe('envUtils', async () => {
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
      function isProcessEnv(o: object): o is NodeJS.ProcessEnv {
        return (
          Object.keys(o).every(v => typeof v === 'string')
          && Object.values(o).every(
            v => v === undefined || typeof v === 'string',
          )
        );
      }
      const o = getEnv() satisfies NodeJS.ProcessEnv;
      strictEqual(isProcessEnv(o), true);
    });

    await it('can pass dotenv options', { todo: true });

    await it('can override loaded variables', { todo: true });
  });
});
