import HceSharedConfig from '@halospv3/hce.shared-config';
import {
  deepStrictEqual,
  notStrictEqual,
  strictEqual,
} from 'node:assert/strict';
import { describe, it, test } from 'node:test';
import type { Options } from 'semantic-release';

await it('is built', async () => {
  deepStrictEqual(
    JSON.stringify(
      Object.entries(await import('@halospv3/hce.shared-config/index')),
      undefined,
      2,
    ),
    JSON.stringify(
      Object.entries(await import('../src/index.js')),
      undefined,
      2,
    ),
  );
});

const options: Options = HceSharedConfig;

await describe('index', async () => {
  await test('default export from index: semantic-release options', async () => {
    await test('options is defined', () => {
      notStrictEqual(options, undefined);
    });

    await test('options.preset is conventionalcommits', () => {
      strictEqual(options['preset'], 'conventionalcommits');
    });

    await test('options.branches is mainline-main, prerelease-develop', () => {
      deepStrictEqual(options.branches, [
        'main',
        {
          name: 'develop',
          channel: 'develop',
          prerelease: true,
        },
      ]);
    });
  });
});
