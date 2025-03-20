import { ok, strictEqual } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import {
  configureDotnetNugetPush,
  configurePrepareCmd,
} from '../../src/dotnet/helpers.js';

await describe('dotnetHelpers', async () => {
  await todo('configurePrepareCmd', () => {
    ok(typeof configureDotnetNugetPush === 'function');
    strictEqual(typeof configureDotnetNugetPush, 'function');
    strictEqual(configurePrepareCmd.name, 'configurePrepareCmd');
  });

  await it('configureDotnetNugetPush works', (t) => {
    strictEqual(typeof configureDotnetNugetPush, 'function');
    strictEqual(configureDotnetNugetPush.name, 'configureDotnetNugetPush');

    t.todo(`nupkgDir - default`);
    t.todo(`nupkgDir - custom`);
    t.todo(`registries - default`);
    t.todo(`registries - custom`);
    t.todo(`pushToGitHub adds github defaults`);
  });
});
