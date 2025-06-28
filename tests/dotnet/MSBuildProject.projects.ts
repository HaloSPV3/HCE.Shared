import path from 'node:path';
import { MSBuildProject as MSBP } from '../../src/dotnet/MSBuildProject.js';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';

const cacheDir = path.join(import.meta.dirname, '.projCache');
if (!existsSync(cacheDir))
  mkdirSync(cacheDir);

const paths: Record<'DN' | 'SAP', { proj: string; json: string }> = {
  DN: {
    proj: path.resolve(
      import.meta.dirname,
      '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj',
    ),
    json: path.join(cacheDir, 'dn.json'),
  },
  SAP: {
    proj: path.resolve(
      import.meta.dirname,
      '../../dotnet/samples/HCE.Shared.SignAfterPack/HCE.Shared.SignAfterPack.csproj',
    ),
    json: path.join(cacheDir, 'sap.json'),
  },
};

/** for each project, rewrite its JSON-ified MSBuildProject if the JSON file does not exist. */
for (const projName in paths) {
  const projPaths = paths[projName as keyof typeof paths];

  if (existsSync(projPaths.json))
    continue;

  const jsonContentArray = await MSBP.PackableProjectsToMSBuildProjects([projPaths.proj])
    .then(async promiseArray =>
      await Promise.all(promiseArray.map(async proj => JSON.stringify(await proj))),
    );

  const firstJson = jsonContentArray[0];
  if (firstJson === undefined)
    throw new Error('The first item in the jsonContentArray was undefined');

  writeFileSync(projPaths.json, firstJson, { encoding: 'utf16le' });
}

const projects = {
  DN: MSBP.fromJSON(await readFile(paths.DN.json, 'utf16le')),
  SAP: MSBP.fromJSON(await readFile(paths.SAP.json, 'utf16le')),
};

export const DeterministicNupkgCsproj: Readonly<MSBP> = Object.freeze(projects.DN);
export const SignAfterPackCsproj: Readonly<MSBP> = Object.freeze(projects.SAP);
