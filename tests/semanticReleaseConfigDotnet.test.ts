import {
  getConfig,
  SemanticReleaseConfigDotnet,
} from '../src/semanticReleaseConfigDotnet.js';
import { ok, strictEqual } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import { isConstructor } from '../src/utils/reflection.js';
import { join } from 'node:path';

await describe('SemanticReleaseConfigDotnet', async () => {
  await it('is a class', () => {
    strictEqual(isConstructor(SemanticReleaseConfigDotnet), true);
  });
  await todo('Properties, Methods');
});

await describe('getConfig', async () => {
  await it('is a function', () => {
    strictEqual(typeof getConfig, 'function');
  });
  await it('does not throw when projectToPackAndPush contains at least one item', async () => {
    process.env.GITHUB_REPOSITORY_OWNER = 'HaloSPV3';
    process.env.SKIP_TOKEN = 'true';
    const DeterministicNupkgCsprojPath = join(import.meta.dirname, '../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj');
    // this test must pass two args here
    const actual = await getConfig([DeterministicNupkgCsprojPath], [DeterministicNupkgCsprojPath])
      .catch((v: unknown) => v instanceof Error ? v : new Error(String(v)));

    ok(
      !(actual instanceof Error),
      '`actual` should not be an Error.\n' + actual.stack,
    );
  });

  await it('throws Error when projectsToPublish is an empty array.', async () => {
    let actual = undefined;
    try {
      actual = await getConfig([]);
    }
    catch (error) {
      actual = error as Error;
    }

    ok(actual instanceof Error);
    ok(
      actual.message.includes(
        'projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path.',
      ),
    );
  });
});
