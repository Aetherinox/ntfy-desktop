#!/bin/bash

# #
#   define: directories
# #

dir_build=build
dir_dist=dist

# #
#   define: misc
# #

bDeleteBuild=true
Copyright='Copyright (c) 2024'
FileDescription='ntfy desktop client with Electron wrapper'
ProductName='ntfy desktop'
OriginalFilename='ntfy-desktop.exe'
CompanyName='https://github.com/xdpirate/ntfy-electron'
IgnorePattern='(${dir_dist}*|${dir_build}*|.github*|.all-contributorsrc|.editorconfig|.eslintrc|.git*|.npm*|.prettier*)'

# #
#   define: platforms
# #

platformWin=("x64" "ia32" "arm64")
platformLinux=("x64" "arm64" "armv7l")
platformMac=("x64" "arm64")

# #
#   Zip Compression
#
#   -r      Recursive
#   -q      Quiet mode
#   -9      compression ratio
# #

mkdir -p "${dir_build}"
mkdir -p "${dir_dist}"

# #
#   Build Windows
# #

    for i in "${platformWin[@]}"
    do
        echo -e "Building Windows-${i}"
        electron-packager . ntfy-electron --asar --platform="win32" --arch="$i" --icon="ntfy.ico" --overwrite --ignore="${IgnorePattern}" --prune=true --out=${dir_build} --appCopyright="${Copyright}" --win32metadata.FileDescription="${FileDescription}" --win32metadata.ProductName="${ProductName}" --win32metadata.OriginalFilename="${OriginalFilename}" --win32metadata.CompanyName="${CompanyName}"
        zip -r -q -9 "${dir_dist}/ntfy-electron-windows-$i.zip" "${dir_build}/ntfy-electron-win32-$i"

        if [ "$bDeleteBuild" = true ] ; then
            rm -r "${dir_build}/ntfy-electron-win32-$i"
        fi
    done

# #
#   Build linux
# #

    for i in "${platformLinux[@]}"
    do
        echo -e "Building Linux-${i}"
        electron-packager . ntfy-electron --asar --platform="linux" --arch="$i" --icon="ntfy.png" --overwrite --ignore="${IgnorePattern}" --prune=true --out=${dir_build} --appCopyright="${Copyright}" --win32metadata.FileDescription="${FileDescription}" --win32metadata.ProductName="${ProductName}" --win32metadata.OriginalFilename="${OriginalFilename}" --win32metadata.CompanyName="${CompanyName}"
        zip -r -q -9 "${dir_dist}/ntfy-electron-linux-$i.zip" "${dir_build}/ntfy-electron-linux-$i"

        if [ "$bDeleteBuild" = true ] ; then
            rm -r "${dir_build}/ntfy-electron-linux-$i"
        fi
    done

# #
#   Build mac
# #

    for i in "${platformMac[@]}"
    do
        echo -e "Building MacOS-${i}"
        electron-packager . ntfy-electron --asar --platform="darwin" --arch="$i" --icon="ntfy.icns" --overwrite --ignore="${IgnorePattern}" --prune=true --out=${dir_build} --appCopyright="${Copyright}" --win32metadata.FileDescription="${FileDescription}" --win32metadata.ProductName="${ProductName}" --win32metadata.OriginalFilename="${OriginalFilename}" --win32metadata.CompanyName="${CompanyName}"
        zip -r -q -9 "${dir_dist}/ntfy-electron-mac-$i.zip" "${dir_build}/ntfy-electron-darwin-$i"

        if [ "$bDeleteBuild" = true ] ; then
            rm -r "${dir_build}/ntfy-electron-darwin-$i"
        fi
    done
