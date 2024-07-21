<div align="center">
<h6>Desktop Client</h6>
<h1>♾️ ntfy-electron ♾️</h1>

<br />

<p>A ntfy.sh desktop client built with Electron which supports Windows, Linux, and MacOSX. This client rests in your taskbar tray and allows you to receive push notifications to your desktop without requiring you to leave your browser open.</p>

<br />

<img src="https://github.com/user-attachments/assets/74963e6d-d8ca-4aaa-b893-3b5472794c30" width="630">

<br />

<img src="https://github.com/user-attachments/assets/18b349fb-d88d-4d63-9de4-ed3024df4d6f" width="630">


<br />
<br />

</div>

<div align="center">

<!-- prettier-ignore-start -->
[![Version][github-version-img]][github-version-uri]
[![Build Status][github-build-img]][github-build-uri]
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
  - [ntfy](#ntfy)
- [Features](#features)
- [Key Binds](#key-binds)
- [CLI Arguments](#cli-arguments)
- [Build](#build)
  - [Linux](#linux)
  - [Windows](#windows)
  - [Contributors ✨](#contributors-)


<br />

---

<br />

# About
This project allows you to access the official free / paid notification service [ntfy.sh](https://ntfy.sh/), or your own self-hosted version of ntfy from within a desktop application which utilizes Electron as the wrapper.

<br />

## ntfy
[ntfy.sh](https://ntfy/) (pronounced "notify") is a simple HTTP-based pub-sub notification service. With ntfy, you can send notifications to your phone or desktop via scripts from any computer, without having to sign up or pay any fees. If you'd like to run your own instance of the service, you can easily do so since ntfy is open source.

<br />

<div align="center">

[![View](https://img.shields.io/badge/%20-%20View%20Project%20Repo-%20%23de2343?style=for-the-badge&logo=github&logoColor=FFFFFF)](https://github.com/binwiederhier/ntfy)

</div>

<br />

---

<br />

# Features
- Usable with ntfy.sh and self-hosted instances
- Two modes for minimizing app, configure in settings
  1. Close button exits app completely, sits in taskbar and tray
  2. Close button sends app to tray. Right-click tray icon to quit / show app
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

---

<br />

# CLI Arguments
This client 

<br />

| Argument | Description | Available as setting |
| --- | --- | --- |
| `--hidden` | Start app hidden in tray, suitable for auto-starting on login/boot | ✅ |
| `--hotkey` | Start app with hotkeys enabled | ✅ |
| `--quit` | Top-right close button will completely exit app instead of minimize to tray | ✅ |
| `--dev` | Start app with developer tools in `App` menu | ✅ |

<br />

If you are running ntfy-electron from node, you can pass arguments using the following example:
```shell ignore
npm run start -- --hidden
```

<br />

---

<br />

# Build
To build this app, run the following commands:

## Linux
```shell
git clone https://github.com/xdpirate/ntfy-electron.git
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
git clone https://github.com/xdpirate/ntfy-electron.git
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

<br />

---

<br />

## Contributors ✨
We are always looking for contributors. If you feel that you can provide something useful to Gistr, then we'd love to review your suggestion. Before submitting your contribution, please review the following resources:

- [Pull Request Procedure](.github/PULL_REQUEST_TEMPLATE.md)
- [Contributor Policy](CONTRIBUTING.md)

<br />

Want to help but can't write code?
- Review [active questions by our community](https://github.com/xdpirate/ntfy-electron/labels/help%20wanted) and answer the ones you know.

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
      <td align="center" valign="top"><a href="https://gitlab.com/Aetherinox"><img src="https://avatars.githubusercontent.com/u/1757462?v=4&s=40" width="80px;" alt="xdpirate"/><br /><sub><b>xdpirate</b></sub></a><br /><a href="https://github.com/xdpirate/ntfy-electron/commits?author=xdpirate" title="Code">💻</a> <a href="#projectManagement-xdpirate" title="Project Management">📆</a></td>
      <td align="center" valign="top"><a href="https://gitlab.com/Aetherinox"><img src="https://avatars.githubusercontent.com/u/118329232?v=4?s=40" width="80px;" alt="Aetherinox"/><br /><sub><b>Aetherinox</b></sub></a><br /><a href="https://github.com/xdpirate/ntfy-electron/commits?author=Aetherinox" title="Code">💻</a></td>
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
  [general-npmtrends-uri]: http://npmtrends.com/ntfy-electron

<!-- BADGE > VERSION > GITHUB -->
  [github-version-img]: https://img.shields.io/github/v/tag/xdpirate/ntfy-electron?logo=GitHub&label=Version&color=ba5225
  [github-version-uri]: https://github.com/xdpirate/ntfy-electron/releases

<!-- BADGE > VERSION > NPMJS -->
  [npm-version-img]: https://img.shields.io/npm/v/ntfy-electron?logo=npm&label=Version&color=ba5225
  [npm-version-uri]: https://npmjs.com/package/ntfy-electron

<!-- BADGE > VERSION > PYPI -->
  [pypi-version-img]: https://img.shields.io/pypi/v/ntfy-electron-plugin
  [pypi-version-uri]: https://pypi.org/project/ntfy-electron-plugin/

<!-- BADGE > LICENSE > MIT -->
  [license-mit-img]: https://img.shields.io/badge/MIT-FFF?logo=creativecommons&logoColor=FFFFFF&label=License&color=9d29a0
  [license-mit-uri]: https://github.com/xdpirate/ntfy-electron/blob/main/LICENSE

<!-- BADGE > GITHUB > DOWNLOAD COUNT -->
  [github-downloads-img]: https://img.shields.io/github/downloads/xdpirate/ntfy-electron/total?logo=github&logoColor=FFFFFF&label=Downloads&color=376892
  [github-downloads-uri]: https://github.com/xdpirate/ntfy-electron/releases

<!-- BADGE > NPMJS > DOWNLOAD COUNT -->
  [npmjs-downloads-img]: https://img.shields.io/npm/dw/%40aetherinox%2Fmkdocs-link-embeds?logo=npm&&label=Downloads&color=376892
  [npmjs-downloads-uri]: https://npmjs.com/package/ntfy-electron

<!-- BADGE > GITHUB > DOWNLOAD SIZE -->
  [github-size-img]: https://img.shields.io/github/repo-size/xdpirate/ntfy-electron?logo=github&label=Size&color=59702a
  [github-size-uri]: https://github.com/xdpirate/ntfy-electron/releases

<!-- BADGE > NPMJS > DOWNLOAD SIZE -->
  [npmjs-size-img]: https://img.shields.io/npm/unpacked-size/ntfy-electron/latest?logo=npm&label=Size&color=59702a
  [npmjs-size-uri]: https://npmjs.com/package/ntfy-electron

<!-- BADGE > CODECOV > COVERAGE -->
  [codecov-coverage-img]: https://img.shields.io/codecov/c/github/xdpirate/ntfy-electron?token=MPAVASGIOG&logo=codecov&logoColor=FFFFFF&label=Coverage&color=354b9e
  [codecov-coverage-uri]: https://codecov.io/github/xdpirate/ntfy-electron

<!-- BADGE > ALL CONTRIBUTORS -->
  [contribs-all-img]: https://img.shields.io/github/all-contributors/xdpirate/ntfy-electron?logo=contributorcovenant&color=de1f6f&label=contributors
  [contribs-all-uri]: https://github.com/all-contributors/all-contributors

<!-- BADGE > GITHUB > BUILD > NPM -->
  [github-build-img]: https://img.shields.io/github/actions/workflow/status/xdpirate/ntfy-electron/npm-release.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
  [github-build-uri]: https://github.com/xdpirate/ntfy-electron/actions/workflows/npm-release.yml

<!-- BADGE > GITHUB > BUILD > Pypi -->
  [github-build-pypi-img]: https://img.shields.io/github/actions/workflow/status/xdpirate/ntfy-electron/release-pypi.yml?logo=github&logoColor=FFFFFF&label=Build&color=%23278b30
  [github-build-pypi-uri]: https://github.com/xdpirate/ntfy-electron/actions/workflows/pypi-release.yml

<!-- BADGE > GITHUB > TESTS -->
  [github-tests-img]: https://img.shields.io/github/actions/workflow/status/xdpirate/ntfy-electron/npm-tests.yml?logo=github&label=Tests&color=2c6488
  [github-tests-uri]: https://github.com/xdpirate/ntfy-electron/actions/workflows/npm-tests.yml

<!-- BADGE > GITHUB > COMMIT -->
  [github-commit-img]: https://img.shields.io/github/last-commit/xdpirate/ntfy-electron?logo=conventionalcommits&logoColor=FFFFFF&label=Last%20Commit&color=313131
  [github-commit-uri]: https://github.com/xdpirate/ntfy-electron/commits/main/

<!-- prettier-ignore-end -->
<!-- markdownlint-restore -->
