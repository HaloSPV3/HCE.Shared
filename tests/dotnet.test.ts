import * as dotnet from "@halospv3/hce.shared-config/dotnet"; // see a ts(2307) here? It's probably safe to ignore!
import { ok } from "assert/strict";
import { describe } from "node:test";

// simple "symbol exists" checks only. More specific checks in each module's respective test file.

describe('dotnet re-export checks', () => {
    ok("createDummyNupkg" in dotnet.createDummyNupkg)

    ok("getGithubNugetRegistryPair" in dotnet.dotnetGHPR)
    ok("getNugetGitHubUrl" in dotnet.dotnetGHPR)
    ok("nugetGitHubUrlBase" in dotnet.dotnetGHPR)

    ok("GitLabTokenEnvVar" in dotnet.dotnetGLPR)
    ok("getGitlabNugetRegistryPair" in dotnet.dotnetGLPR)
    ok("nugetGitLabUrl" in dotnet.dotnetGLPR)
    ok("nugetGitLabUrlBase" in dotnet.dotnetGLPR)

    ok("configureDotnetNugetPush" in dotnet.dotnetHelpers)
    ok("configurePrepareCmd" in dotnet.dotnetHelpers)
    ok("nugetDefault" in dotnet.dotnetHelpers)

    ok("MSBuildProjectPreDefinedProperties" in dotnet.msbuildProject)
    ok("MSBuildEvaluatedProjects" in dotnet.msbuildProject)
    ok("MSBuildProject" in dotnet.msbuildProject)

    ok("MSBuildProjectProperties" in dotnet.msbuildProjectProperties)
});