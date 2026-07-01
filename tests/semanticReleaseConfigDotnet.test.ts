import {
  getConfig,
  SemanticReleaseConfigDotnet,
} from '../src/semanticReleaseConfigDotnet.ts';
import { isError } from '../src/utils/isError.ts';
import { ok, strictEqual } from 'node:assert/strict';
import { describe, it, todo } from 'node:test';
import { isConstructor } from '../src/utils/reflection.ts';
import { DeterministicNupkgCsproj } from './dotnet/MSBuildProject.projects.ts';
import { NugetRegistryInfo } from '../src/dotnet/NugetRegistryInfo.ts';
import * as process from 'node:process';

await describe('SemanticReleaseConfigDotnet', async () => {
  await it('is a class', () => {
    strictEqual(isConstructor(SemanticReleaseConfigDotnet), true);
  });
  await todo('Properties, Methods');
});

await describe('getConfig', async () => {
  await it('does not throw when projectToPackAndPush contains at least one item', { concurrency: false, timeout: 30_000 }, async () => {
    process.env['GITHUB_REPOSITORY_OWNER'] = 'HaloSPV3';
    process.env['SKIP_TOKEN'] = 'true';
    // this test must pass two args here
    let actual;
    try {
      actual = await getConfig(
        [DeterministicNupkgCsproj],
        [new NugetRegistryInfo({ project: DeterministicNupkgCsproj })],
      );
    }
    catch (error: unknown) {
      actual = isError(error) ? error : new Error(String(error));
    }

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

    const searchString = 'projectsToPublish.length must be > 0 or PROJECTS_TO_PUBLISH must be defined and contain at least one path.';

    if ('errors' in actual && Array.isArray(actual.errors)) {
      ok(actual.errors.some(error =>
        Error.isError(error) && error.message.includes(searchString),
      ));
    }
    else {
      ok(actual.message.includes(searchString));
    }
  });
});
