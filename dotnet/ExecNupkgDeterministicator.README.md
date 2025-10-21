<h1 align="center">ExecNupkgDeterministicator.target</h1>

This target runs after "Pack" and utilizes `kuinox.nupkgdeterministicator` to make the nupkg (and snupkg!) deterministic. However, this target does not include `kuinox.nupkgdeterministicator`. As such, an Error task will be executed if the dotnet tool `kuinox.nupkgdeterministicator` is not installed locally nor globally. Cake and NUKE are not supported by this MSBuild Target.

Learn more about Kuinox's NupkgDeterministicator\
[GitHub](https://github.com/Kuinox/NupkgDeterministicator) | [Nuget](https://www.nuget.org/packages/Kuinox.NupkgDeterministicator)

## Install `kuinox.nupkgdeterministicator`

### .NET CLI (Global)

```sh
dotnet tool install -g NupkgDeterministicator
```

### .NET CLI (Local)

```sh
dotnet tool install -g NupkgDeterministicator
```
