/**
    Tests > Logging
*/

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Log from '#log';

/*
    mock console methods so we can capture outputs
*/

const createConsoleMock = () =>
{
    const mocks = {};
    const consoleMethods = [ 'error', 'warn', 'log', 'info', 'debug', 'trace' ];

    consoleMethods.forEach( ( method ) =>
    {
        const original = console[ method ];
        const calls = [];
        console[ method ] = ( ...args ) => calls.push( args );
        mocks[ method ] = { calls, original, restore: () => ( console[ method ] = original ) };
    });

    return {
        ...mocks,
        restoreAll: () => consoleMethods.forEach( ( method ) => mocks[ method ].restore() )
    };
};

/*
    Test > Log Functionality
*/

describe( 'Log Functionality Tests', () =>
{
    let consoleMock;
    const originalLogLevel = process.env.LOG_LEVEL;
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach( () =>
    {
        // Set to development mode to enable console output
        process.env.NODE_ENV = 'development';
        consoleMock = createConsoleMock();
    });

    afterEach( () =>
    {
        consoleMock.restoreAll();
        // Restore original environment variables
        process.env.LOG_LEVEL = originalLogLevel;
        process.env.NODE_ENV = originalNodeEnv;
    });

    it( 'should only log errors at LOG_LEVEL=1', () =>
    {
        process.env.LOG_LEVEL = '1';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBe( 0 );
        expect( consoleMock.log.calls.length ).toBe( 0 );
        expect( consoleMock.info.calls.length ).toBe( 0 );
        expect( consoleMock.debug.calls.length ).toBe( 0 );
        expect( consoleMock.trace.calls.length ).toBe( 0 );

        consoleMock.restoreAll();
    });

    it( 'should log errors and warnings at LOG_LEVEL=2', () =>
    {
        process.env.LOG_LEVEL = '2';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.log.calls.length ).toBe( 0 );
        expect( consoleMock.info.calls.length ).toBe( 0 );
        expect( consoleMock.debug.calls.length ).toBe( 0 );
        expect( consoleMock.trace.calls.length ).toBe( 0 );

        consoleMock.restoreAll();
    });

    it( 'should log errors, warnings, and notices at LOG_LEVEL=3', () =>
    {
        process.env.LOG_LEVEL = '3';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBeGreaterThan( 0 );

        /*
            notice() uses console.log
        */

        expect( consoleMock.log.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.info.calls.length ).toBe( 0 );
        expect( consoleMock.debug.calls.length ).toBe( 0 );
        expect( consoleMock.trace.calls.length ).toBe( 0 );

        consoleMock.restoreAll();
    });

    it( 'should log errors, warnings, notices, ok, and info at LOG_LEVEL=4', () =>
    {
        process.env.LOG_LEVEL = '4';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBeGreaterThan( 0 );

        /*
            notice() and ok() use console.log, info() uses console.info
        */

        expect( consoleMock.log.calls.length ).toBeGreaterThan( 0 ); // notice + ok
        expect( consoleMock.info.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.debug.calls.length ).toBe( 0 );
        expect( consoleMock.trace.calls.length ).toBe( 0 );

        consoleMock.restoreAll();
    });

    it( 'should log all above plus debug at LOG_LEVEL=5', () =>
    {
        process.env.LOG_LEVEL = '5';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.log.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.info.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.debug.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.trace.calls.length ).toBe( 0 );

        consoleMock.restoreAll();
    });

    it( 'should log all above plus verbose at LOG_LEVEL=6', () =>
    {
        process.env.LOG_LEVEL = '6';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.log.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.info.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.debug.calls.length ).toBeGreaterThan( 0 ); // debug + verbose
        expect( consoleMock.trace.calls.length ).toBe( 0 );

        consoleMock.restoreAll();
    });

    it( 'should log all messages including trace at LOG_LEVEL=7', () =>
    {
        process.env.LOG_LEVEL = '7';

        Log.error( 'TEST_ERROR' );
        Log.warn( 'TEST_WARN' );
        Log.notice( 'TEST_NOTICE' );
        Log.ok( 'TEST_OK' );
        Log.info( 'TEST_INFO' );
        Log.debug( 'TEST_DEBUG' );
        Log.verbose( 'TEST_VERBOSE' );

        expect( consoleMock.error.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.warn.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.log.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.info.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.debug.calls.length ).toBeGreaterThan( 0 );
        expect( consoleMock.trace.calls.length ).toBeGreaterThan( 0 );

        consoleMock.restoreAll();
    });
});
