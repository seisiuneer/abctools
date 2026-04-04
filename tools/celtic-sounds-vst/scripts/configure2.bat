@echo off
call "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64 > D:\projects\celtic-sounds-vst\scripts\configure.log 2>&1
echo vcvarsall exit: %ERRORLEVEL% >> D:\projects\celtic-sounds-vst\scripts\configure.log
cd /d D:\projects\celtic-sounds-vst
"C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe" -B build -G Ninja -DCMAKE_BUILD_TYPE=Release >> D:\projects\celtic-sounds-vst\scripts\configure.log 2>&1
echo cmake exit: %ERRORLEVEL% >> D:\projects\celtic-sounds-vst\scripts\configure.log
