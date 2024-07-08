<div align="center">
<h1>♾️ ntfy-electron ♾️</h1>
<br />
<p>ntfy push notifications embedded within an electron wrapper with support for self-hosted instances</p>

<br />

<img src="https://docs.ntfy.sh/static/img/pwa.png" width="630">

<br />

</div>

<div align="center">

<!-- prettier-ignore-start -->
[![Version][badge-version-gh]][link-version-gh] [![Build Status][badge-build]][link-build] [![Downloads][badge-downloads-gh]][link-downloads-gh] [![Size][badge-size-gh]][badge-size-gh] [![Last Commit][badge-commit]][badge-commit] [![Contributors][badge-all-contributors]](#contributors-)
<!-- prettier-ignore-end -->

</div>

<br />

---

<br />

- [About](#about)
  - [What is ntfy?](#what-is-ntfy)
  - [What is ntfy-electron](#what-is-ntfy-electron)
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

## What is ntfy-electron
This project allows you to access the official free / paid notification service [ntfy.sh](https://ntfy.sh/), or your own self-hosted version of ntfy from within a desktop application which utilizes Electron as the wrapper.

This version of ntfy-electron is based on the initial version created by xdpirate, however, this version brings some changes in functionality, as well as some additional edits that I personally needed.

<br />

---

<br />

# Features
- Complete access to ntfy.sh and self-hosted instances
- Minimize application to tray and out of taskbar
  - Close button will minimize to tray and remove from taskbar
  - Right-click tray icon to restore or quit
- API access to push notifications
- Shortcut keybinds

<br />

---

<br />

# Key Binds
The following keybinds can be used within ntfy-electron:

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

<br />

---

<br />

# CLI Arguments
| Argument | Description |
| --- | --- |
| `--hidden` | Start ntfy-electron hidden, suitable for autostarting on login/boot |


<br />

---

<br />

# Build
To build this app, run the following commands:

## Linux
```shell
git clone https://github.com/Aetherinox/ntfy-electron.git
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
git clone https://github.com/Aetherinox/ntfy-electron.git
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
[link-npmtrends]: http://npmtrends.com/ntfy-electron
<!-- BADGE > VERSION > GITHUB -->
[badge-version-gh]: https://img.shields.io/github/v/tag/Aetherinox/ntfy-electron?logo=GitHub&label=Version&color=ba5225
[link-version-gh]: https://github.com/Aetherinox/ntfy-electron/releases
<!-- BADGE > VERSION > NPMJS -->
[badge-version-npm]: https://img.shields.io/npm/v/ntfy-electron?logo=npm&label=Version&color=ba5225
[link-version-npm]: https://npmjs.com/package/ntfy-electron
<!-- BADGE > LICENSE -->
[badge-license-mit]: https://img.shields.io/badge/MIT-FFF?logo=creativecommons&logoColor=FFFFFF&label=License&color=9d29a0
[link-license-mit]: https://github.com/Aetherinox/ntfy-electron/blob/main/LICENSE
<!-- BADGE > BUILD -->
[badge-build]: https://img.shields.io/github/actions/workflow/status/Aetherinox/ntfy-electron/release-npm.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
[link-build]: https://github.com/Aetherinox/ntfy-electron/actions/workflows/release-npm.yml
<!-- BADGE > DOWNLOAD COUNT -->
[badge-downloads-gh]: https://img.shields.io/github/downloads/Aetherinox/ntfy-electron/total?logo=github&logoColor=FFFFFF&label=Downloads&color=376892
[link-downloads-gh]: https://github.com/Aetherinox/ntfy-electron/releases
[badge-downloads-npm]: https://img.shields.io/npm/dw/%40aetherinox%2Fmarked-alert-fa?logo=npm&&label=Downloads&color=376892
[link-downloads-npm]: https://npmjs.com/package/ntfy-electron
<!-- BADGE > DOWNLOAD SIZE -->
[badge-size-gh]: https://img.shields.io/github/repo-size/Aetherinox/ntfy-electron?logo=github&label=Size&color=59702a
[link-size-gh]: https://github.com/Aetherinox/ntfy-electron/releases
[badge-size-npm]: https://img.shields.io/npm/unpacked-size/ntfy-electron/latest?logo=npm&label=Size&color=59702a
[link-size-npm]: https://npmjs.com/package/ntfy-electron
<!-- BADGE > COVERAGE -->
[badge-coverage]: https://img.shields.io/codecov/c/github/Aetherinox/ntfy-electron?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
[link-coverage]: https://codecov.io/github/Aetherinox/ntfy-electron
<!-- BADGE > ALL CONTRIBUTORS -->
[badge-all-contributors]: https://img.shields.io/github/all-contributors/Aetherinox/ntfy-electron?logo=contributorcovenant&color=de1f6f&label=contributors
[link-all-contributors]: https://github.com/all-contributors/all-contributors
[badge-tests]: https://img.shields.io/github/actions/workflow/status/Aetherinox/marked-alert-fa/npm-tests.yml?logo=github&label=Tests&color=2c6488
[link-tests]: https://github.com/Aetherinox/ntfy-electron/actions/workflows/tests.yml
[badge-commit]: https://img.shields.io/github/last-commit/Aetherinox/ntfy-electron?logo=conventionalcommits&logoColor=FFFFFF&label=Last%20Commit&color=313131
[link-commit]: https://github.com/Aetherinox/ntfy-electron/commits/main/
<!-- prettier-ignore-end -->