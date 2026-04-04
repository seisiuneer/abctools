@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
if errorlevel 1 (
    echo vcvarsall failed
    exit /b 1
)
echo vcvarsall OK
cd /d D:\projects\celtic-sounds-vst
"C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe" -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
echo CMAKE_EXIT=%ERRORLEVEL%
