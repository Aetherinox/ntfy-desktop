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

const { test, expect, _electron: electron } = require('@playwright/test')
const eph = require('electron-playwright-helpers')
import jimp from 'jimp'


/*
    Test > ensure ntfy-desktop launches
*/

test('launch ntfy-desktop', async () => {
    const app = await electron.launch({
        args: ['index.js'],
        env: {
        ...process.env,
        NODE_ENV: 'development',
        },
    });

    await app.close()
})

/*
    Test > full loadup and screenshot
*/

test('full load', async () => {
    const app = await electron.launch({
        args: ['index.js', '--quit'],
        env: {
        ...process.env,
        NODE_ENV: 'development',
        },
    });

    const timestamp = Date.now().toString();

    const appPath = await app.evaluate(async ({ app }) => {
        return app.getAppPath();
    });

    console.log(appPath);

    const window = await app.firstWindow()
    console.log(await window.title());
    window.on('console', console.log);

    // wait for #root div before taking screenshot
    await window.waitForSelector('#root', { state: 'visible' });

    /*
        path: `e2e/screenshots/test-${timestamp}.png`,
    */

    const ss1 = await window.screenshot({ path: './test-results/1.png' })

    // close app
    await eph.clickMenuItemById(app, 'quit');
})
