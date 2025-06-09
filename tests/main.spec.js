/* eslint-disable import/no-default-export */
/* eslint-disable no-restricted-syntax */
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

import { test, expect, defineConfig, devices } from '@playwright/test';
import { _electron as electron } from 'playwright'
import * as eph from 'electron-playwright-helpers';

export default defineConfig(
{
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices[ 'Desktop Chrome' ],
                channel: 'chromium'
            }
        }
    ]
});

/*
    Test > ensure ntfy-desktop launches
*/

test( '✅ launch ntfy-desktop for first time', async() =>
{
    const app = await electron.launch({
        args: [
            'index.js',
            '--quit'
        ],
        env: {
            ...process.env,
            NODE_ENV: 'development'
        }
    });

    /*
    const appInfo = eph.parseElectronApp('./build/ntfy-electron-win32-x64')
    console.log(appInfo.name);
    */

    await app.close();
});

/*
    Test > full loadup and screenshot
*/

test( '✅ ensure interface can fully load', async() =>
{
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
            NODE_ENV: 'development'
        }
    });

    /*
        define > defaults
    */

    const ts = Date.now().toString();
    const ss1Path = `test-results/fullload_${ ts }.png`;
    const appPath = await app.evaluate( async({ app }) =>
    {
        return app.getAppPath();
    });

    console.log( `✅ Loading App Path: ${ appPath }` );

    /*
        Load first window
    */

    const page = await app.firstWindow({ timeout: 120000 });
    console.log( `✅ Loading App Window: ${ await page.title() }` );
    page.on( 'console', console.log );

    /*
        wait for #root div to be fully loaded
    */

    await page.waitForSelector( '#root', { state: 'visible' });

    /*
        Test Window > About
    */

    await eph.clickMenuItemById( app, 'about' );
    const windowAbout = await app.waitForEvent( 'window' );
    expect( windowAbout ).toBeTruthy();
    expect( await windowAbout.title() ).toBe( 'About' );
    console.log( `✅ Open New Window: ${ await windowAbout.title() }` );
    windowAbout.on( 'console', console.log );
    await windowAbout.close();

    /*
        take screenshot of interface
    */

    const screenshot = await page.screenshot({ type: 'png', path: `${ ss1Path }` });
    if ( screenshot )
        console.log( `✅ Saved screenshot: ${ ss1Path }` );
    else
        throw Error( `❌ Unable to take screenshot for test: ${ ss1Path }` );

    /*
        since the close button minimizes to tray, activate the menu and select quit
    */

    await eph.clickMenuItemById( app, 'quit' );
    await app.close();
});

/*
    Test functionality
*/

test( '✅ fail to sign into invalid account', async() =>
{
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
            NODE_ENV: 'development'
        }
    });

    /*
        test functionality through app
    */

    const page = await app.firstWindow();
    await page.getByLabel( 'Sign in' ).click();
    await page.getByLabel( 'Username *' ).click();
    await page.getByLabel( 'Username *' ).fill( 'testuser' );
    await page.getByLabel( 'Password *' ).click();
    await page.getByLabel( 'Password *' ).fill( '123456789' );
    await page.getByRole( 'button', { name: 'Sign in' }).click();
    await page.getByText( 'Login failed: Invalid' ).click();

    /*
        get expectation
    */

    expect( page.getByText( 'Login failed: Invalid' ) ).toBeVisible();

    const window = await app.firstWindow();
    console.log( await window.title() );
    window.on( 'console', console.log );

    /*
        wait for #root div before taking screenshot
    */

    await window.waitForSelector( '#root', { state: 'visible' });

    /*
        path: `e2e/screenshots/test-${timestamp}.png`,
    */

    const ss1 = await window.screenshot({ path: './test-results/3.png' });

    /*
        Since the close button minimizes to tray, activate the menu and select quit
    */

    await eph.clickMenuItemById( app, 'quit' );
    await app.close();
});
