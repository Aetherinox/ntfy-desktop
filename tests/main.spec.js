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
    const app = await electron.launch({ args: ['index.js'] })
    await app.close()
})

/*
    Test > full loadup and screenshot
*/

test('full load', async () => {
    const app = await electron.launch({ args: ['index.js'] })

    const appPath = await app.evaluate(async ({ app }) => {
        return app.getAppPath();
    });
    console.log(appPath);

    const window = await app.firstWindow()
    console.log(await window.title());
    window.on('console', console.log);

    // wait for #root div before taking screenshot
    await window.waitForSelector('#root', { state: 'visible' });
    const ss1 = await window.screenshot({ path: './test-results/1.png' })
    const ss1Hash = (await jimp.read(ss1)).hash()
    const ss2 = await window.screenshot({ path: './test-results/2.png' })
    const ss2Hash = (await jimp.read(ss2)).hash()
    expect(ss1Hash).toEqual(ss2Hash)

    // close app
    await eph.clickMenuItemById(app, 'quit');
})