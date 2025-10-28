import {
  getConfig,
  SemanticReleaseConfigDotnet,
} from '../src/semanticReleaseConfigDotnet.js';
import { isError } from '../src/utils/isError.js';
import { ok, strictEqual } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import { isConstructor } from '../src/utils/reflection.js';
import { DeterministicNupkgCsproj } from './dotnet/MSBuildProject.projects.js';
import { NugetRegistryInfo } from '../src/dotnet/NugetRegistryInfo.js';

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
  await it('does not throw when projectToPackAndPush contains at least one item', { concurrency: false }, async () => {
    process.env['GITHUB_REPOSITORY_OWNER'] = 'HaloSPV3';
    process.env['SKIP_TOKEN'] = 'true';
    // this test must pass two args here
    const actual = await getConfig(
      [DeterministicNupkgCsproj],
      [new NugetRegistryInfo({ project: DeterministicNupkgCsproj })],
    ).catch((error: unknown) => isError(error) ? error : new Error(String(error)));

    ok(
      !isError(actual),
      '`actual` should not be an Error.\n' + ((actual as Error).stack ?? (actual as Error).message),
    );
  });

  await it('throws Error when projectsToPublish is an empty array.', async () => {
    let actual;
    try {
      actual = await getConfig([]);
    }
    catch (error) {
      actual = error as Error;
    }

    ok(isError(actual));
    ok(
      actual.message.includes(
        'projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path.',
      ),
    );
  });
});
