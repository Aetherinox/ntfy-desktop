<div align="center">
<h1>♾️ ntfy-desktop ♾️</h1>
<br />
<p>

ntfy.sh desktop client built with Electron which supports Windows, Linux, and MacOSX.
Official app at https://github.com/xdpirate/ntfy-electron

</p>

<br />

<img src="https://github.com/Aetherinox/ntfy-desktop/assets/118329232/cd7dca36-e0cc-43dc-a4c9-c09e084b3cd0" width="630">

<br />

</div>

<br />

<div align="center">

<!-- prettier-ignore-start -->
[![Version][badge-version-gh]][link-version-gh]
[![Build Status][badge-build]][link-build]
[![Downloads][badge-downloads-gh]][link-downloads-gh]
[![Size][badge-size-gh]][badge-size-gh]
[![Last Commit][badge-commit]][badge-commit]
[![Contributors][badge-all-contributors]](#contributors-)
<!-- prettier-ignore-end -->

</div>

<br />

---

<br />

- [About](#about)
  - [What is ntfy?](#what-is-ntfy)
  - [What is ntfy-desktop](#what-is-ntfy-desktop)
- [Features](#features)
- [Key Binds](#key-binds)
- [CLI Arguments](#cli-arguments)
- [Build](#build)
  - [Linux](#linux)
  - [Windows](#windows)


<br />

---

<br />

# About
Getting familiar with the projects:

<br />

## What is ntfy?
[ntfy.sh](https://ntfy/) (pronounced "notify") is a simple HTTP-based pub-sub notification service. With ntfy, you can send notifications to your phone or desktop via scripts from any computer, without having to sign up or pay any fees. If you'd like to run your own instance of the service, you can easily do so since ntfy is open source.

<br />

<div align="center">

[![View](https://img.shields.io/badge/%20-%20View%20Project%20Repo-%20%23de2343?style=for-the-badge&logo=github&logoColor=FFFFFF)](https://github.com/binwiederhier/ntfy)

</div>

<br />

## What is ntfy-desktop
This project allows you to access the official free / paid notification service [ntfy.sh](https://ntfy.sh/), or your own self-hosted version of ntfy from within a desktop application which utilizes Electron as the wrapper.

This version of ntfy-desktop is based on the package ntfy-electron created by xdpirate, however, this version brings some changes in functionality, as well as some additional edits that I personally needed.

<br />

---

<br />

# Features
- Usable with ntfy.sh and self-hosted instances
- Two modes for minimizing app, configure in settings
  - [1] Close button exists app completely, sits in taskbar and tray
  - [2] Close button sends app to tray. Right-click tray icon to quit / show app
- Shortcut keybinds
  - Option to disable
- Receive push notifications from ntfy server to desktop
  - Advanced setting to adjust polling rate
  - Datetime format setting
  - Optional persistent notifications
  - Topic filtering

<br />

---

<br />

# Key Binds
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

---

<br />

# CLI Arguments
| Argument | Description |
| --- | --- |
| `--hidden` | Start ntfy-desktop hidden, suitable for autostarting on login/boot |
| `--hotkey` | Start ntfy-desktop with hotkeys enabled |
| `--quit` | Clicking top-right close button will completely exit app instead of minimize to tray |
| `--dev` | Start ntfy-desktop with developer tools |

<br />

---

<br />

# Build
To build this app, run the following commands:

## Linux
```shell
git clone https://github.com/Aetherinox/ntfy-desktop.git
npm install
npm install -g electron-packager
sudo apt install wine64
sudo ln -s /usr/bin/wine /usr/bin/wine64
```

<br />

## Windows
To test development on a Windows machine, run the following commands.
A build script for windows will be available later.

```shell
git clone https://github.com/Aetherinox/ntfy-desktop.git
npm install
npm install -g electron
```

<br />

Once you have finished modifying the code, you can test the application with:
```shell ignore
npm run start
```

<br />

When you are ready to build, run the build script:
```shell ignore
sudo chmod +x build.sh
./build.sh
```

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<br />
<br />

<!-- prettier-ignore-start -->
<!-- BADGE > GENERAL -->
[link-general-npm]: https://npmjs.com
[link-general-nodejs]: https://nodejs.org
[link-npmtrends]: http://npmtrends.com/ntfy-desktop
<!-- BADGE > VERSION > GITHUB -->
[badge-version-gh]: https://img.shields.io/github/v/tag/Aetherinox/ntfy-desktop?logo=GitHub&label=Version&color=ba5225
[link-version-gh]: https://github.com/Aetherinox/ntfy-desktop/releases
<!-- BADGE > VERSION > NPMJS -->
[badge-version-npm]: https://img.shields.io/npm/v/ntfy-desktop?logo=npm&label=Version&color=ba5225
[link-version-npm]: https://npmjs.com/package/ntfy-desktop
<!-- BADGE > LICENSE -->
[badge-license-mit]: https://img.shields.io/badge/MIT-FFF?logo=creativecommons&logoColor=FFFFFF&label=License&color=9d29a0
[link-license-mit]: https://github.com/Aetherinox/ntfy-desktop/blob/main/LICENSE
<!-- BADGE > BUILD -->
[badge-build]: https://img.shields.io/github/actions/workflow/status/Aetherinox/ntfy-desktop/release-npm.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
[link-build]: https://github.com/Aetherinox/ntfy-desktop/actions/workflows/release-npm.yml
<!-- BADGE > DOWNLOAD COUNT -->
[badge-downloads-gh]: https://img.shields.io/github/downloads/Aetherinox/ntfy-desktop/total?logo=github&logoColor=FFFFFF&label=Downloads&color=376892
[link-downloads-gh]: https://github.com/Aetherinox/ntfy-desktop/releases
[badge-downloads-npm]: https://img.shields.io/npm/dw/%40aetherinox%2Fmarked-alert-fa?logo=npm&&label=Downloads&color=376892
[link-downloads-npm]: https://npmjs.com/package/ntfy-desktop
<!-- BADGE > DOWNLOAD SIZE -->
[badge-size-gh]: https://img.shields.io/github/repo-size/Aetherinox/ntfy-desktop?logo=github&label=Size&color=59702a
[link-size-gh]: https://github.com/Aetherinox/ntfy-desktop/releases
[badge-size-npm]: https://img.shields.io/npm/unpacked-size/ntfy-desktop/latest?logo=npm&label=Size&color=59702a
[link-size-npm]: https://npmjs.com/package/ntfy-desktop
<!-- BADGE > COVERAGE -->
[badge-coverage]: https://img.shields.io/codecov/c/github/Aetherinox/ntfy-desktop?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
[link-coverage]: https://codecov.io/github/Aetherinox/ntfy-desktop
<!-- BADGE > ALL CONTRIBUTORS -->
[badge-all-contributors]: https://img.shields.io/github/all-contributors/Aetherinox/ntfy-desktop?logo=contributorcovenant&color=de1f6f&label=contributors
[link-all-contributors]: https://github.com/all-contributors/all-contributors
[badge-tests]: https://img.shields.io/github/actions/workflow/status/Aetherinox/marked-alert-fa/npm-tests.yml?logo=github&label=Tests&color=2c6488
[link-tests]: https://github.com/Aetherinox/ntfy-desktop/actions/workflows/tests.yml
[badge-commit]: https://img.shields.io/github/last-commit/Aetherinox/ntfy-desktop?logo=conventionalcommits&logoColor=FFFFFF&label=Last%20Commit&color=313131
[link-commit]: https://github.com/Aetherinox/ntfy-desktop/commits/main/
<!-- prettier-ignore-end -->
