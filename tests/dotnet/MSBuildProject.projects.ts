import { resolve } from 'path'
import { MSBuildProject as MSBP } from '@halospv3/hce.shared-config/dotnet/MSBuildProject'

export const {
  DeterministicNupkgCsproj,
  SignAfterPackCsproj,
} = await MSBP.PackableProjectsToMSBuildProjects([
  resolve(import.meta.dirname, '../../dotnet/samples/HCE.Shared.DeterministicNupkg/HCE.Shared.DeterministicNupkg.csproj'),
  resolve(import.meta.dirname, '../../dotnet/samples/HCE.Shared.SignAfterPack/HCE.Shared.SignAfterPack.csproj'),
]).then((v: MSBP[]) => Object.freeze({
  DeterministicNupkgCsproj: Object.freeze(v[0]),
  SignAfterPackCsproj: Object.freeze(v[1]),
}))
