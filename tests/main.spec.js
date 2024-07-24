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
        args: [
            'index.js',
            '--quit'
        ],
        env: {
            ...process.env,
            NODE_ENV: 'development',
        },
    });

    /*
    const appInfo = eph.parseElectronApp('./build/ntfy-electron-win32-x64')
    console.log(appInfo.name);
    */

    await app.close()
})

/*
    Test > full loadup and screenshot
*/

test('full load', async () => {

    /*
        Initialize
    */

    const app = await electron.launch({
        args: [
            'index.js',
            '--quit'
        ],
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

    /*
        wait for #root div before taking screenshot
    */

    await window.waitForSelector('#root', { state: 'visible' });

    /*
        path: `e2e/screenshots/test-${timestamp}.png`,
    */

    const ss1 = await window.screenshot({ path: './test-results/1.png' })

    /*
        Since the close button minimizes to tray, activate the menu and select quit
    */

    await eph.clickMenuItemById(app, 'quit');
    await app.close()
})

/*
    Test functionality
*/

test('app usage', async () => {

    /*
        Initialize
    */

    const app = await electron.launch({
        args: [
            'index.js',
            '--quit'
        ],
        env: {
            ...process.env,
            NODE_ENV: 'development',
        },
    });

    /*
        test functionality through app
    */

    const page = await app.firstWindow()
    await page.getByLabel('Sign in').click();
    await page.getByLabel('Username *').click();
    await page.getByLabel('Username *').fill('testuser');
    await page.getByLabel('Password *').click();
    await page.getByLabel('Password *').fill('123456789');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.getByText('Login failed: Invalid').click();

    /*
        get expectation
    */

    expect(page.getByText("Login failed: Invalid")).toBeVisible();

    const window = await app.firstWindow()
    console.log(await window.title());
    window.on('console', console.log);

    /*
        wait for #root div before taking screenshot
    */

    await window.waitForSelector('#root', { state: 'visible' });

    /*
        path: `e2e/screenshots/test-${timestamp}.png`,
    */

    const ss1 = await window.screenshot({ path: './test-results/3.png' })

    /*
        Since the close button minimizes to tray, activate the menu and select quit
    */

    await eph.clickMenuItemById(app, 'quit');
    await app.close()
});

