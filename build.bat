@ECHO OFF
@CD /d "%~dp0"
SETLOCAL ENABLEDELAYEDEXPANSION
TITLE ntfy-desktop Build Script
MODE con:cols=140 lines=50

:: #
::  clear screen
:: #

CLS

:: #
::  header
:: #

echo.
echo =============================================================================
echo                         NTFY DESKTOP BUILD SCRIPT
echo =============================================================================
echo.
echo Building cross-platform desktop client for:
echo   * Windows (x64, ia32, arm64)
echo   * Linux   (x64, arm64, armv7l)
echo   * macOS   (x64, arm64)
echo.
echo =============================================================================
echo.

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

set "dir_home=%~dp0"
set "dir_home=%dir_home:~0,-1%"
set dir_build=build
set dir_dist=dist
set dir_src=src

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

echo [INFO] Initializing build environment...
echo.

IF exist !dir_home!\!dir_build! (
    echo [CLEAN] Cleaning existing build directory...
    del /S /Q !dir_home!\!dir_build!\* >nul 2>&1
    echo [OK] Build directory cleaned
) ELSE (
    md !dir_home!\!dir_build! >nul 2>&1
    echo [OK] Build directory created
)

IF exist !dir_home!\!dir_dist! (
    echo [CLEAN] Cleaning existing dist directory...
    del /S /Q !dir_home!\!dir_dist!\* >nul 2>&1
    echo [OK] Dist directory cleaned
) ELSE (
    md !dir_home!\!dir_dist! >nul 2>&1
    echo [OK] Dist directory created
)

:: #
::  define:     platforms
:: #

set platformWin=x64 ia32 arm64
set platformLinux=x64 arm64 armv7l
set platformMac=x64 arm64

:: #
:: Change directories to /src folder
:: ##

cd !dir_home!\!dir_src!

:: #
::  Build > Windows
:: #

echo [BUILD] Starting Windows platform builds...
echo.

for %%a in (%platformWin%) do (
    echo.
    echo =============================================================================
    echo [WINDOWS] Building architecture: %%a
    echo =============================================================================

    IF not exist !dir_home!\!dir_build!\ntfy-desktop-win32-%%a (
        md !dir_home!\!dir_build!\ntfy-desktop-win32-%%a >nul 2>&1
        echo [OK] Output directory created
    )

    echo [PACKAGE] Packaging Electron application...
    CALL npx @electron/packager . ntfy-desktop --asar --platform="win32" --arch="%%a" --icon="!IconWindows!" --overwrite --ignore=\"!IgnorePattern!\" --prune=true --out=!dir_home!\!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"

    echo [COMPRESS] Creating ZIP archive...
    powershell Compress-Archive -Path "!dir_home!\!dir_build!\ntfy-desktop-win32-%%a" -DestinationPath "!dir_home!\!dir_dist!\ntfy-desktop-windows-%%a.zip"
    echo [OK] Windows %%a build completed successfully

    if "!bDeleteBuild!" == "true" (
        rd /s /q "!dir_home!\!dir_build!\ntfy-desktop-win32-%%a"
        echo [CLEAN] Temporary build files removed
    )
    echo.
)

:: #
::  Build > Linux
:: #

echo [BUILD] Starting Linux platform builds...
echo.

for %%a in (%platformLinux%) do (
    echo.
    echo =============================================================================
    echo [LINUX] Building architecture: %%a
    echo =============================================================================

    IF not exist !dir_home!\!dir_build!\ntfy-desktop-linux-%%a (
        md !dir_home!\!dir_build!\ntfy-desktop-linux-%%a >nul 2>&1
        echo [OK] Output directory created
    )

    echo [PACKAGE] Packaging Electron application...
    CALL npx @electron/packager . ntfy-desktop --asar --platform="linux" --arch="%%a" --icon="!IconLinux!" --overwrite --ignore=\"!IgnorePattern!\" --prune=true --out=!dir_home!\!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"

    echo [COMPRESS] Creating ZIP archive...
    powershell Compress-Archive -Path "!dir_home!\!dir_build!\ntfy-desktop-linux-%%a" -DestinationPath "!dir_home!\!dir_dist!\ntfy-desktop-linux-%%a.zip"
    echo [OK] Linux %%a build completed successfully

    if "!bDeleteBuild!" == "true" (
        rd /s /q "!dir_home!\!dir_build!\ntfy-desktop-linux-%%a"
        echo [CLEAN] Temporary build files removed
    )
    echo.
)

:: #
::  Build > MacOS
:: #

echo [BUILD] Starting macOS platform builds...
echo.

for %%a in (%platformMac%) do (
    echo.
    echo =============================================================================
    echo [MACOS] Building architecture: %%a
    echo =============================================================================

    IF not exist !dir_home!\!dir_build!\ntfy-desktop-darwin-%%a (
        md !dir_home!\!dir_build!\ntfy-desktop-darwin-%%a >nul 2>&1
        echo [OK] Output directory created
    )

    echo [PACKAGE] Packaging Electron application...
    CALL npx @electron/packager . ntfy-desktop --asar --platform="darwin" --arch="%%a" --icon="!IconMacOS!" --overwrite --ignore=\"!IgnorePattern!\" --prune=true --out=!dir_home!\!dir_build! --appCopyright="!Copyright!" --win32metadata.FileDescription="!FileDescription!" --win32metadata.ProductName="!ProductName!" --win32metadata.OriginalFilename="!OriginalFilename!" --win32metadata.CompanyName="!CompanyName!"

    echo [COMPRESS] Creating TAR.GZ archive...
    cd "!dir_home!\!dir_build!"
    tar -czf "!dir_home!\!dir_dist!\ntfy-desktop-mac-%%a.tar.gz" "ntfy-desktop-darwin-%%a"
    cd "!dir_home!\!dir_src!"
    echo [OK] macOS %%a build completed successfully

    if "!bDeleteBuild!" == "true" (
        rd /s /q "!dir_home!\!dir_build!\ntfy-desktop-darwin-%%a"
        echo [CLEAN] Temporary build files removed
    )
    echo.
)
:: ##

cd !dir_home!

:: #
::  end
:: #

goto :END
:END
    echo.
    echo =============================================================================
    echo                           BUILD PROCESS COMPLETED
    echo =============================================================================
    echo.
    echo [SUCCESS] All platform builds have been completed successfully!
    echo.
    echo Output files are available in: %dir_home%\%dir_dist%
    echo.
    echo Build summary:
    echo   - Windows packages: ntfy-desktop-windows-*.zip
    echo   - Linux packages:   ntfy-desktop-linux-*.zip
    echo   - macOS packages:   ntfy-desktop-mac-*.tar.gz
    echo.
    echo =============================================================================
    echo.
    timeout /t 5 /nobreak >nul
Exit /B 0
