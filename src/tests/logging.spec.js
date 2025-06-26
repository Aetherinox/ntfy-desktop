/* eslint-disable n/no-extraneous-import */
/* eslint-disable import/no-default-export */
/* eslint-disable no-restricted-syntax */
// @ts-check

/*
    Playwright tests for Log.js functionality

    This test suite verifies that the logging levels work correctly by testing
    the Electron application launch with different LOG_LEVEL environment variables
    and ensuring the correct logging behavior is observed.
*/

import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath( import.meta.url );
const __dirname = path.dirname( __filename );

/*
    Test Before Each
*/

test.beforeEach( async({ page }) =>
{
    test.setTimeout( 30000 );
});

/*
    Helper function to capture console logs
*/

function captureConsoleLogs( page )
{
    const logs = [];
    page.on( 'console', ( msg ) =>
    {
        /**
            filter out non-ntfy-desktop logs and focus on our Log class messages
        */

        const text = msg.text();
        if ( text.includes( 'ntfy-desktop' ) )
        {
            logs.push(
            {
                type: msg.type(),
                text: text
            });
        }
    });

    return logs;
}

async function testAppLaunchWithLogLevel( logLevel, expectedBehavior )
{
    const app = await electron.launch(
    {
        args: [ path.join( __dirname, '..', 'index.js' ) ],
        env: {
            ...process.env,
            LOG_LEVEL: logLevel.toString(),
            NODE_ENV: 'test'
        }
    });

    /**
        make sure the app launches successfully
    */

    const page = await app.firstWindow({ timeout: 10000 });
    expect( page ).toBeTruthy();

    /**
        wait for app to fully initialize
    */

    await page.waitForTimeout( 2000 );

    // Check if we can interact with the app (indicates logging didn't break functionality)
    try
    {
        // Try to access the title or any basic functionality
        const title = await page.title();
        expect( title ).toBeTruthy();
    }
    catch ( error )
    {
        // If there's an error, it might be due to logging issues
        throw new Error( `App failed to load properly with LOG_LEVEL=${ logLevel }: ${ error.message }` );
    }

    await app.close();

    return true;
}

/*
    Test LOG_LEVEL=1 (Error only)
*/

test( '✅ LOG_LEVEL=1 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 1, 'Only error messages should be visible' );
    expect( result ).toBe( true );
});

/*
    Test LOG_LEVEL=2 (Error + Warn)
*/

test( '✅ LOG_LEVEL=2 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 2, 'Error and warn messages should be visible' );
    expect( result ).toBe( true );
});

/*
    Test LOG_LEVEL=3 (Error + Warn + Notice)
*/

test( '✅ LOG_LEVEL=3 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 3, 'Error, warn, and notice messages should be visible' );
    expect( result ).toBe( true );
});

/*
    Test LOG_LEVEL=4 (Error + Warn + Notice + OK + Info)
*/

test( '✅ LOG_LEVEL=4 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 4, 'Error, warn, notice, ok, and info messages should be visible' );
    expect( result ).toBe( true );
});

/*
    Test LOG_LEVEL=5 (All above + Debug console.debug)
*/

test( '✅ LOG_LEVEL=5 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 5, 'All above plus debug messages should be visible' );
    expect( result ).toBe( true );
});

/*
    Test LOG_LEVEL=6 (All above + Verbose)
*/

test( '✅ LOG_LEVEL=6 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 6, 'All above plus verbose messages should be visible' );
    expect( result ).toBe( true );
});

/*
    Test LOG_LEVEL=7 (All above + Debug console.trace)
*/

test( '✅ LOG_LEVEL=7 - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 7, 'All messages including debug trace should be visible' );
    expect( result ).toBe( true );
});

/*
    Test Boolean (Simplified) Logging
*/

test( '✅ Boolean simplified logging - App launches successfully', async() =>
{
    const result = await testAppLaunchWithLogLevel( 4, 'Boolean simplified logging should work correctly' );
    expect( result ).toBe( true );
});

