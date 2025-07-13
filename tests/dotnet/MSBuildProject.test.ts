import { deepStrictEqual } from 'node:assert/strict';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';
import {
  EvaluationOptions,
  MSBuildProject as MSBP,
} from '../../src/dotnet/MSBuildProject.js';

await describe('MSBuildProject', { concurrency: true }, async () => {
  await describe('MatrixProperties', async () => {
    await it('is array of expected values', () => {
      deepStrictEqual(MSBP.MatrixProperties, [
        'TargetFramework',
        'TargetFrameworks',
        'RuntimeIdentifier',
        'RuntimeIdentifiers',
      ]);
    });
  });
  await describe('Evaluate', async () => {
    await it('may return expected object (HCE.Shared.DeterministicNupkg)', { concurrency: 1 }, async () => {
      const deterministicNupkgProj = path.resolve(
        import.meta.dirname,
        '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj',
      );
      const pakDir = path.resolve(path.dirname(deterministicNupkgProj), 'packages');
      if (
        existsSync(pakDir)
        && readdirSync(pakDir).some(
          v => v.endsWith('.nupkg') || v.endsWith('.snupkg'),
        )
      ) {
        rmSync(pakDir, { recursive: true, force: true });
      }
      const evalOpts: typeof EvaluationOptions.inferOut = EvaluationOptions.from({
        FullName: deterministicNupkgProj,
        GetItem: [],
        GetProperty: [...MSBP.MatrixProperties],
        GetTargetResult: [],
        Property: { BaseIntermediateOutputPath: `obj/test_Evaluate/` },
        Targets: ['Restore', 'Pack'],
      });
      const actual: MSBP = await MSBP.Evaluate(evalOpts);
      // lets not bother testing targets for now. It depends on both the project and the SDK.
      const actual_targets = await MSBP.GetTargets(evalOpts.FullName);
      const expected = new MSBP({
        fullPath: deterministicNupkgProj,
        projTargets: actual_targets,
        evaluation: {
          Items: {},
          Properties: {
            TargetFramework: 'netstandard2.0',
            TargetFrameworks: '',
            RuntimeIdentifier: '',
            RuntimeIdentifiers: '',
          },
        },
      });

      deepStrictEqual(actual.Items, expected.Items);
      deepStrictEqual(actual.Properties, expected.Properties);
      deepStrictEqual(actual.Targets, expected.Targets);
      deepStrictEqual(actual, expected);
    });
  });
});
