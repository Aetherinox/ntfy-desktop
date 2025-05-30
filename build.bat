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

:: #
::  Powershell zip compression
::  Compress-Archive -Path "ntfy-desktop-win32-x64" -DestinationPath "build/ntfy-desktop-windows-x64.zip"
::
::  Windows tar.exe Compression
::  tar.exe does not support .zip compression. File must be .tar.gz
::
::  -r      Recursive
::  -q      Quiet mode
::  -9      compression ratio
::
::  TAR -cf archive-file.tar.gz [filenames...]
::  TAR -cf "build/ntfy-desktop-windows-x64.tar.gz" "ntfy-desktop-win32-x64"
:: #

:: #
::  define:     directories
:: #

set dir_home=%~dp0
set dir_build=build
set dir_dist=dist

:: #
::  define:     misc
:: #

set "bDeleteBuild=false"
set "Copyright=Copyright (c) 2025"
set "FileDescription=Ntfy.sh desktop client for Windows, Linux, and MacOS with push notifications. Supports official ntfy.sh website and self-hosted instances."
set "ProductName=Ntfy Desktop"
set "OriginalFilename=ntfy-desktop.exe"
set "CompanyName=https://github.com/aetherinox/ntfy-desktop"
set "IgnorePattern=(^^/!dir_dist!|^^/!dir_build!|^^/.github*|/test-*|/tests*|^^/playwright*|.all-contributorsrc|.editorconfig|.eslintrc|^^/.git*|^^.git*|.npm*|.prettier*|CONTRIBUTING.md|CODE_OF_CONDUCT.md|README|README.md|readme.md|LICENSE|license|LICENSE.md|CHANGELOG|CHANGELOG.md)"
set "IconWindows=assets/icons/ntfy.ico"
set "IconLinux=assets/icons/ntfy.png"
set "IconMacOS=assets/icons/ntfy.icns"

:: #
::  Create build directory
::
::  /build              contains built electron package
::  /dist               contains zip archive
:: #

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

:: #
::  define:     platforms
:: #

set platformWin=x64 ia32 arm64
set platformLinux=x64 arm64 armv7l
set platformMac=x64 arm64

:: #
::  Build > Windows
:: #

for %%a in (%platformWin%) do (
    echo.
    echo -------------------------------------------------------------------------
    echo Building Windows-%%a
    echo Setting Ignore Pattern: !IgnorePattern!
    CALL electron-packager . ntfy-desktop --asar --platform="win32" --arch="%%a" --icon="!IconWindows!" --overwrite --ignore=\"!IgnorePattern!\" --prune=true --out=!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"
    powershell Compress-Archive -Path "!dir_build!/ntfy-desktop-win32-%%a" -DestinationPath "!dir_dist!/ntfy-desktop-windows-%%a.zip"

    if "!bDeleteBuild!" == "true" (
        rm -rf "!dir_build!/ntfy-desktop-win32-%%a"
    )
    echo -------------------------------------------------------------------------
    echo.
)

:: #
::  Build > Linux
:: #

for %%a in (%platformLinux%) do (
    echo.
    echo -------------------------------------------------------------------------
    echo Building Linux-%%a
    echo Setting Ignore Pattern: !IgnorePattern!
    CALL electron-packager . ntfy-desktop --asar --platform="linux" --arch="%%a" --icon="!IconLinux!" --overwrite --ignore=\"!IgnorePattern!\" --prune=true --out=!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"
    powershell Compress-Archive -Path "!dir_build!/ntfy-desktop-linux-%%a" -DestinationPath "!dir_dist!/ntfy-desktop-linux-%%a.zip"

    if "!bDeleteBuild!" == "true" (
        rm -rf "!dir_build!/ntfy-desktop-linux-%%a"
    )
    echo -------------------------------------------------------------------------
    echo.
)

:: #
::  Build > MacOS
:: #

for %%a in (%platformMac%) do (
    echo.
    echo -------------------------------------------------------------------------
    echo Building MacOS-%%a
    echo Setting Ignore Pattern: !IgnorePattern!
    CALL electron-packager . ntfy-desktop --asar --platform="darwin" --arch="%%a" --icon="!IconMacOS!" --overwrite --ignore=\"!IgnorePattern!\"  --prune=true --out=!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"
    powershell Compress-Archive -Path "!dir_build!/ntfy-desktop-darwin-%%a" -DestinationPath "!dir_dist!/ntfy-desktop-mac-%%a.zip"

    if "!bDeleteBuild!" == "true" (
        rm -rf "!dir_build!/ntfy-desktop-darwin-%%a"
    )
    echo -------------------------------------------------------------------------
    echo.
)

goto :END

:: #
::  end
:: #

:END
    echo.
    echo Build Complete
    timeout /t 5 /nobreak >nul
    echo.
Exit /B 0
