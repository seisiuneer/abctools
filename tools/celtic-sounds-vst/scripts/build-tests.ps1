# Setup MSVC environment and build only CelticSoundsTests
$vsPath = 'C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools'
$cmake  = "$vsPath\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
$projectDir = 'D:\projects\celtic-sounds-vst'

# Extract env vars from vcvarsall
$tempBat = [System.IO.Path]::GetTempFileName() + '.bat'
@"
@echo off
call "$vsPath\VC\Auxiliary\Build\vcvarsall.bat" x64 2>nul
set
"@ | Out-File -Encoding ASCII -FilePath $tempBat

$envLines = cmd /c $tempBat 2>$null
foreach ($line in $envLines) {
    if ($line -match '^([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}
Write-Host "MSVC environment loaded"

Set-Location $projectDir
Write-Host "Building CelticSoundsTests..."
& $cmake --build build --target CelticSoundsTests
$buildExit = $LASTEXITCODE
Write-Host "cmake build exit: $buildExit"
exit $buildExit
