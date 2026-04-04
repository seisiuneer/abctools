# Setup MSVC environment and run cmake configure + build
$vsPath = 'C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools'
$cmake  = "$vsPath\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"
$ninja  = "$vsPath\Common7\IDE\CommonExtensions\Microsoft\CMake\Ninja\ninja.exe"
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

# Configure
Set-Location $projectDir
if (Test-Path "$projectDir\build") { Remove-Item -Recurse -Force "$projectDir\build" }
Write-Host "Running cmake configure..."
& $cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release "-DCMAKE_MAKE_PROGRAM=$ninja"
$configExit = $LASTEXITCODE
Write-Host "cmake configure exit: $configExit"
if ($configExit -ne 0) { exit $configExit }

Write-Host "Running build (CelticSounds_Standalone)..."
& $cmake --build build --target CelticSounds_Standalone
$buildExit = $LASTEXITCODE
Write-Host "cmake build exit: $buildExit"
exit $buildExit
