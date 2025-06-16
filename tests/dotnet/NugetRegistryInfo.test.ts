import { getEnvVarValue } from '../../src/utils/env.js';
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
import {
  NugetRegistryInfo as NRI,
  NugetRegistryInfoOptionsBase as NRIOptsBase,
  getGithubOutput,
  getGithubOutputSync,
} from '../../src/dotnet/NugetRegistryInfo.js';
import { isConstructor } from '../../src/utils/reflection.js';
import { isNativeError } from 'node:util/types';

await describe('NugetRegistryInfo', async (ctx0) => {
  await it('is a class', () => {
    deepStrictEqual(isConstructor(NRI), true);
  });

  await it('has expected name', () => {
    deepStrictEqual(NRI.name, ctx0.name);
  });

  await describe('canPushPackagesToUrl', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', () => {
      strictEqual(ctx1.name in NRI.prototype, true);
    });

    await it('returns Promise<true>', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const x = await (Promise.resolve(true) as typeof NRI.prototype['canPushPackagesToUrl']);
      strictEqual(x, true);
    });
  });

  await describe('resolvedEnvVariable', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', () => {
      strictEqual(ctx1.name in NRI.prototype, true);
    });
    await todo('is a string');
  });

  await describe('url', async (ctx1) => {
    await it('exists in NugetRegistryInfo prototype', () => {
      strictEqual(ctx1.name in NRI.prototype, true);
    });
    await todo('is a string');
  });
});

// memory leak...but why?
await describe('InstanceOf NugetRegistryInfo', { concurrency: 1 }, async () => {
  const predefinedToken = getEnvVarValue('NUGET_TOKEN');
  const { DeterministicNupkgCsproj } = await import(
    './MSBuildProject.projects.js',
  );

  await it('defaults url to expected value', () => {
    process.env['NUGET_TOKEN'] ??= predefinedToken ?? 'placeholder';

    strictEqual(
      new NRI({ project: DeterministicNupkgCsproj }).url,
      'https://api.nuget.org/v3/index.json',
    );

    if (predefinedToken) process.env['NUGET_TOKEN'] = predefinedToken;
    else delete process.env['NUGET_TOKEN'];
  });

  await it('canPushPackagesToUrl', async () => {
    await it('rejects promise if token invalid', async () => {
      process.env['INVALID_TOKEN'] = 'placeholder';
      const value = await new NRI({
        project: DeterministicNupkgCsproj,
        tokenEnvVars: ['INVALID_TOKEN'],
      })
      // @ts-expect-error Is deprecated
      // eslint-disable-next-line @typescript-eslint/no-deprecated
        .canPushPackagesToUrl
        .catch((reason: unknown) =>
          isNativeError(reason) ? reason : new Error(String(reason)),
        );
      if (value === true) {
        notDeepStrictEqual(value, true);
        return;
      }
      strictEqual('message' in value, true);
      strictEqual('name' in value, true);
    });

    await it('resolves when token is defined, valid, and can push packages to url', async (t) => {
      if (!predefinedToken) {
        t.skip('NUGET_TOKEN environment variable undefined');
        return;
      }

      const registryInfo = new NRI(({
        project: DeterministicNupkgCsproj,
      }));

      // todo: refactor canPushPackagesToUrl away from static dummy
      // @ts-expect-error Is deprecated
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const canPush = await registryInfo.canPushPackagesToUrl.catch(
        (error: unknown) => {
          if (!isNativeError(error))
            return new Error(inspect(error, { depth: 3 }));
          else if ('stderr' in error && typeof error.stderr === 'string') {
            // eslint-disable-next-line unicorn/prefer-spread
            error.message = error.message.concat(
              '\nSTDERR:\n',
              `  ${error.stderr.replaceAll('\n', '\n  ')}`,
              error.stack ?? '',
            );
          }

          return error;
        },
      );

      deepStrictEqual(canPush, true);
    });
  });
});

await describe('NRIOptsBase', async () => {
  await it('has expected props', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.props, undefined, 2),
      `[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  },
  {
    "key": "url",
    "value": "string"
  }
]`,
    );
  });
  await it('has expected props (In)', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.in.props, undefined, 2),
      `[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  },
  {
    "key": "url",
    "value": "string"
  }
]`,
    );
  });
  await it('has expected props (Out)', () => {
    strictEqual(
      JSON.stringify(NRIOptsBase.out.props, undefined, 2),
      `[
  {
    "key": "project",
    "value": "$ark.MSBuildProject"
  },
  {
    "key": "tokenEnvVars",
    "value": {
      "sequence": "string",
      "proto": "Array"
    }
  },
  {
    "key": "url",
    "value": "string"
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
