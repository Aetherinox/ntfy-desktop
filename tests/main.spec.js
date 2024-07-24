/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
// @ts-check

/*
    These tests require the additional package `https://github.com/spaceagetv/electron-playwright-helpers`
    Includes the following:
        clickMenuItemById,
        findLatestBuild,
        ipcMainCallFirstListener,
        ipcRendererCallFirstListener,
        parseElectronApp,
        ipcMainInvokeHandler,
        ipcRendererInvoke

    Examples available at: https://github.com/spaceagetv/electron-playwright-example
*/

const { test, expect, _electron: electron } = require( '@playwright/test' )
const eph = require( 'electron-playwright-helpers' )
import jimp from 'jimp'

/*
    Test > ensure ntfy-desktop launches
*/

test( 'launch ntfy-desktop', async () =>
{
    const app = await electron.launch( {
        args: [
            'index.js',
            '--quit'
        ],
        env: {
            ...process.env,
            NODE_ENV: 'development'
        }
    } )

    /*
    const appInfo = eph.parseElectronApp('./build/ntfy-electron-win32-x64')
    console.log(appInfo.name);
    */

    await app.close()
} )

