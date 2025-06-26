#!/bin/bash

# #
#   clear screen
# #

clear

# #
#   header
# #

echo
echo "============================================================================="
echo "                         NTFY DESKTOP BUILD SCRIPT"
echo "============================================================================="
echo
echo "Building cross-platform desktop client for:"
echo "  * Windows (x64, ia32, arm64)"
echo "  * Linux   (x64, arm64, armv7l)"
echo "  * macOS   (x64, arm64)"
echo
echo "============================================================================="
echo

# #
#   define: directories
# #

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
dir_build="build"
dir_dist="dist"
dir_src="src"

# #
#   define: misc
# #

bDeleteBuild="false"
Copyright="Copyright (c) 2025"
FileDescription="Ntfy.sh desktop client for Windows, Linux, and MacOS with push notifications. Supports official ntfy.sh website and self-hosted instances."
ProductName="Ntfy Desktop"
OriginalFilename="ntfy-desktop.exe"
CompanyName="https://github.com/aetherinox/ntfy-desktop"
IgnorePattern="(^/${dir_dist}|^/${dir_build}|^/.github*|/test-*|/tests*|^/playwright*|.all-contributorsrc|.editorconfig|.eslintrc|^/.git*|^.git*|.npm*|.prettier*|CONTRIBUTING.md|CODE_OF_CONDUCT.md|README|README.md|readme.md|LICENSE|license|LICENSE.md|CHANGELOG|CHANGELOG.md)"
IconWindows="assets/icons/ntfy.ico"
IconLinux="assets/icons/ntfy.png"
IconMacOS="assets/icons/ntfy.icns"

# #
#   define: platforms
# #

platformWin=("x64" "ia32" "arm64")
platformLinux=("x64" "arm64" "armv7l")
platformMac=("x64" "arm64")

# #
#   Create build directory
#
#   /build              contains built electron package
#   /dist               contains zip archive
# #

echo "[INFO] Initializing build environment..."
echo

