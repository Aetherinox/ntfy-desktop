<div align="center">
<h6>Ntfy.sh desktop client for Windows, Linux, and MacOSX</h6>
<h1>♾️ ntfy-desktop ♾️</h1>

<br />

<p>A ntfy.sh desktop client built with Electron which supports Windows, Linux, and MacOSX. This client rests in your taskbar tray and allows you to receive push notifications to your desktop without requiring you to leave your browser open.</p>

<p float="left">
  <img style="padding-right:15px;" src="https://github.com/user-attachments/assets/b6a34bc3-dbbf-4249-b3d2-d113a21cca66" width="300" />
  <img src="https://github.com/user-attachments/assets/4f842360-bc94-46eb-8660-17f221fe745d" width="300" /> 
</p>

<p float="left">
  <img style="padding-right:15px;" src="https://github.com/user-attachments/assets/ebe0c02c-336f-4e95-b0f9-24c5b853f0e4" width="300" />
  <img src="https://github.com/user-attachments/assets/31c0a712-f596-44b1-a30d-fdbe579d9df6" width="300" /> 
</p>

<p float="left">
  <img style="padding-right:15px;" src="https://github.com/user-attachments/assets/ce32d901-b35b-48e5-85b5-3cf82ae09b1e" width="300" />
  <img src="https://github.com/user-attachments/assets/a04f6222-9a29-40c3-a2d2-82bd8f6f4c09" width="300" /> 
</p>

<br />

</div>

<div align="center">

