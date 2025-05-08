/**
 * @example
 * OwnKeyOf<NPP, MSBPP> === "IsPackable" | "SuppressDependenciesWhenPacking" | "PackageVersion" | "PackageId" | "PackageDescription" | "Authors" | "Copyright" | "PackageRequireLicenseAcceptance" | "DevelopmentDependency" | "PackageLicenseExpression" | "PackageLicenseFile" | "PackageProjectUrl" | "PackageIcon" | "PackageReleaseNotes" | "PackageReadmeFile" | "PackageTags" | "PackageOutputPath" | "IncludeSymbols" | "IncludeSource" | "PackageType" | "IsTool" | "RepositoryUrl" | "RepositoryType" | "RepositoryCommit" | "SymbolPackageFormat" | "NoPackageAnalysis" | "MinClientVersion" | "IncludeBuildOutput" | "IncludeContentInPack" | "BuildOutputTargetFolder" | "ContentTargetFolders" | "NuspecFile" | "NuspecBasePath" | "NuspecProperties" | "Title" | "Company" | "Product"
 * OwnKeyOf<typeof NPP, typeof MSBPP> === never ; // class NPP does not have non-inherited static members
 * OwnKeyOf<typeof NPP, null> === "prototype" | "GetFullPath"
 */
export type OwnKeyOf<T, __proto__ extends object | null> =
  Exclude<
    __proto__ extends null
      ? keyof T
      : Exclude<
        keyof T,
        keyof __proto__
      >,
    '__proto__'
  >;
