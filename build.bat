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

set platformLinux=x64 arm64 armv7l
set platformMac=x64 arm64
set platformWin=x64 ia32 arm64

for %%a in (%platformLinux%) do (
    echo.
    echo Building linux-%%a
    CALL electron-packager . ntfy-electron --platform "linux" --arch "%%a" --icon "ntfy.png" --overwrite --ignore=^/build
)

for %%b in (%platformMac%) do (
    echo.
    echo Building darwin-%%b
    CALL electron-packager . ntfy-electron --platform "darwin" --arch "%%b" --icon "ntfy.icns" --overwrite --ignore=^/build
)

for %%c in (%platformWin%) do (
    echo.
    echo Building windows-%%c
    CALL electron-packager . ntfy-electron --platform "win32" --arch "%%c" --icon "ntfy.ico" --overwrite --ignore=^/build
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
