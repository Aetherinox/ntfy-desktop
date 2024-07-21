#!/bin/bash
validReleasesLinux=("x64" "arm64" "armv7l")
validReleasesMac=("x64" "arm64")
validReleasesWin=("x64" "ia32" "arm64")

mkdir -p "build"

# Build Windows
for i in "${validReleasesWin[@]}"
do
    electron-packager . ntfy-electron --asar --platform="win32" --arch="$i" --icon="ntfy.ico" --overwrite --ignore=^/build --prune=true --out=dist --appCopyright="Copyright (c) 2024" --win32metadata.FileDescription="ntfy desktop client with Electron wrapper" --win32metadata.ProductName="ntfy desktop" --win32metadata.OriginalFilename="ntfy-desktop.exe" --win32metadata.CompanyName="https://github.com/xdpirate/ntfy-electron"
    zip -r -q -9 "build/ntfy-electron-windows-$i.zip" "ntfy-electron-win32-$i"
    rm -r "ntfy-electron-win32-$i"
done

# Build linux
for i in "${validReleasesLinux[@]}"
do
    electron-packager . ntfy-electron --asar --platform="linux" --arch="$i" --icon="ntfy.png" --overwrite --ignore=^/build --prune=true --out=dist --appCopyright="Copyright (c) 2024" --win32metadata.FileDescription="ntfy desktop client with Electron wrapper" --win32metadata.ProductName="ntfy desktop" --win32metadata.OriginalFilename="ntfy-desktop.exe" --win32metadata.CompanyName="https://github.com/xdpirate/ntfy-electron"
    zip -r -q -9 "build/ntfy-electron-linux-$i.zip" "ntfy-electron-linux-$i"
    rm -r "ntfy-electron-linux-$i"
done

# Build mac
for i in "${validReleasesMac[@]}"
do
    electron-packager . ntfy-electron --asar --platform="darwin" --arch="$i" --icon="ntfy.icns" --overwrite --ignore=^/build --prune=true --out=dist --appCopyright="Copyright (c) 2024" --win32metadata.FileDescription="ntfy desktop client with Electron wrapper" --win32metadata.ProductName="ntfy desktop" --win32metadata.OriginalFilename="ntfy-desktop.exe" --win32metadata.CompanyName="https://github.com/xdpirate/ntfy-electron"
    zip -r -q -9 "build/ntfy-electron-mac-$i.zip" "ntfy-electron-darwin-$i"
    rm -r "ntfy-electron-darwin-$i"
done
