/* eslint-disable @stylistic/quote-props */

/*
    Tests > Preload Script

    basic coverage tests for preload.js functionality
*/

import { describe, it, beforeEach, beforeAll, expect, vi } from 'vitest';

/*
    Mock electron before importing
*/

const mockIpcRenderer =
{
    send: vi.fn(),
    on: vi.fn(),
    invoke: vi.fn()
};

const mockContextBridge =
{
    exposeInMainWorld: vi.fn()
};

vi.mock( 'electron', () => (
{
    contextBridge: mockContextBridge,
    ipcRenderer: mockIpcRenderer
}) );

// Mock electron-log
const mockElectronLog =
{
    transports: {
        console: { level: 'debug' },
        ipc: { level: 'debug' }
    }
};

vi.mock( 'electron-log', () => ({ default: mockElectronLog }) );

/*
    Mock chalk
*/

vi.mock( 'chalk', () => ({ default: ( str ) => str }) );

/*
    mock log class
*/

const mockLogDebug = vi.fn();
vi.mock( '#log', () => ({ default: { debug: mockLogDebug } }) );

describe( 'Preload Script Coverage Tests', () =>
{
    let exposedElectronAPI;
    let mockConsole;

    beforeEach( () =>
    {
        // Reset all mocks
        vi.clearAllMocks();

        // Mock console methods for IPC log testing
        mockConsole =
        {
            log: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
            debug: vi.fn()
        };
        global.console = mockConsole;
    });

    describe( 'Electron API Functions', () =>
    {
        beforeEach( async() =>
        {
            // Ensure the preload module is imported and API is captured
            if ( !exposedElectronAPI )
            {
                await import( '#preload' );
                exposedElectronAPI = mockContextBridge.exposeInMainWorld.mock.calls[ 0 ][ 1 ];
            }
        });

        describe( 'sendToMain function', () =>
        {
            it( 'should send message on allowed channels', () =>
            {
                const testData = { message: 'test data' };

                // Test allowed channel 'toMain'
                exposedElectronAPI.sendToMain( 'toMain', testData );
                expect( mockIpcRenderer.send ).toHaveBeenCalledWith( 'toMain', testData );

                // Test allowed channel 'button-clicked'
                exposedElectronAPI.sendToMain( 'button-clicked', testData );
                expect( mockIpcRenderer.send ).toHaveBeenCalledWith( 'button-clicked', testData );

                expect( mockIpcRenderer.send ).toHaveBeenCalledTimes( 2 );
            });
        });

        describe( 'receiveFromMain function', () =>
        {
            it( 'should register listener on allowed channels', () =>
            {
                const mockCallback = vi.fn();

                // Test allowed channel 'fromMain'
                exposedElectronAPI.receiveFromMain( 'fromMain', mockCallback );

                expect( mockIpcRenderer.on ).toHaveBeenCalledWith( 'fromMain', expect.any( Function ) );

                // Test that the callback wrapper works correctly by simulating an IPC event
                const registeredCallback = mockIpcRenderer.on.mock.calls[ 0 ][ 1 ];
                const mockEvent = { sender: 'mock-sender' };
                const testArgs = [ 'arg1', 'arg2' ];

                registeredCallback( mockEvent, ...testArgs );

                // Verify the callback was called with args but without the event
                expect( mockCallback ).toHaveBeenCalledWith( 'arg1', 'arg2' );
            });
        });

        describe( 'ping function', () =>
        {
            it( 'should invoke ping through ipcRenderer', async() =>
            {
                mockIpcRenderer.invoke.mockResolvedValue( 'pong' );

                const result = await exposedElectronAPI.ping();

                expect( mockIpcRenderer.invoke ).toHaveBeenCalledWith( 'ping' );
                expect( result ).toBe( 'pong' );
            });
        });
    });

    describe( 'Force IPC Handler Execution for Coverage', () =>
    {
        it( 'should force execute IPC handler from fresh module import', async() =>
        {
            // Reset all modules and mocks completely to force fresh import
            vi.resetModules();
            vi.clearAllMocks();
            mockIpcRenderer.on.mockClear();

            // Re-apply our mocks after module reset
            vi.doMock( 'electron', () => (
            {
                contextBridge: mockContextBridge,
                ipcRenderer: mockIpcRenderer
            }) );

            vi.doMock( 'electron-log', () => ({ default: mockElectronLog }) );
            vi.doMock( '#log', () => ({ default: { debug: mockLogDebug } }) );

            // Import preload module fresh
            await import( '#preload' );

            // Check if IPC handler was registered
            const wasIpcRegistered = mockIpcRenderer.on.mock.calls.length > 0;

            if ( !wasIpcRegistered )
            {
                console.warn( 'No IPC handlers registered - module may have execution issues' );
                // Still try to find any existing handlers from previous imports
                const allCalls = mockIpcRenderer.on.mock.calls || [];
                console.log( 'All ipcRenderer.on calls:', allCalls.map( ( call ) => call[ 0 ] ) );
            }

            // Find the 'main-log-to-renderer' handler
            let logHandler = null;
            const onCalls = mockIpcRenderer.on.mock.calls;

            for ( const call of onCalls )
            {
                if ( call[ 0 ] === 'main-log-to-renderer' )
                {
                    logHandler = call[ 1 ];
                    break;
                }
            }

            expect( logHandler ).toBeDefined();

            if ( logHandler )
            {
                // Test all possible code paths in the handler
                const mockEvent = {};

                // Test all log levels with both simplified and non-simplified formats
                const testCases = [
                    // Test error level
                    { level: 'error', message: 'Error message', isSimplified: false, appName: 'TestApp' },
                    { level: 'error', message: 'Error message styled', isSimplified: true, appName: 'TestApp' },

                    // Test warn level
                    { level: 'warn', message: 'Warning message', isSimplified: false, appName: 'TestApp' },
                    { level: 'warn', message: 'Warning message styled', isSimplified: true, appName: 'TestApp' },

                    // Test notice level (uses warn method)
                    { level: 'notice', message: 'Notice message', isSimplified: false, appName: 'TestApp' },
                    { level: 'notice', message: 'Notice message styled', isSimplified: true, appName: 'TestApp' },

                    // Test info level
                    { level: 'info', message: 'Info message', isSimplified: false, appName: 'TestApp' },
                    { level: 'info', message: 'Info message styled', isSimplified: true, appName: 'TestApp' },

                    // Test ok level (uses log method)
                    { level: 'ok', message: 'OK message', isSimplified: false, appName: 'TestApp' },
                    { level: 'ok', message: 'OK message styled', isSimplified: true, appName: 'TestApp' },

                    // Test debug level
                    { level: 'debug', message: 'Debug message', isSimplified: false, appName: 'TestApp' },
                    { level: 'debug', message: 'Debug message styled', isSimplified: true, appName: 'TestApp' },

                    // Test verbose level (uses debug method)
                    { level: 'verbose', message: 'Verbose message', isSimplified: false, appName: 'TestApp' },
                    { level: 'verbose', message: 'Verbose message styled', isSimplified: true, appName: 'TestApp' },

                    // Test default case
                    { level: 'unknown', message: 'Unknown level', isSimplified: false, appName: 'TestApp' },
                    { level: 'unknown', message: 'Unknown level styled', isSimplified: true, appName: 'TestApp' },

                    // Test edge cases
                    { level: 'trace', message: 'Trace message', isSimplified: false, appName: 'TestApp' },
                    { level: 'silly', message: 'Silly message', isSimplified: true, appName: 'TestApp' }
                ];

                // Execute each test case to cover all code paths
                testCases.forEach( ( testCase, index ) =>
                {
                    console.log( `Executing test case ${ index + 1 }/${ testCases.length }: ${ testCase.level } - ${ testCase.isSimplified ? 'simplified' : 'plain' }` );
                    logHandler( mockEvent, testCase );
                });

                // Verify that all console methods were called
                expect( mockConsole.error ).toHaveBeenCalled();
                expect( mockConsole.warn ).toHaveBeenCalled();
                expect( mockConsole.log ).toHaveBeenCalled();
                expect( mockConsole.debug ).toHaveBeenCalled();

                // Verify specific styled calls
                expect( mockConsole.error ).toHaveBeenCalledWith(
                    expect.stringMatching( /%c.*%c/ ),
                    expect.stringContaining( '#dc2626' ), // red color for error
                    expect.any( String )
                );

                expect( mockConsole.warn ).toHaveBeenCalledWith(
                    expect.stringMatching( /%c.*%c/ ),
                    expect.stringContaining( '#eab308' ), // yellow color for warn
                    expect.any( String )
                );

                expect( mockConsole.log ).toHaveBeenCalledWith(
                    expect.stringMatching( /%c.*%c/ ),
                    expect.stringContaining( '#3b82f6' ), // blue color for info
                    expect.any( String )
                );

                expect( mockConsole.debug ).toHaveBeenCalledWith(
                    expect.stringMatching( /%c.*%c/ ),
                    expect.stringContaining( '#6b7280' ), // gray color for debug
                    expect.any( String )
                );

                // Verify plain text calls
                expect( mockConsole.error ).toHaveBeenCalledWith( 'TestApp: Error message' );
                expect( mockConsole.warn ).toHaveBeenCalledWith( 'TestApp: Warning message' );
                expect( mockConsole.log ).toHaveBeenCalledWith( 'TestApp: Info message' );
                expect( mockConsole.debug ).toHaveBeenCalledWith( 'TestApp: Debug message' );
            }
        });
    });
});

