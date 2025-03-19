import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CaseInsensitiveMap } from '../../src/CaseInsensitiveMap.js';
import { NugetProjectProperties as NPP } from '../../src/dotnet/NugetProjectProperties.js';

await it('is built', async () => {
  deepStrictEqual(
    JSON.stringify(
      Object.entries(
        await import(
          '@halospv3/hce.shared-config/dotnet/NugetProjectProperties',
        ),
      ),
      undefined,
      2,
    ),
    JSON.stringify(
      Object.entries(
        await import('../../src/dotnet/NugetProjectProperties.js'),
      ),
      undefined,
      2,
    ),
  );
});

await describe('NugetProjectProperties', async (c0) => {
  await it('has expected name', () => {
    strictEqual(NPP.name, c0.name);
  });
  await it('exists', () => {
    ok(NPP);
  });
  await it('has prototype', () => {
    ok('prototype' in NPP);
  });

  const emptyMap = new CaseInsensitiveMap<string, string>();
  const npp = new NPP('', emptyMap);

  await describe('AssemblyName', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.AssemblyName, 'string');
    });
  });
  await describe('Authors', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.Authors, 'string');
    });
  });
  await describe('BuildOutputTargetFolder', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.BuildOutputTargetFolder, 'string');
    });
  });
  await describe('Company', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.Company, 'string');
    });
  });
  await describe('ContentTargetFolders', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.ContentTargetFolders, 'string');
    });
  });
  await describe('Description', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.Description, 'string');
    });
  });
  await describe('DevelopmentDependency', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.DevelopmentDependency, 'string');
    });
  });
  await describe('IncludeBuildOutput', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.IncludeBuildOutput, 'string');
    });
  });
  await describe('IncludeContentInPack', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.IncludeContentInPack, 'string');
    });
  });
  await describe('IncludeSource', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.IncludeSource, 'string');
    });
  });
  await describe('IncludeSymbols', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.IncludeSymbols, 'string');
    });
  });
  await describe('IsPackable', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.IsPackable, 'string');
    });
  });
  await describe('IsTool', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.IsTool, 'string');
    });
  });
  await describe('MSBuildProjectFullPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.MSBuildProjectFullPath, 'string');
    });
  });
  await describe('MinClientVersion', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.MinClientVersion, 'string');
    });
  });
  await describe('NoPackageAnalysis', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.NoPackageAnalysis, 'string');
    });
  });
  await describe('NuspecBasePath', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.NuspecBasePath, 'string');
    });
  });
  await describe('NuspecFile', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.NuspecFile, 'string');
    });
  });
  await describe('NuspecProperties', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.NuspecProperties, 'string');
    });
  });
  await describe('OutputPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.OutputPath, 'string');
    });
  });
  await describe('PackageDescription', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageDescription, 'string');
    });
  });
  await describe('PackageIcon', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageIcon, 'string');
    });
  });
  await describe('PackageId', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageId, 'string');
    });
  });
  await describe('PackageLicenseExpression', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageLicenseExpression, 'string');
    });
  });
  await describe('PackageLicenseFile', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageLicenseFile, 'string');
    });
  });
  await describe('PackageOutputPath', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageOutputPath, 'string');
    });
  });
  await describe('PackageProjectUrl', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageProjectUrl, 'string');
    });
  });
  await describe('PackageReadmeFile', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageReadmeFile, 'string');
    });
  });
  await describe('PackageReleaseNotes', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageReleaseNotes, 'string');
    });
  });
  await describe('PackageRequireLicenseAcceptance', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageRequireLicenseAcceptance, 'string');
    });
  });
  await describe('PackageTags', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageTags, 'string');
    });
  });
  await describe('PackageType', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageType, 'string');
    });
  });
  await describe('PackageVersion', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.PackageVersion, 'string');
    });
  });
  await describe('Product', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.Product, 'string');
    });
  });
  await describe('RepositoryCommit', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.RepositoryCommit, 'string');
    });
  });
  await describe('RepositoryType', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.RepositoryType, 'string');
    });
  });
  await describe('RepositoryUrl', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.RepositoryUrl, 'string');
    });
  });
  await describe('RuntimeIdentifier', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.RuntimeIdentifier, 'string');
    });
  });
  await describe('RuntimeIdentifiers', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.RuntimeIdentifiers, 'string');
    });
  });
  await describe('SuppressDependenciesWhenPacking', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.SuppressDependenciesWhenPacking, 'string');
    });
  });
  await describe('SymbolPackageFormat', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.SymbolPackageFormat, 'string');
    });
  });
  await describe('TargetFramework', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.TargetFramework, 'string');
    });
  });
  await describe('TargetFrameworks', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.TargetFrameworks, 'string');
    });
  });
  await describe('Title', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.Title, 'string');
    });
  });
  await describe('Version', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.Version, 'string');
    });
  });
  await describe('VersionPrefix', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.VersionPrefix, 'string');
    });
  });
  await describe('VersionSuffix', async () => {
    await it('is a string', () => {
      strictEqual(typeof npp.VersionSuffix, 'string');
    });
  });
});
