import {
  deepStrictEqual,
  notDeepStrictEqual,
  strictEqual,
} from 'node:assert/strict';
import { existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { inspect } from 'node:util';
import { isNativeError } from 'node:util/types';
import {
  NugetRegistryInfo as NRI,
  NRIOptsBase,
  NRIOpts,
  getGithubOutput,
  getGithubOutputSync,
} from '../../src/dotnet/NugetRegistryInfo.js';
import { getEnvVarValue } from '../../src/utils/env.js';
import { isConstructor } from '../../src/utils/reflection.js';

await describe('NugetRegistryInfo', async () => {
  await it('is a class', () => {
    deepStrictEqual(isConstructor(NRI), true);
  });
});

await describe('InstanceOf NugetRegistryInfo', { concurrency: 1 }, async () => {
  const predefinedToken = getEnvVarValue('NUGET_TOKEN');
  const { DeterministicNupkgCsproj } = await import('./MSBuildProject.projects.js');

  await it('defaults source to expected value', () => {
    process.env['NUGET_TOKEN'] ??= predefinedToken ?? 'placeholder';

    strictEqual(
      NRIOpts.from({ project: DeterministicNupkgCsproj }).source,
      'https://api.nuget.org/v3/index.json',
    );

    if (predefinedToken) process.env['NUGET_TOKEN'] = predefinedToken;
    else delete process.env['NUGET_TOKEN'];
  });

  await it('canPushPackagesToSource rejects promise if token invalid', async () => {
    process.env['INVALID_TOKEN'] = 'placeholder';
    const value = await new NRI({
      project: DeterministicNupkgCsproj,
      tokenEnvVars: ['INVALID_TOKEN'],
    })
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      .canPushPackagesToSource
      .catch((error: unknown) =>
        isNativeError(error) ? error : new Error(JSON.stringify(error)),
      );
    if (value === true) {
      notDeepStrictEqual(value, true);
      return;
    }
    strictEqual('message' in value, true);
    strictEqual('name' in value, true);
  });

  await it('canPushPackagesToSource resolves when token is defined, valid, and can push packages to source', async (t) => {
    if (!predefinedToken) {
      t.skip('NUGET_TOKEN environment variable undefined');
      return;
    }

    const registryInfo = new NRI({
      project: DeterministicNupkgCsproj,
    });

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const canPush = await registryInfo.canPushPackagesToSource.catch(
      (error: unknown) => {
        if (!isNativeError(error))
          return new Error(inspect(error, { depth: 3 }));
        return error;
      },
    );

    if (Array.isArray(canPush))
      throw new Error('huh?');

    deepStrictEqual(canPush, true);
  });
});

await describe('NRIOptsBase', async () => {
  await it('has expected props', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.props, undefined, 2),
      `\
[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "source",
    "value": "string"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  }
]`,
    );
  });
  await it('has expected props (In)', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.in.props, undefined, 2),
      `\
[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "source",
    "value": "string"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  }
]`,
    );
  });
  await it('has expected props (Out)', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.out.props, undefined, 2),
      `\
[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "source",
    "value": "string"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  }
]`,
    );
  });
});

await describe('getGithubOutput', async () => {
  await it('returns empty object when GITHUB_OUTPUT is undefined', async () => {
    if (process.env['GITHUB_OUTPUT'] === undefined)
      deepStrictEqual(await getGithubOutput(), {});
  });

  await it('returns empty object when GITHUB_OUTPUT is undefined', () => {
    const ghOutputBak = process.env['GITHUB_OUTPUT'];
    process.env['GITHUB_OUTPUT'] = undefined;
    try {
      deepStrictEqual(getGithubOutputSync(), {});
    }
    finally {
      process.env['GITHUB_OUTPUT'] = ghOutputBak;
    }
  }).then(async () => {
    await it('returns non-empty object when GITHUB_OUTPUT defined and file exists', () => {
      const tmp_GITHUB_OUTPUT_FileName = path.join(tmpdir(), 'HCE.Shared', 'GITHUB_OUTPUT');
      if (!existsSync(tmp_GITHUB_OUTPUT_FileName))
        writeFileSync(tmp_GITHUB_OUTPUT_FileName, 'dotnet.NRI=true');
      process.env['GITHUB_OUTPUT'] = tmp_GITHUB_OUTPUT_FileName;

      const ghOutput = getGithubOutputSync();
      deepStrictEqual(ghOutput, { 'dotnet.NRI': 'true' });
    });
  });
});

await describe('getGithubOutputSync', async () => {
  await it('returns empty object when GITHUB_OUTPUT is undefined', () => {
    const ghOutputBak = process.env['GITHUB_OUTPUT'];
    process.env['GITHUB_OUTPUT'] = undefined;
    try {
      deepStrictEqual(getGithubOutputSync(), {});
    }
    finally {
      process.env['GITHUB_OUTPUT'] = ghOutputBak;
    }
  }).then(async () => {
    await it('returns non-empty object when GITHUB_OUTPUT defined and file exists', () => {
      const tmp_GITHUB_OUTPUT_FileName = path.join(tmpdir(), 'HCE.Shared', 'GITHUB_OUTPUT');
      if (!existsSync(tmp_GITHUB_OUTPUT_FileName))
        writeFileSync(tmp_GITHUB_OUTPUT_FileName, 'dotnet.NRI=true');
      process.env['GITHUB_OUTPUT'] = tmp_GITHUB_OUTPUT_FileName;

      const ghOutput = getGithubOutputSync();
      deepStrictEqual(ghOutput, { 'dotnet.NRI': 'true' });
    });
  });
});
