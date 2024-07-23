@CD 	    /d "%~dp0"
@ECHO 	    OFF
TITLE       ntfy-desktop : Build
SETLOCAL    ENABLEDELAYEDEXPANSION
MODE        con:cols=125 lines=120
MODE        125,40
GOTO        comment_end
-----------------------------------------------------------------------------------------------------
    ntfy-desktop build script for:
        - windows
        - linux
        - macos
-----------------------------------------------------------------------------------------------------
:comment_end

ECHO.

:: -----------------------------------------------------------------------------------------------------
::
::  Powershell zip compression
::  Compress-Archive -Path "ntfy-electron-win32-x64" -DestinationPath "build/ntfy-electron-windows-x64.zip"
::
::  Windows tar.exe Compression
::  tar.exe does not support .zip compression. File must be .tar.gz
::
::  -r      Recursive
::  -q      Quiet mode
::  -9      compression ratio
::
::  TAR -cf archive-file.tar.gz [filenames...]
::  TAR -cf "build/ntfy-electron-windows-x64.tar.gz" "ntfy-electron-win32-x64"
:: -----------------------------------------------------------------------------------------------------

:: -----------------------------------------------------------------------------------------------------
::  define:     directories
:: -----------------------------------------------------------------------------------------------------

set dir_home=%~dp0
set dir_build=build
set dir_dist=dist

:: -----------------------------------------------------------------------------------------------------
::  define:     misc
:: -----------------------------------------------------------------------------------------------------

set "bDeleteBuild=false"
set "Copyright=Copyright (c) 2024"
set "FileDescription=ntfy desktop client with Electron wrapper"
set "ProductName=ntfy desktop"
set "OriginalFilename=ntfy-desktop.exe"
set "CompanyName=https://github.com/xdpirate/ntfy-electron"
set "IgnorePattern=(^^/!dir_dist!|^^/!dir_build!|^^/.github*|/test-*|/tests*|^^/playwright*|.all-contributorsrc|.editorconfig|.eslintrc|^^/.git*|^^.git*|.npm*|.prettier*|CONTRIBUTING.md|CODE_OF_CONDUCT.md|README|README.md|readme.md|LICENSE|license|LICENSE.md|CHANGELOG|CHANGELOG.md)"

:: -----------------------------------------------------------------------------------------------------
::  Create build directory
::
::  /build              contains built electron package
::  /dist               contains zip archive
:: -----------------------------------------------------------------------------------------------------

IF exist !dir_build! (
    rm -r !dir_build!/*
    echo Folder !dir_build! already exists
) ELSE (
    md !dir_build! && echo Folder !dir_build! created
)

IF exist !dir_dist! (
    rm -r !dir_dist!/*
    echo Folder !dir_dist! already exists
) ELSE (
    md !dir_dist! && echo Folder !dir_dist! created
)

:: -----------------------------------------------------------------------------------------------------
::  define:     platforms
:: -----------------------------------------------------------------------------------------------------

set platformWin=x64
set platformLinux=x64 arm64 armv7l
set platformMac=x64 arm64

:: -----------------------------------------------------------------------------------------------------
::  Build > Windows
:: -----------------------------------------------------------------------------------------------------

for %%a in (%platformWin%) do (
    echo.
    echo -------------------------------------------------------------------------
    echo Building Windows-%%a
    echo Setting Ignore Pattern: !IgnorePattern!
    CALL electron-packager . ntfy-electron --platform="win32" --arch="%%a" --icon="ntfy.ico" --overwrite --ignore=\"!IgnorePattern!\" --out=!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"
    powershell Compress-Archive -Path "!dir_build!/ntfy-electron-win32-%%a" -DestinationPath "!dir_dist!/ntfy-electron-windows-%%a.zip"

    if "!bDeleteBuild!" == "true" (
        rm -rf "!dir_build!/ntfy-electron-win32-%%a"
    )
    echo -------------------------------------------------------------------------
    echo.
)

goto :END

:: -----------------------------------------------------------------------------------------------------
::  end
:: -----------------------------------------------------------------------------------------------------

:END
    echo.
    echo Build Complete
    timeout /t 5 /nobreak >nul
    echo.
Exit /B 0
