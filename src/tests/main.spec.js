/* eslint-disable n/no-extraneous-import */
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
import { _electron as electron } from 'playwright';
import * as eph from 'electron-playwright-helpers';

/*
    Run individual tests by using
        npx playwright test --project=firefox
*/

export default defineConfig(
{
    projects: [
        /* Test against desktop browsers */
        {
            name: 'chromium',
            use: { ...devices[ 'Desktop Chrome' ], channel: 'chromium' }
        },
        {
            name: 'firefox',
            use: { ...devices[ 'Desktop Firefox' ] }
        },
        {
            name: 'webkit',
            use: { ...devices[ 'Desktop Safari' ] }
        },
        /* Test against mobile viewports. */
        {
            name: 'Mobile Chrome',
            use: { ...devices[ 'Pixel 5' ] }
        },
        {
            name: 'Mobile Safari',
            use: { ...devices[ 'iPhone 12' ] }
        },
        /* Test against branded browsers. */
        {
            name: 'Google Chrome',
            use: { ...devices[ 'Desktop Chrome' ], channel: 'chromium' } // or 'chrome-beta'
        },
        {
            name: 'Microsoft Edge',
            use: { ...devices[ 'Desktop Edge' ], channel: 'msedge' } // or 'msedge-dev'
        }
    ]
});

/*
    Test Before Each
*/

test.beforeEach( async({ page }) =>
{
    test.setTimeout( 70000 );
});

/*
    Test > ensure ntfy-desktop launches
*/

test( '✅ launch ntfy-desktop for first time', async({ playwright, browserName }) =>
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

test( '✅ ensure interface can fully load', async({ playwright, browserName }) =>
{
    test.skip( browserName === 'chromium', 'Test skipped for Chromium' );

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

    /*
        take screenshot of interface
    */

    const ts1 = Date.now().toString();
    const ss1Path = `test-results/ntfy_capture_${ ts1 }.png`;
    const ss1Obj = await windowAbout.screenshot({ type: 'png', path: `${ ss1Path }` });
    if ( ss1Obj )
        console.log( `✅ Saved screenshot: ${ ss1Path }` );
    else
        throw Error( `❌ Unable to take screenshot for test: ${ ss1Path }` );

    /*
        Close Window > About
    */

    await windowAbout.close();

    /*
        take screenshot of interface
    */

    const ts2 = Date.now().toString();
    const ss2Path = `test-results/ntfy_capture_${ ts2 }.png`;
    const ss2Obj = await page.screenshot({ type: 'png', path: `${ ss2Path }` });
    if ( ss2Obj )
        console.log( `✅ Saved screenshot: ${ ss2Path }` );
    else
        throw Error( `❌ Unable to take screenshot for test: ${ ss2Path }` );

    /*
        since the close button minimizes to tray, activate the menu and select quit
    */

    await eph.clickMenuItemById( app, 'quit' );
    await app.close();
});

/*
    Test functionality
*/

test( '✅ fail to sign into invalid account', async({ playwright, browserName }) =>
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

    const ts3 = Date.now().toString();
    const ss3Path = `test-results/ntfy_capture_${ ts3 }.png`;
    const ss3Obj = await page.screenshot({ type: 'png', path: `${ ss3Path }` });
    if ( ss3Obj )
        console.log( `✅ Saved screenshot: ${ ss3Path }` );
    else
        throw Error( `❌ Unable to take screenshot for test: ${ ss3Path }` );


    /*
        Since the close button minimizes to tray, activate the menu and select quit
    */

    await eph.clickMenuItemById( app, 'quit' );
    await app.close();
});
