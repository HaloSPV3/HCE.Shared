import { resolve } from 'path';
import { MSBuildProject as MSBP } from '../../src/dotnet/MSBuildProject.js';

// Binding elements can't be exported directly with --isolatedDeclarations. ts(9019)
const projects = await MSBP.PackableProjectsToMSBuildProjects([
  resolve(
    import.meta.dirname,
    '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj',
  ),
  resolve(
    import.meta.dirname,
    '../../dotnet/samples/HCE.Shared.SignAfterPack/HCE.Shared.SignAfterPack.csproj',
  ),
]).then((v: MSBP[]) => Object.freeze({
  DeterministicNupkgCsproj: Object.freeze(v.find(v => v.Properties.AssemblyName === 'HCE.Shared.DeterministicNupkg')
    ?? (() => { throw new Error('Unable to find/load HCE.Shared.DeterministicNupkg.csproj'); })(),
  ),
  SignAfterPackCsproj: Object.freeze(v.find(v => v.Properties.AssemblyName === 'HCE.Shared.SignAfterPack')
    ?? (() => { throw new Error('Unable to find/load HCE.Shared.SignAfterPack.csproj'); })(),
  ),
}),
);
export const DeterministicNupkgCsproj: Readonly<MSBP> = projects.DeterministicNupkgCsproj;
export const SignAfterPackCsproj: Readonly<MSBP> = projects.SignAfterPackCsproj;