<!-- prettier-ignore-start -->
[![Version][github-version-img]][github-version-uri]
[![Build Status][github-build-img]][github-build-uri]
[![Build Status][github-tests-img]][github-tests-uri]
[![Downloads][github-downloads-img]][github-downloads-uri]
[![Size][github-size-img]][github-size-img]
[![Last Commit][github-commit-img]][github-commit-img]
[![Contributors][contribs-all-img]](#contributors-)
<!-- prettier-ignore-end -->

</div>

<br />

---

<br />

- [About](#about)
  - [What is Ntfy](#what-is-ntfy)
  - [Ntfy Desktop Features](#ntfy-desktop-features)
  - [Self-hosted vs Ntfy.sh](#self-hosted-vs-ntfysh)
- [Usage](#usage)
  - [Key Binds](#key-binds)
  - [CLI Arguments](#cli-arguments)
- [Build](#build)
  - [Method: Build Script](#method-build-script)
    - [Linux](#linux)
    - [Windows](#windows)
    - [MacOSX](#macosx)
  - [Method: Package.json Command](#method-packagejson-command)
    - [Summary](#summary)
    - [Linux](#linux-1)
    - [Windows](#windows-1)
    - [MacOSX](#macosx-1)
- [Tests](#tests)
  - [Github Workflow](#github-workflow)
  - [Manual Test](#manual-test)
- [Contributors ✨](#contributors-)


<br />

---

<br />

# About

This project allows you to access the official free / paid notification service [ntfy.sh](https://ntfy.sh/), or your own self-hosted version of ntfy from within a desktop application which utilizes Electron as the wrapper.

<br />

## What is Ntfy

[ntfy.sh](https://ntfy/) (pronounced "notify") is a simple HTTP-based pub-sub notification service. With [ntfy](https://ntfy/), you can send notifications to your phone or desktop via scripts from any computer, without having to sign up or pay any fees. If you'd like to run your own instance of the service, you can easily do so since ntfy is open source.

To install Ntfy on your system, visit the following links:

<div align="center">

[![View](https://img.shields.io/badge/%20-%20Download%20Ntfy.sh%20-%20%231F85DE?style=for-the-badge&logo=github&logoColor=FFFFFF)](https://github.com/binwiederhier/ntfy/releases) [![Download](https://img.shields.io/badge/%20-%20View%20Documentation-%20%23de2343?style=for-the-badge&logo=github&logoColor=FFFFFF)](https://docs.ntfy.sh/install/)

</div>

<br />

## Ntfy Desktop Features

- Usable with ntfy.sh or a self-hosted instance
  - To self-host, you must install Ntfy server on a local machine.
  - View docs at https://docs.ntfy.sh/install/
- Two modes for minimizing app, configure in settings
  1. Close button exits app completely; OR
  2. Close button sends app to tray. Right-click tray icon to quit / show app
- Start app minimized
- Shortcut key-binds
  - Can disable the keyboard shortcuts
- Receive push notifications from ntfy server to desktop
  - Includes setting to adjust polling rate
  - Modify Datetime format
  - Optional persistent (sticky) notifications which require user interaction to clear
  - Topic filtering
- Supports Ntfy API token
- Includes [command-line arguments](#cli-arguments)

<br />

## Self-hosted vs Ntfy.sh

To use this desktop client, you will be required to either have an Ntfy.sh account, or you must host your own instance of the Ntfy.sh server to pull notifications from. 

You can install your own self-hosted copy of Ntfy server from:

- https://github.com/binwiederhier/ntfy/releases

<br />

Be aware that the official [ntfy.sh](https://ntfy/) website will **rate-limit** users who have not purchased a paid package. Out of box, this ntfy-desktop client polls for new notifications every `30 seconds`; if you are on the free plan and decrease this timer in the desktop client settings, you will get an error saying that you have gone over your rate-limit. 

<br />

If you are self-hosting your own copy of Ntfy, you must open the Ntfy Desktop client, click the menu item **Configure** and then click **URL**. You must set your instance URL to your personal self-hosted instance. 

<p align="center"><img style="width: 80%;text-align: center;" src="docs/img/README/selfhost.gif"></p>

<br />

You can set the polling rate lower without any limitations or rate limits:

<p align="center"><img style="width: 80%;text-align: center;" src="docs/img/README/polling.gif"></p>


<br />

---

<br />

# Usage

This section explains how to use ntfy-desktop once you have it ready to go on your system.

<br />

## Key Binds
The following keybinds can be used within ntfy-desktop:

<br />

| Key(s) | Description |
| --- | --- |
| `CTRL + R` | Refresh page |
| `CTRL + Q` | Quit application |
| `CTRL + M` | Minimize to tray |
| `CTRL + =` | Zoom in |
| `CTRL + -` | Zoom out |
| `CTRL + 0` | Zoom reset |
| `CTRL + SHIFT + I` | Developer tools |
| `F12` | Developer tools |
| `CTRL + G` | Show General settings window |
| `CTRL + U` | Show URL settings window |
| `CTRL + T` | Show API Token settings window |
| `CTRL + SHIFT + T` | Show Topics settings window |
| `CTRL + N` | Show Notifications settings window |

<br />

> [!NOTE]
> Hotkeys are disabled by default. To enable hotkeys, select **Configure** in the top menu, and select **General**.
> 
> Enable `Allow usage of hotkeys to navigate`

<br />
<br />

## CLI Arguments

This client allows you to utilize the following command-line arguments with ntfy-desktop:

<br />

| Argument | Description | Available as setting |
| --- | --- | --- |
| `--hidden` | Start app hidden in tray, suitable for auto-starting on login/boot | ✅ |
| `--hotkey` | Start app with hotkeys enabled | ✅ |
| `--quit` | Top-right close button will completely exit app instead of minimize to tray | ✅ |
| `--dev` | Start app with developer tools in `App` menu | ✅ |

<br />

If you are running ntfy-desktop from node, you can pass arguments using the following example:

```shell ignore
npm run start -- --hidden
```

<br />

---

<br />

# Build

There are numerous ways to build this application. 

<br />

## Method: Build Script

This method makes use of the `build.bat` and `build.sh` scripts provided in this repository. Find your operating system below and follow the instructions:

- [Linux](#linux)
- [Windows](#windows)
- [MacOSX](#macosx)

<br />

### Linux

Run the following commands to install NodeJS + NPM, and then Ntfy Desktop:

```shell
# Install NodeJS and NPM
sudo apt update
sudo apt install git nodejs npm wine64

# Clone ntfy-desktop repo, make sure you are in an EMPTY folder:
mkdir ntfy-desktop && cd ntfy-desktop/
git clone https://github.com/aetherinox/ntfy-desktop.git .
npm install
npm install -g electron-packager
sudo ln -s /usr/bin/wine /usr/bin/wine64
sudo chmod +x build.sh

# build ntfy-desktop
./build.sh
```

<br />
<br />

### Windows

Install NodeJS with NPM by going to the following URL. Make sure to select your current operating system at the top:

- https://nodejs.org/en/download

<br />

Next, run the following commands in Powershell or Windows Command Prompt:

```shell
# Clone ntfy-desktop repo, make sure you are in an EMPTY folder:
mkdir ntfy-desktop && cd ntfy-desktop/
git clone https://github.com/aetherinox/ntfy-desktop.git .
npm install
npm install -g electron

# build ntfy
./build.bat
```

<br />
<br />

### MacOSX

Install NodeJS with NPM by going to the following URL. Make sure to select your current operating system at the top:

- https://nodejs.org/en/download

<br />

Install **Git** on your system next:

- https://git-scm.com/downloads/mac

<br />

Open your Terminal app and run the following commands:

```shell
# Clone ntfy-desktop repo, make sure you are in an EMPTY folder:
mkdir ntfy-desktop && cd ntfy-desktop/
git clone https://github.com/aetherinox/ntfy-desktop.git .
npm install
npm install -g electron-packager
sudo chmod +x build.sh

# build ntfy-desktop
./build.sh
```

<br />
<br />

## Method: Package.json Command

You can also build your own copy of ntfy-desktop by executing the included `package.json` run commands.

- [Linux](#linux-1)
- [Windows](#windows-1)
- [MacOSX](#macosx-1)

<br />

### Summary

To run the `npm` commands, you must install NodeJS and NPM on your system. To install them, visit: 

- https://nodejs.org/en/download

<br />

The `package.json` includes the commands listed below. Because the build commands have dynamic variables; you must run the command based on what operating system you are building from.

If you are building ntfy-desktop from a **Windows** machine:

- `npm run build:win:windows`
- `npm run build:win:linux`
- `npm run build:win:mac`

<br />

If you are building ntfy-desktop from a **Linux** or **MacOS** machine:

- `npm run build:lin:windows`
- `npm run build:lin:linux`
- `npm run build:lin:mac`

<br >
<br >

### Linux

Run the following commands to install NodeJS + NPM, and then Ntfy Desktop:

```shell
# Install NodeJS and NPM
sudo apt update
sudo apt install git nodejs npm wine64

# Clone ntfy-desktop repo, make sure you are in an EMPTY folder:
mkdir ntfy-desktop && cd ntfy-desktop/
git clone https://github.com/aetherinox/ntfy-desktop.git .
npm install
npm install -g electron-packager
sudo ln -s /usr/bin/wine /usr/bin/wine64

# build ntfy-desktop from Windows machine
npm run build:win:linux

# build ntfy-desktop from Linux machine
npm run build:lin:linux
```

<br />
<br />

### Windows

Install NodeJS with NPM by going to the following URL. Make sure to select your current operating system at the top:

- https://nodejs.org/en/download

<br />

Next, run the following commands in Powershell or Windows Command Prompt:

```shell
# Clone ntfy-desktop repo, make sure you are in an EMPTY folder:
mkdir ntfy-desktop && cd ntfy-desktop/
git clone https://github.com/aetherinox/ntfy-desktop.git .
npm install
npm install -g electron

# build ntfy-desktop from Windows machine
npm run build:win:windows

# build ntfy-desktop from Linux machine
npm run build:lin:windows
```

<br />
<br />

<br />
<br />

### MacOSX

Install NodeJS with NPM by going to the following URL. Make sure to select your current operating system at the top:

- https://nodejs.org/en/download

<br />

Install **Git** on your system next:

- https://git-scm.com/downloads/mac

<br />

Open your Terminal app and run the following commands:

```shell
# Clone ntfy-desktop repo, make sure you are in an EMPTY folder:
mkdir ntfy-desktop && cd ntfy-desktop/
git clone https://github.com/aetherinox/ntfy-desktop.git .
npm install
npm install -g electron-packager

# build ntfy-desktop from Windows machine
npm run build:win:mac

# build ntfy-desktop from Linux machine
npm run build:lin:mac
```

<br />

---

<br />

# Tests

This repository contains tests in order to test the functionality of this project. We utilize a Github workflow to handle the automation, however, you can run the tests locally.

<br />

In order to run these tests, you must have some dependencies installed on your system or runner:

```shell
sudo apt install xvfb -y
npm install
npx playwright install-deps
```

<br />

If you do not run the command `playwright install-deps`; then you will need to install all of the dependencies manually with the command:

```shell
sudo apt install xvfb -y
sudo apt-get install libasound2 libxslt-dev woff2 libevent-dev libopus0 \
  libopus-dev libwebpdemux2 libharfbuzz-dev libharfbuzz0b libwebp-dev \
  libenchant-2-dev libsecret-1-0 libsecret-1-dev libglib2.0-dev libhyphen0 \
  libglfw3-dev libgles2-mesa-dev libudev1 libevdev2 libgles2-mesa yasm \
  libudev1 libudev-dev libgudev-1.0-0 libx264-dev libgconf-2-4 libatk1.0-0 \
  libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev \
  libxss-dev -y
npx playwright install
```

<br />

## Github Workflow

You can fork this repository and run the Github workflow
- https://github.com/Aetherinox/ntfy-desktop/blob/f794bb835cb68a2b6da74d9161e7432c673179ea/.github/workflows/npm-tests.yml

<br />

In order for the workflow to work, your Github or self-hosted runner must have numerous dependencies installed. Ensure you do not remove the `npm install` and `apt install` commands from the workflow; otherwise the tests will fail.

<br />

## Manual Test

You can manually test this project by running the command:

```shell
npm run test
```

<br />

You should see numerous windows open and multiple copies of Ntfy Desktop start up. This is normal, and is the test checking out the functionality of the application.

<br />

If you want to run the tests from a CI without having a GUI available to see the tests; you can run the command:

```shell
xvfb-run --auto-servernum --server-args="-screen 0 1280x960x24" npx playwright test --trace on
```

<br />

If you want to run the tests, while having Electron running in debug / verbose mode; run the command:

```shell
DISPLAY=:0 DEBUG=pw:browser xvfb-run --auto-servernum --server-args="-screen 0 1280x960x24" npx playwright test --trace on
```

<br />

The tests should show something similar to the following:

```console
[chromium] › tests/main.spec.js:65:1 › ✅ ensure interface can fully load
✅ Open New Window: About
[webkit] › tests/main.spec.js:65:1 › ✅ ensure interface can fully load
✅ Open New Window: About
[chromium] › tests/main.spec.js:65:1 › ✅ ensure interface can fully load
✅ Saved screenshot: test-results/fullload_1749458422355.png
[webkit] › tests/main.spec.js:65:1 › ✅ ensure interface can fully load
[SubscriptionManager] No browser subscription currently exists, so web push was never enabled or the notification permission was removed. Skipping.
✅ Saved screenshot: test-results/fullload_1749458422373.png
[firefox] › tests/main.spec.js:143:1 › ✅ fail to sign into invalid account
ntfy
[chromium] › tests/main.spec.js:143:1 › ✅ fail to sign into invalid account
ntfy
[webkit] › tests/main.spec.js:143:1 › ✅ fail to sign into invalid account
ntfy
  9 passed (15.3s)

To open last HTML report run:

  npx playwright show-report
```

<br />

---

<br />

# Contributors ✨

We are always looking for contributors. If you feel that you can provide something useful to this project, then we'd love to review your suggestion. Before submitting your contribution, please review the following resources:

- [Pull Request Procedure](.github/PULL_REQUEST_TEMPLATE.md)
- [Contributor Policy](CONTRIBUTING.md)

<br />

Want to help but can't write code?

- Review [active questions by our community](https://github.com/aetherinox/ntfy-desktop/labels/❔%20Question) and answer the ones you know.

<br />

The following people have helped keep this project going:

<br />

<div align="center">

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![Contributors][contribs-all-img]](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top"><a href="https://github.com/aetherinox"><img src="https://avatars.githubusercontent.com/u/118329232?v=4&s=40" width="80px;" alt="Aetherinox"/><br /><sub><b>Aetherinox</b></sub></a><br /><a href="https://github.com/aetherinox/noxenv/commits?author=aetherinox" title="Code">💻</a> <a href="#projectManagement-aetherinox" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>
</div>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<br />
<br />

<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- BADGE > GENERAL -->
  [general-npmjs-uri]: https://npmjs.com
  [general-nodejs-uri]: https://nodejs.org
  [general-npmtrends-uri]: http://npmtrends.com/ntfy-desktop

<!-- BADGE > VERSION > GITHUB -->
  [github-version-img]: https://img.shields.io/github/v/tag/aetherinox/ntfy-desktop?logo=GitHub&label=Version&color=ba5225
  [github-version-uri]: https://github.com/aetherinox/ntfy-desktop/releases

<!-- BADGE > VERSION > NPMJS -->
  [npm-version-img]: https://img.shields.io/npm/v/ntfy-desktop?logo=npm&label=Version&color=ba5225
  [npm-version-uri]: https://npmjs.com/package/ntfy-desktop

<!-- BADGE > VERSION > PYPI -->
  [pypi-version-img]: https://img.shields.io/pypi/v/ntfy-desktop
  [pypi-version-uri]: https://pypi.org/project/ntfy-desktop/

<!-- BADGE > LICENSE > MIT -->
  [license-mit-img]: https://img.shields.io/badge/MIT-FFF?logo=creativecommons&logoColor=FFFFFF&label=License&color=9d29a0
  [license-mit-uri]: https://github.com/aetherinox/ntfy-desktop/blob/main/LICENSE

<!-- BADGE > GITHUB > DOWNLOAD COUNT -->
  [github-downloads-img]: https://img.shields.io/github/downloads/aetherinox/ntfy-desktop/total?logo=github&logoColor=FFFFFF&label=Downloads&color=376892
  [github-downloads-uri]: https://github.com/aetherinox/ntfy-desktop/releases

<!-- BADGE > NPMJS > DOWNLOAD COUNT -->
  [npmjs-downloads-img]: https://img.shields.io/npm/dw/%40aetherinox%2Fntfy-desktop?logo=npm&&label=Downloads&color=376892
  [npmjs-downloads-uri]: https://npmjs.com/package/ntfy-desktop

<!-- BADGE > GITHUB > DOWNLOAD SIZE -->
  [github-size-img]: https://img.shields.io/github/repo-size/aetherinox/ntfy-desktop?logo=github&label=Size&color=59702a
  [github-size-uri]: https://github.com/aetherinox/ntfy-desktop/releases

<!-- BADGE > NPMJS > DOWNLOAD SIZE -->
  [npmjs-size-img]: https://img.shields.io/npm/unpacked-size/ntfy-desktop/latest?logo=npm&label=Size&color=59702a
  [npmjs-size-uri]: https://npmjs.com/package/ntfy-desktop

<!-- BADGE > CODECOV > COVERAGE -->
  [codecov-coverage-img]: https://img.shields.io/codecov/c/github/aetherinox/ntfy-desktop?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
  [codecov-coverage-uri]: https://codecov.io/github/aetherinox/ntfy-desktop

<!-- BADGE > ALL CONTRIBUTORS -->
  [contribs-all-img]: https://img.shields.io/github/all-contributors/aetherinox/ntfy-desktop?logo=contributorcovenant&color=de1f6f&label=contributors
  [contribs-all-uri]: https://github.com/all-contributors/all-contributors

<!-- BADGE > GITHUB > BUILD > NPM -->
  [github-build-img]: https://img.shields.io/github/actions/workflow/status/aetherinox/ntfy-desktop/npm-build.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
  [github-build-uri]: https://github.com/aetherinox/ntfy-desktop/actions/workflows/npm-build.yml

<!-- BADGE > GITHUB > BUILD > Pypi -->
  [github-build-pypi-img]: https://img.shields.io/github/actions/workflow/status/aetherinox/ntfy-desktop/app-pypi.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
  [github-build-pypi-uri]: https://github.com/aetherinox/ntfy-desktop/actions/workflows/app-pypi.yml

<!-- BADGE > GITHUB > TESTS -->
  [github-tests-img]: https://img.shields.io/github/actions/workflow/status/aetherinox/ntfy-desktop/npm-tests.yml?logo=github&label=Tests&color=2c6488
  [github-tests-uri]: https://github.com/aetherinox/ntfy-desktop/actions/workflows/npm-tests.yml?logo=github&label=Tests&color=2c6488
  [github-tests-uri]: https://github.com/aetherinox/ntfy-desktop/actions/workflows/app-tests.yml.yml

<!-- BADGE > GITHUB > COMMIT -->
  [github-commit-img]: https://img.shields.io/github/last-commit/aetherinox/ntfy-desktop?logo=conventionalcommits&logoColor=FFFFFF&label=Last%20Commit&color=313131
  [github-commit-uri]: https://github.com/aetherinox/ntfy-desktop/commits/main/

<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->
