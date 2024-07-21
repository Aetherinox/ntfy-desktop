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
::  define:     directories
:: -----------------------------------------------------------------------------------------------------

set dir_home=%~dp0

:: -----------------------------------------------------------------------------------------------------
::  define:     platforms
:: -----------------------------------------------------------------------------------------------------

set platformWin=x64 ia32 arm64
set platformLinux=x64 arm64 armv7l
set platformMac=x64 arm64

for %%a in (%platformWin%) do (
    echo.
    echo Building windows-%%a
    CALL electron-packager . ntfy-electron --asar --platform="win32" --arch="%%a" --icon="ntfy.ico" --overwrite --ignore=^/build --prune=true --out=dist --appCopyright="Copyright (c) 2024" --win32metadata.FileDescription="ntfy desktop client" --win32metadata.ProductName="ntfy desktop" --win32metadata.OriginalFilename="ntfy-desktop.exe" --win32metadata.CompanyName="xdpirate & Aetherinox
)

for %%a in (%platformLinux%) do (
    echo.
    echo Building linux-%%a
    CALL electron-packager . ntfy-electron --asar --platform="linux" --arch="%%a" --icon="ntfy.png" --overwrite --ignore=^/build --prune=true --out=dist --appCopyright="Copyright (c) 2024" --win32metadata.FileDescription="ntfy desktop client" --win32metadata.ProductName="ntfy desktop" --win32metadata.OriginalFilename="ntfy-desktop.exe" --win32metadata.CompanyName="xdpirate & Aetherinox
)

for %%a in (%platformMac%) do (
    echo.
    echo Building linux-%%a
    CALL electron-packager . ntfy-electron --asar --platform="darwin" --arch="%%a" --icon="ntfy.icns" --overwrite --ignore=^/build --prune=true --out=dist --appCopyright="Copyright (c) 2024" --win32metadata.FileDescription="ntfy desktop client" --win32metadata.ProductName="ntfy desktop" --win32metadata.OriginalFilename="ntfy-desktop.exe" --win32metadata.CompanyName="xdpirate & Aetherinox
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