if [ -d "${script_dir}/${dir_build}" ]; then
    echo "[CLEAN] Cleaning existing build directory..."
    rm -rf "${script_dir}/${dir_build}"/* 2>/dev/null
    echo "[OK] Build directory cleaned"
else
    mkdir -p "${script_dir}/${dir_build}" 2>/dev/null
    echo "[OK] Build directory created"
fi

if [ -d "${script_dir}/${dir_dist}" ]; then
    echo "[CLEAN] Cleaning existing dist directory..."
    rm -rf "${script_dir}/${dir_dist}"/* 2>/dev/null
    echo "[OK] Dist directory cleaned"
else
    mkdir -p "${script_dir}/${dir_dist}" 2>/dev/null
    echo "[OK] Dist directory created"
fi

# Change to src directory
cd "${script_dir}/${dir_src}"

# #
#   Build Windows
# #

echo "[BUILD] Starting Windows platform builds..."
echo

for arch in "${platformWin[@]}"; do
    echo
    echo "============================================================================="
    echo "[WINDOWS] Building architecture: ${arch}"
    echo "============================================================================="

    if [ ! -d "${script_dir}/${dir_build}/ntfy-desktop-win32-${arch}" ]; then
        mkdir -p "${script_dir}/${dir_build}/ntfy-desktop-win32-${arch}" 2>/dev/null
        echo "[OK] Output directory created"
    fi

    echo "[PACKAGE] Packaging Electron application..."
    npx @electron/packager . ntfy-desktop --asar --platform="win32" --arch="${arch}" --icon="${IconWindows}" --overwrite --ignore="${IgnorePattern}" --prune=true --out="${script_dir}/${dir_build}" --appCopyright="${Copyright}" --win32metadata.FileDescription="${FileDescription}" --win32metadata.ProductName="${ProductName}" --win32metadata.OriginalFilename="${OriginalFilename}" --win32metadata.CompanyName="${CompanyName}"

    echo "[COMPRESS] Creating ZIP archive..."
    cd "${script_dir}/${dir_build}"
    zip -r -q "${script_dir}/${dir_dist}/ntfy-desktop-windows-${arch}.zip" "ntfy-desktop-win32-${arch}"
    cd "${script_dir}/${dir_src}"
    echo "[OK] Windows ${arch} build completed successfully"

    if [ "${bDeleteBuild}" = "true" ]; then
        rm -rf "${script_dir}/${dir_build}/ntfy-desktop-win32-${arch}"
        echo "[CLEAN] Temporary build files removed"
    fi
    echo
done

# #
#   Build Linux
# #

echo "[BUILD] Starting Linux platform builds..."
echo

for arch in "${platformLinux[@]}"; do
    echo
    echo "============================================================================="
    echo "[LINUX] Building architecture: ${arch}"
    echo "============================================================================="

    if [ ! -d "${script_dir}/${dir_build}/ntfy-desktop-linux-${arch}" ]; then
        mkdir -p "${script_dir}/${dir_build}/ntfy-desktop-linux-${arch}" 2>/dev/null
        echo "[OK] Output directory created"
    fi

    echo "[PACKAGE] Packaging Electron application..."
    npx @electron/packager . ntfy-desktop --asar --platform="linux" --arch="${arch}" --icon="${IconLinux}" --overwrite --ignore="${IgnorePattern}" --prune=true --out="${script_dir}/${dir_build}" --appCopyright="${Copyright}" --win32metadata.FileDescription="${FileDescription}" --win32metadata.ProductName="${ProductName}" --win32metadata.OriginalFilename="${OriginalFilename}" --win32metadata.CompanyName="${CompanyName}"

    echo "[COMPRESS] Creating ZIP archive..."
    cd "${script_dir}/${dir_build}"
    zip -r -q "${script_dir}/${dir_dist}/ntfy-desktop-linux-${arch}.zip" "ntfy-desktop-linux-${arch}"
    cd "${script_dir}/${dir_src}"
    echo "[OK] Linux ${arch} build completed successfully"

    if [ "${bDeleteBuild}" = "true" ]; then
        rm -rf "${script_dir}/${dir_build}/ntfy-desktop-linux-${arch}"
        echo "[CLEAN] Temporary build files removed"
    fi
    echo
done

# #
#   Build macOS
# #

echo "[BUILD] Starting macOS platform builds..."
echo

for arch in "${platformMac[@]}"; do
    echo
    echo "============================================================================="
    echo "[MACOS] Building architecture: ${arch}"
    echo "============================================================================="

    if [ ! -d "${script_dir}/${dir_build}/ntfy-desktop-darwin-${arch}" ]; then
        mkdir -p "${script_dir}/${dir_build}/ntfy-desktop-darwin-${arch}" 2>/dev/null
        echo "[OK] Output directory created"
    fi

    echo "[PACKAGE] Packaging Electron application..."
    npx @electron/packager . ntfy-desktop --asar --platform="darwin" --arch="${arch}" --icon="${IconMacOS}" --overwrite --ignore="${IgnorePattern}" --prune=true --out="${script_dir}/${dir_build}" --appCopyright="${Copyright}" --win32metadata.FileDescription="${FileDescription}" --win32metadata.ProductName="${ProductName}" --win32metadata.OriginalFilename="${OriginalFilename}" --win32metadata.CompanyName="${CompanyName}"

    echo "[COMPRESS] Creating TAR.GZ archive..."
    cd "${script_dir}/${dir_build}"
    tar -czf "${script_dir}/${dir_dist}/ntfy-desktop-mac-${arch}.tar.gz" "ntfy-desktop-darwin-${arch}"
    cd "${script_dir}/${dir_src}"
    echo "[OK] macOS ${arch} build completed successfully"

    if [ "${bDeleteBuild}" = "true" ]; then
        rm -rf "${script_dir}/${dir_build}/ntfy-desktop-darwin-${arch}"
        echo "[CLEAN] Temporary build files removed"
    fi
    echo
done

# Return to script directory
cd "${script_dir}"

# #
#   Build completion
# #

echo
echo "============================================================================="
echo "                           BUILD PROCESS COMPLETED"
echo "============================================================================="
echo
echo "[SUCCESS] All platform builds have been completed successfully!"
echo
echo "Output files are available in: ${script_dir}/${dir_dist}"
echo
echo "Build summary:"
echo "  - Windows packages: ntfy-desktop-windows-*.zip"
echo "  - Linux packages:   ntfy-desktop-linux-*.zip"
echo "  - macOS packages:   ntfy-desktop-mac-*.tar.gz"
echo
echo "============================================================================="
echo

echo "Build completed. Press any key to exit..."
read -n 1 -s
