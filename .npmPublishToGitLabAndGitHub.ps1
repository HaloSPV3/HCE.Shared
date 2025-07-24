# todo: consider converting to a TS module to run with TSX

# if argument is not [TYPE], the value is coerced; If coercion is impossible (e.g. string => number), throws.
[CmdletBinding()]
param (
  [Parameter(Mandatory = $true, HelpMessage = '## [Required]
## Examples
-Version 3.0.0-develop.7')]
  [System.Management.Automation.SemanticVersion]$Version,

  [Parameter(Mandatory = $true, HelpMessage = '## [Required]
The GitLab Project ID. See

## Examples
-GLProjectId 70884695
-GLProjectId "70884695" # is coerced to [int]70884695')]
  [int]$GLProjectId,

  [Parameter(Mandatory = $true, HelpMessage = '## [Required]
The NPM release channel. Try the ${nextRelease.channel} Semantic Release lodash variable available during/after `verifyRelease`.

## Examples
-ReleaseChannel "latest"
-ReleaseChannel "develop"
-ReleaseChannel "3.x"')]
  [string]$ReleaseChannel,

  [Parameter(Mandatory = $false, HelpMessage = '## [Optional]
If undefined, the following Environment variables are evaluated in this order:
- NPM_GH_TOKEN
- GH_TOKEN
- GITHUB_TOKEN

Throws [ArgumentNullException] if all are $null or whitespace.')]
  [string]$GHToken,

  [Parameter(Mandatory = $false, HelpMessage = '## [Optional]
If undefined, the following Environment variables are evaluated in this order:
- NPM_GL_TOKEN
- GL_TOKEN
- GITLAB_TOKEN
- CI_JOB_TOKEN

Throws [ArgumentNullException] if all are $null or whitespace.')]
  [string]$GLToken,
  [switch]$DryRun
)

if ([string]::IsNullOrWhiteSpace((
      $GHToken ??= (
        $env:NPM_GH_TOKEN ??
        $env:GH_TOKEN ??
        $env:GITHUB_TOKEN
      )
    )
  )
) {
  throw [System.ArgumentNullException]::new('Parameter -GHToken and its fallback environment variables were all $null or whitespace!');
}
if ([string]::IsNullOrWhiteSpace((
      $GLToken ??= (
        $env:NPM_GL_TOKEN ??
        $env:GL_TOKEN ??
        $env:GITLAB_TOKEN ??
        $env:CI_JOB_TOKEN
      )
    )
  )
) {
  throw [System.ArgumentNullException]::new('Parameter -GLToken and its fallback environment variables were all $null or whitespace!')
}

[string]$ghRegistry = '//npm.pkg.github.com'
[string]$glRegistry = "//gitlab.com/api/v4/projects/$GLProjectId/packages/npm/"

[string]$ghAuth = "$($ghRegistry):_authToken=$GHToken"
[string]$glAuth = "$($glRegistry):_authToken=$GLToken"
[string]$npmrcContent = Get-Content ./.npmrc -Raw;

foreach ($authLine in ($ghAuth, $glAuth)) {
  if (-not $npmrcContent.Contains("$authLine")) {
    $authLine | Out-File -File ./.npmrc -Encoding utf8 -Append
  }
}

$provenance = if ($env:CI -ieq 'true') { '--provenance' }
foreach ($registry in ($ghRegistry, $glRegistry)) {
  npm publish --dry-run --tag=$ReleaseChannel --registry=https:$registry $provenance | Write-Error

  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

}

if (-not $DryRun) {
  # `--registry=URI` works, but is undocumented. This parameter may break at any time.
  foreach ($registry in ($ghRegistry, $glRegistry)) {
    npm publish --tag=$ReleaseChannel --registry=https:$registry $provenance | Write-Error

    if ($LASTEXITCODE -ne 0) {
      return $LASTEXITCODE
    }
  }
}

# Semantic Release ignores arrays. This will have no effect until semantic release allows `publish` steps to return `Release[]`. See https://github.com/semantic-release/semantic-release/blob/master/index.d.ts#L344-L387
(
  [PSCustomObject]@{
    name = "@halospv3/hce.shared-config@$Version"
    url  = 'https://github.com/HaloSPV3/HCE.Shared/pkgs/npm/hce.shared-config'
  },
  [PSCustomObject]@{
    name = "@halospv3/hce.shared-config@$Version"
    url  = 'https://gitlab.com/halospv3/HCE.Shared/-/packages/42912953'
  }
) |
ConvertTo-Json |
Write-Output
