#!/bin/bash
validReleasesLinux=("x64" "arm64" "armv7l")
validReleasesMac=("x64" "arm64")
validReleasesWin=("x64" "ia32" "arm64")

mkdir -p "build"

#Build linux
for i in "${validReleasesLinux[@]}"
do
    electron-packager . ntfy-electron --platform "linux" --arch "$i" --icon "ntfy.png" --overwrite --ignore=^/build
    zip -r -q -9 "build/ntfy-electron-linux-$i.zip" "ntfy-electron-linux-$i"
    rm -r "ntfy-electron-linux-$i"
done

for i in "${validReleasesMac[@]}"
do
    electron-packager . ntfy-electron --platform "darwin" --arch "$i" --icon "ntfy.icns" --overwrite --ignore=^/build
    zip -r -q -9 "build/ntfy-electron-mac-$i.zip" "ntfy-electron-darwin-$i"
    rm -r "ntfy-electron-darwin-$i"
done

for i in "${validReleasesWin[@]}"
do
    electron-packager . ntfy-electron --platform "win32" --arch "$i" --icon "ntfy.ico" --overwrite --ignore=^/build
    zip -r -q -9 "build/ntfy-electron-windows-$i.zip" "ntfy-electron-win32-$i"
    rm -r "ntfy-electron-win32-$i"
done
