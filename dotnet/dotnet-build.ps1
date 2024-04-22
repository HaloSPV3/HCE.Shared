# input: SLN_OR_PROJ_FILES
# Comma-separated. May be relative or absolute.

[System.IO.FileInfo[]]$solutions += ($env:SLN_OR_PROJ_FILES -split ';' | ForEach-Object { if ($_.Length -gt 0) { Get-Item $_ } });
if ($args.Count -gt 0) {
    $args | ForEach-Object {
        $solutions += ($_ -split ';' | ForEach-Object { Get-Item $_ })
    }
}

$excludedDirs = '.git', 'bin', 'node_modules', 'obj', 'publish';
$slnExts = '.sln', '.slnf', '.slnx';

function RecursivelySearchForSolutions {
    $result;

    # get solutions (*.sln, *.slnf, *.slnx, etc) -in $rootItems
    $solutions += (Get-ChildItem -File |
        Where-Object { $_.Extension.ToLowerInvariant() -in $slnExts } |
        Sort-Object |
        Get-Unique
    );

    # also check in sub-directories
    $subdirs = Get-ChildItem -Path $rootDir -Directory;
    for ($i = 0; $i -lt $subdirs.Count; $i++) {
        if (-not ($subdirs[$i].Name -in $excludedDirs)) {
            $subdirs += (
                Get-ChildItem -Path $curDir -Directory |
                Where-Object { -not ($_.Name -in $excludedDirs) }
            );
        }
    }
    $solutions += (
        $subdirs |
        ForEach-Object {
            Get-ChildItem -Path $_ -File |
            Where-Object {
                $_.Extension.ToLowerInvariant() -in $slnExts
            }
        }
    );
}

# search for solutions files
if ($solutions.Count -eq 0) {
    RecursivelySearchForSolutions
}

# search for project files
if ($solutions.Count -eq 0 ) {
    $slnExts += ('.csproj', '.fsproj', '.proj');
    RecursivelySearchForSolutions
}

if ($solutions.Count -eq 0) {
    throw [System.IO.FileNotFoundException]::new('No Solution files (.sln, .slnf, .slnx) or Project files (.csproj, .fsproj, .proj) could be found!')
}

# solutions/projects are build sequentially. Debug is built, then Release is build.
$solutions | ForEach-Object {
    ($_, 'Debug'), ($_, 'Release') |
    ForEach-Object {
        Set-Location $_[0].Directory
        dotnet build ($_[0].FullName) --configuration $_[1]
    }
}