param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot "dist")
)

$ErrorActionPreference = "Stop"
$projectRoot = $PSScriptRoot
$buildRoot = Join-Path $projectRoot "patcher-build"
$translationScript = Join-Path $projectRoot "interface-language.js"
$patcherScript = Join-Path $projectRoot "patch_abctools.py"

if (-not (Test-Path $translationScript)) {
    throw "Required resource not found: $translationScript"
}
if (-not (Test-Path $patcherScript)) {
    throw "Required patcher not found: $patcherScript"
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $buildRoot | Out-Null

$translationData = "$translationScript;."
$variants = @(
    @{ Name = "ABCToolsPatch"; Work = (Join-Path $buildRoot "ai") },
    @{ Name = "ABCToolsPatchOffline"; Work = (Join-Path $buildRoot "offline") }
)

foreach ($variant in $variants) {
    $arguments = @(
        "-m", "PyInstaller",
        "--noconfirm",
        "--clean",
        "--onefile",
        "--name", $variant.Name,
        "--add-data", $translationData,
        "--distpath", $OutputDirectory,
        "--workpath", $variant.Work,
        "--specpath", $variant.Work,
        $patcherScript
    )
    & python @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "PyInstaller failed while building $($variant.Name) (exit code $LASTEXITCODE)."
    }
}

Write-Host "Created:"
Write-Host "  $(Join-Path $OutputDirectory 'ABCToolsPatch.exe') (optional local AI)"
Write-Host "  $(Join-Path $OutputDirectory 'ABCToolsPatchOffline.exe') (offline only)"
