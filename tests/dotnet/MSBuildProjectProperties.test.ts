import { ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { tmpNameSync } from 'tmp';
import { MSBuildProjectProperties as MPP } from '../../src/dotnet/MSBuildProjectProperties.js';
import { CaseInsensitiveMap } from './../../src/CaseInsensitiveMap.js';

await describe('MSBuildProjectProperties', async (c0) => {
  const emptyMap = new CaseInsensitiveMap<string, string>();
  const emptySample = new MPP('', emptyMap);
  await it('throws if path does not exist', async () => {
    // does not create file
    const tmpName = tmpNameSync();
    let ctorHadThrown: boolean;
    try {
      new MPP(tmpName, emptyMap);
      ctorHadThrown = false;
    }
    catch {
      ctorHadThrown = true;
      // good!
    }

    if (!ctorHadThrown)
      throw new Error(
        `MSBuildProjectProperties saw ${tmpName} and thought it existed when it shouldn't!`,
      );
  });
  await it('does not throw if given path is empty string (defaults to CWD)', () => {
    strictEqual(emptySample.MSBuildProjectFullPath, process.cwd());
  });
  await it('has expected name', () => {
    strictEqual(MPP.name, c0.name);
  });
  await it('has prototype', () => {
    ok('prototype' in MPP);
  });
  await describe('AssemblyName', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.AssemblyName, 'string');
    });
  });
  await describe('Description', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.Description, 'string');
    });
  });
  await describe('MSBuildProjectFullPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.MSBuildProjectFullPath, 'string');
    });
  });
  await describe('OutputPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.OutputPath, 'string');
    });
  });
  await describe('RuntimeIdentifier', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.RuntimeIdentifier, 'string');
    });
  });
  await describe('RuntimeIdentifiers', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.RuntimeIdentifiers, 'string');
    });
  });
  await describe('TargetFramework', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.TargetFramework, 'string');
    });
  });
  await describe('TargetFrameworks', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.TargetFrameworks, 'string');
    });
  });
  await describe('Version', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.Version, 'string');
    });
  });
  await describe('VersionPrefix', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.VersionPrefix, 'string');
    });
  });
  await describe('VersionSuffix', async () => {
    await it('is a string', () => {
      strictEqual(typeof emptySample.VersionSuffix, 'string');
    });
  });
});
