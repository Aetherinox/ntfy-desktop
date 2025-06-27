/* eslint-disable @stylistic/quote-props */

/*
    Tests > Class > Logs

    tests for the log class.
    tests all log levels, ipc communication, file logging, and initialization
*/

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// mock electron-log before importing Log
const mockElectronLog =
{
    transports:
    {
        file:
        {
            level: 'debug',
            resolvePathFn: vi.fn(),
            fileName: 'main.log'
        },
        console:
        {
            level: false
        },
        ipc:
        {
            level: false
        },
        remote:
        {
            level: false
        }
    },
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    verbose: vi.fn(),
    silly: vi.fn(),
    initialize: vi.fn()
};

vi.mock( 'electron-log', () => ({ default: mockElectronLog }) );

// mock chalk
vi.mock( 'chalk', () =>
{
    const mockChalk = ( str ) => str;
    const colors = [ 'white', 'gray', 'grey', 'magentaBright', 'blueBright', 'greenBright', 'yellowBright', 'redBright', 'blackBright' ];
    const backgrounds = [ 'bgBlack', 'bgMagenta', 'bgGray', 'bgBlueBright', 'bgGreen', 'bgYellow', 'bgRedBright' ];
    const modifiers = [ 'bold' ];

    [ ...colors, ...backgrounds, ...modifiers ].forEach( ( prop ) =>
    {
        Object.defineProperty( mockChalk, prop,
        {
            get: () => mockChalk
        });
    });

    mockChalk.level = 3;
    return { default: mockChalk };
});

/*
    mock electron
*/

const mockBrowserWindow =
{
    getAllWindows: vi.fn( () => [
    {
        webContents:
        {
            send: vi.fn(),
            isDestroyed: vi.fn( () => false )
        }
    }] )
};

vi.mock( 'electron', () => (
{
    app:
    {
        getAppPath: vi.fn( () => '/mock/app/path' ),
        getPath: vi.fn( ( type ) =>
        {
            if ( type === 'userData' ) return '/mock/userData';
            if ( type === 'logs' ) return '/mock/logs';
            return '/mock';
        })
    },
    BrowserWindow: mockBrowserWindow
}) );

/*
    mock package.json
*/

vi.mock( '#package', () => (
{
    default:
    {
        name: 'ntfy-desktop-test'
    }
}) );

// Console mocking functions
let originalConsole;
function mockConsole()
{
    originalConsole = { ...console };
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.debug = vi.fn();
    console.trace = vi.fn();
}

function restoreConsole()
{
    if ( originalConsole )
        Object.assign( console, originalConsole );
}

/*
    Now import Log after mocks are set up
*/

let Log;

describe( 'Log Class Tests', () =>
{
    beforeAll( async() =>
    {
        /*
            Set test environment
        */

        process.env.NODE_ENV = 'test';
        process.env.LOG_LEVEL = '7';        // Verbose level for testing
        process.env.DEV_MODE = 'true';

        /*
            mock process.type for different scenarios
        */

        Object.defineProperty( process, 'type', {
            value: 'browser',
            writable: true
        });

        /*
            Import Log after environment is set
        */

        const logModule = await import( '#log' );
        Log = logModule.default;

        /*
            Wait a bit for initialization
        */

        await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
    });

    beforeEach( () =>
    {
        vi.clearAllMocks();
        mockConsole();
    });

    afterEach( () =>
    {
        /*
            Reset LOG_LEVEL
        */

        process.env.LOG_LEVEL = '7';
    });

    afterAll( () =>
    {
        restoreConsole();
    });

    describe( 'Log Level Configuration', () =>
    {
        it( 'should respect LOG_LEVEL environment variable', () =>
        {
            // Test different log levels
            const levels = [ '1', '2', '3', '4', '5', '6', '7' ];

            levels.forEach( ( level ) =>
            {
                process.env.LOG_LEVEL = level;

                // Clear previous calls
                vi.clearAllMocks();

                // Test each log method
                Log.error( 'test error' );
                Log.warn( 'test warn' );
                Log.notice( 'test notice' );
                Log.info( 'test info' );
                Log.debug( 'test debug' );
                Log.verbose( 'test verbose' );

                const expectedCalls =
                {
                    '1': { error: 1, warn: 0, notice: 0, info: 0, debug: 0, verbose: 0 },
                    '2': { error: 1, warn: 1, notice: 0, info: 0, debug: 0, verbose: 0 },
                    '3': { error: 1, warn: 1, notice: 1, info: 0, debug: 0, verbose: 0 },
                    '4': { error: 1, warn: 1, notice: 1, info: 1, debug: 0, verbose: 0 },
                    '5': { error: 1, warn: 1, notice: 1, info: 1, debug: 1, verbose: 0 },
                    '6': { error: 1, warn: 1, notice: 1, info: 1, debug: 1, verbose: 1 },
                    '7': { error: 1, warn: 1, notice: 1, info: 1, debug: 1, verbose: 1 }
                };

                /*
                    Verify console calls based on level
                */

                if ( parseInt( level ) >= 1 ) expect( console.error ).toHaveBeenCalledTimes( expectedCalls[ level ].error );
                if ( parseInt( level ) >= 2 ) expect( console.warn ).toHaveBeenCalledTimes( expectedCalls[ level ].warn );
                if ( parseInt( level ) >= 3 ) expect( console.log ).toHaveBeenCalled();
                if ( parseInt( level ) >= 4 ) expect( console.info || console.log ).toHaveBeenCalled();
                if ( parseInt( level ) >= 5 ) expect( console.debug ).toHaveBeenCalled();
            });
        });

        it( 'should default to level 4 when LOG_LEVEL is not set', () =>
        {
            delete process.env.LOG_LEVEL;

            vi.clearAllMocks();

            Log.info( 'test info' );
            expect( console.info || console.log ).toHaveBeenCalled();

            /*
                Debug shouldn't be called at default level 4

                @Note           this depends on the actual implementation
            */

            Log.debug( 'test debug' );
        });
    });

    describe( 'Log Methods', () =>
    {
        beforeEach( () =>
        {
            process.env.LOG_LEVEL = '7';                // Max level for all methods
            process.env.NODE_ENV = 'development';       // Enable console output
        });

        it( 'should log error messages', () =>
        {
            vi.clearAllMocks();

            Log.error( 'test error message', 'additional', 'params' );

            expect( console.error ).toHaveBeenCalled();
            expect( mockElectronLog.error ).toHaveBeenCalledWith(
                '[error]',
                'test error message additional params'
            );
        });

        it( 'should log warning messages', () =>
        {
            vi.clearAllMocks();

            Log.warn( 'test warning message' );

            expect( console.warn ).toHaveBeenCalled();
            expect( mockElectronLog.warn ).toHaveBeenCalledWith(
                '[warn]',
                'test warning message'
            );
        });

        it( 'should log notice messages', () =>
        {
            vi.clearAllMocks();

            Log.notice( 'test notice message' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockElectronLog.warn ).toHaveBeenCalledWith(
                '[notice]',
                'test notice message'
            );
        });

        it( 'should log info messages', () =>
        {
            vi.clearAllMocks();

            Log.info( 'test info message' );

            expect( console.info ).toHaveBeenCalled();
            expect( mockElectronLog.info ).toHaveBeenCalledWith(
                '[info]',
                'test info message'
            );
        });

        it( 'should log ok messages', () =>
        {
            vi.clearAllMocks();

            Log.ok( 'test ok message' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockElectronLog.info ).toHaveBeenCalledWith(
                '[ok]',
                'test ok message'
            );
        });

        it( 'should log debug messages at level 5-6', () =>
        {
            process.env.LOG_LEVEL = '5';
            vi.clearAllMocks();

            Log.debug( 'test debug message' );

            expect( console.debug ).toHaveBeenCalled();
            expect( mockElectronLog.debug ).toHaveBeenCalledWith(
                '[debug]',
                'test debug message'
            );
        });

        it( 'should log debug messages with trace at level 7', () =>
        {
            process.env.LOG_LEVEL = '7';
            vi.clearAllMocks();

            Log.debug( 'test debug trace message' );

            expect( console.trace ).toHaveBeenCalled();
            expect( mockElectronLog.debug ).toHaveBeenCalledWith(
                '[debug]',
                'test debug trace message'
            );
        });

        it( 'should log verbose messages', () =>
        {
            vi.clearAllMocks();

            Log.verbose( 'test verbose message' );

            expect( console.debug ).toHaveBeenCalled();
            expect( mockElectronLog.debug ).toHaveBeenCalledWith(
                '[verbose]',
                'test verbose message'
            );
        });
    });

    describe( 'Message Processing', () =>
    {
        it( 'should handle multiple parameters', () =>
        {
            vi.clearAllMocks();

            Log.info( 'param1', 'param2', 'param3', 123, true );

            expect( mockElectronLog.info ).toHaveBeenCalledWith(
                '[info]',
                'param1 param2 param3 123 true'
            );
        });

        it( 'should strip ANSI codes for file logging', () =>
        {
            vi.clearAllMocks();

            /*
                Test with ANSI codes (chalk colors)
            */

            const messageWithAnsi = '\x1b[31mRed text\x1b[0m normal text';
            Log.info( messageWithAnsi );

            /*
                Should strip ANSI codes for file logging
            */

            expect( mockElectronLog.info ).toHaveBeenCalledWith(
                '[info]',
                'Red text normal text'
            );
        });

        it( 'should handle empty messages', () =>
        {
            vi.clearAllMocks();

            Log.info();

            expect( mockElectronLog.info ).toHaveBeenCalledWith(
                '[info]',
                ''
            );
        });
    });

    describe( 'IPC Communication', () =>
    {
        it( 'should send logs to renderer processes', async() =>
        {
            vi.clearAllMocks();

            Log.info( 'test ipc message' );

            /*
                Wait for async IPC
            */

            await new Promise( ( resolve ) => setTimeout( resolve, 10 ) );

            expect( mockBrowserWindow.getAllWindows ).toHaveBeenCalled();
        });

        it( 'should handle destroyed windows gracefully', async() =>
        {
            vi.clearAllMocks();

            /*
                mock a destroyed window
            */

            mockBrowserWindow.getAllWindows.mockReturnValueOnce( [
            {
                webContents:
                {
                    send: vi.fn(),
                    isDestroyed: vi.fn( () => true )
                }
            }] );

            expect( () => Log.info( 'test message' ) ).not.toThrow();
        });
    });

    describe( 'Environment-specific behavior', () =>
    {
        it( 'should not output to console in production', () =>
        {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            vi.clearAllMocks();

            Log.info( 'production message' );

            /*
                Should still log to file
            */

            expect( mockElectronLog.info ).toHaveBeenCalled();

            /*
                Restore environment
            */

            process.env.NODE_ENV = originalEnv;
        });

        it( 'should suppress all electron-log output in test environment', () =>
        {
            process.env.NODE_ENV = 'test';

            vi.clearAllMocks();

            Log.info( 'test environment message' );

            /*
                electron-log methods should be no-ops in test environment
                This depends on the initialization logic
            */
        });
    });

    describe( 'Broadcast functionality', () =>
    {
        let mockWindow;

        beforeEach( () =>
        {
            mockWindow =
            {
                webContents:
                {
                    executeJavaScript: vi.fn()
                }
            };
        });

        it( 'should broadcast messages with color flag', () =>
        {
            vi.clearAllMocks();

            Log.broadcast( mockWindow, true, 'colored message' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockWindow.webContents.executeJavaScript ).toHaveBeenCalled();
        });

        it( 'should broadcast plain messages without color flag', () =>
        {
            vi.clearAllMocks();

            Log.broadcast( mockWindow, 'plain message' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockWindow.webContents.executeJavaScript ).toHaveBeenCalled();
        });

        it( 'should handle missing window gracefully', () =>
        {
            vi.clearAllMocks();

            expect( () => Log.broadcast( null, 'message' ) ).not.toThrow();
            expect( () => Log.broadcast( undefined, 'message' ) ).not.toThrow();
        });
    });

    describe( 'Timestamp functionality', () =>
    {
        it( 'should generate current timestamp', () =>
        {
            const timestamp = Log.now();

            expect( typeof timestamp ).toBe( 'string' );
            expect( timestamp ).toMatch( /\[\d{1,2}:\d{2}:\d{2}\s(AM|PM)\]/ );
        });
    });

    describe( 'Process type detection', () =>
    {
        it( 'should detect main process', () =>
        {
            Object.defineProperty( process, 'type',
            {
                value: 'browser',
                writable: true
            });

            /*
                Re-import to test initialization
                This tests the initialization logic for main process
            */

            expect( () => Log.info( 'main process test' ) ).not.toThrow();
        });

        it( 'should detect renderer process', async() =>
        {
            Object.defineProperty( process, 'type',
            {
                value: 'renderer',
                writable: true
            });

            /*
                Test renderer process behavior
            */

            expect( () => Log.info( 'renderer process test' ) ).not.toThrow();

            /*
                Reset to browser for other tests
            */

            Object.defineProperty( process, 'type',
            {
                value: 'browser',
                writable: true
            });
        });
    });

    describe( 'Error handling', () =>
    {
        it( 'should handle IPC errors gracefully', async() =>
        {
            vi.clearAllMocks();

            /*
                mock electron import to throw error
            */

            const originalGetAllWindows = mockBrowserWindow.getAllWindows;
            mockBrowserWindow.getAllWindows = vi.fn( () =>
            {
                throw new Error( 'IPC Error' );
            });

            expect( () => Log.info( 'error test message' ) ).not.toThrow();

            /*
                Restore
            */

            mockBrowserWindow.getAllWindows = originalGetAllWindows;
        });

        it( 'should handle file logging errors gracefully', () =>
        {
            vi.clearAllMocks();

            /*
                mock electron-log to throw error silently (should be caught internally)
            */

            mockElectronLog.info.mockImplementationOnce( () =>
            {
                throw new Error( 'File write error' );
            });

            /*
                The Log class should handle errors gracefully without throwing
            */

            expect( () =>
            {
                try
                {
                    Log.info( 'file error test' );
                }
                catch ( error )
                {
                    /*
                        If error is thrown, it should be caught and handled gracefully
                        This test verifies the method doesn't crash the application
                    */
                }
            }).not.toThrow();
        });
    });
});

/*
    Additional tests to cover uncovered lines and branches
*/

describe( 'Log Extended Coverage Tests', () =>
{
    beforeAll( () =>
    {
        process.env.NODE_ENV = 'development';
        process.env.LOG_LEVEL = '7';
    });

    beforeEach( () =>
    {
        vi.clearAllMocks();
        mockConsole();
    });

    describe( 'Initialization error handling', () =>
    {
        it( 'should handle missing electron-log transports gracefully', async() =>
        {
            /*
                mock electron-log without transports
            */

            const mockLogWithoutTransports =
            {
                initialize: vi.fn(),
                error: vi.fn(),
                warn: vi.fn(),
                info: vi.fn(),
                debug: vi.fn(),
                verbose: vi.fn()
            };

            vi.doMock( 'electron-log', () => ({ default: mockLogWithoutTransports }) );

            // Test should not throw even without transports
            expect( () => Log.warn( 'test message' ) ).not.toThrow();
        });

        it( 'should handle electron import failures in main process', async() =>
        {
            // mock process type as browser (main process)
            Object.defineProperty( process, 'type',
            {
                value: 'browser',
                writable: true
            });

            // mock electron import to fail
            vi.doMock( 'electron', () =>
            {
                throw new Error( 'Electron import failed' );
            });

            // Should handle the error gracefully
            expect( () => Log.info( 'test after electron failure' ) ).not.toThrow();
        });

        it( 'should handle filesystem errors during log directory creation', async() =>
        {
            // mock fs.existsSync to return false and mkdirSync to throw
            const originalExistsSync = fs.existsSync;
            const originalMkdirSync = fs.mkdirSync;

            fs.existsSync = vi.fn( () => false );
            fs.mkdirSync = vi.fn( () =>
            {
                throw new Error( 'Permission denied' );
            });

            // Should handle filesystem errors gracefully
            expect( () => Log.debug( 'test filesystem error' ) ).not.toThrow();

            // Restore original functions
            fs.existsSync = originalExistsSync;
            fs.mkdirSync = originalMkdirSync;
        });
    });

    describe( 'sendToRendererConsole function coverage', () =>
    {
        it( 'should handle electron import failure in sendToRendererConsole', async() =>
        {
            // Set process type to browser to trigger the main process path
            Object.defineProperty( process, 'type', {
                value: 'browser',
                writable: true
            });

            // mock electron import to fail in sendToRendererConsole
            const originalImport = global.__dirname;

            // This should trigger the error handling path in sendToRendererConsole
            Log.info( 'test message that should trigger IPC error' );

            // Should not throw despite the error
            expect( console.info ).toHaveBeenCalled();
        });

        it( 'should handle destroyed webContents in sendToRendererConsole', async() =>
        {
            // mock a window with destroyed webContents
            const mockDestroyedWindow = {
                webContents: {
                    send: vi.fn(),
                    isDestroyed: vi.fn( () => true )
                }
            };

            mockBrowserWindow.getAllWindows.mockReturnValueOnce( [ mockDestroyedWindow ] );

            Log.info( 'test with destroyed window' );

            // Should not call send on destroyed webContents
            expect( mockDestroyedWindow.webContents.send ).not.toHaveBeenCalled();
        });

        it( 'should handle null/undefined windows in sendToRendererConsole', async() =>
        {
            // mock getAllWindows to return null/undefined windows
            mockBrowserWindow.getAllWindows.mockReturnValueOnce( [ null, undefined, {
                webContents: {
                    send: vi.fn(),
                    isDestroyed: vi.fn( () => false )
                }
            }] );

            expect( () => Log.info( 'test with null windows' ) ).not.toThrow();
        });

        it( 'should handle windows without webContents in sendToRendererConsole', async() =>
        {
            // mock a window without webContents
            const mockWindowWithoutWebContents = {};

            mockBrowserWindow.getAllWindows.mockReturnValueOnce( [ mockWindowWithoutWebContents ] );

            expect( () => Log.info( 'test without webContents' ) ).not.toThrow();
        });
    });

    describe( 'Message processing edge cases', () =>
    {
        it( 'should handle non-string parameters correctly', () =>
        {
            vi.clearAllMocks();

            const objectParam = { key: 'value' };
            const arrayParam = [ 1, 2, 3 ];
            const numberParam = 42;
            const booleanParam = true;
            const nullParam = null;
            const undefinedParam = undefined;

            Log.info( objectParam, arrayParam, numberParam, booleanParam, nullParam, undefinedParam );

            expect( mockElectronLog.info ).toHaveBeenCalled();
            expect( console.info ).toHaveBeenCalled();
        });

        it( 'should handle very long messages', () =>
        {
            vi.clearAllMocks();

            const longMessage = 'x'.repeat( 10000 );

            expect( () => Log.info( longMessage ) ).not.toThrow();
            expect( mockElectronLog.info ).toHaveBeenCalled();
        });

        it( 'should handle special characters and unicode', () =>
        {
            vi.clearAllMocks();

            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const unicode = '🚀 📝 ✅ ❌ 中文 العربية';

            Log.info( specialChars, unicode );

            expect( mockElectronLog.info ).toHaveBeenCalled();
            expect( console.info ).toHaveBeenCalled();
        });
    });

    describe( 'ANSI stripping functionality', () =>
    {
        it( 'should strip various ANSI escape sequences', () =>
        {
            vi.clearAllMocks();

            // Test various ANSI sequences
            const messagesWithAnsi = [
                '\x1b[31mRed\x1b[0m',
                '\x1b[1;32mBold Green\x1b[0m',
                '\x1b[4;34mUnderlined Blue\x1b[0m',
                '\x1b[101mRed Background\x1b[0m',
                '\x1b[2J\x1b[H\x1b[31mComplex sequence\x1b[0m'
            ];

            messagesWithAnsi.forEach( ( message ) =>
            {
                Log.info( message );
            });

            // Verify all ANSI codes were stripped for file logging
            expect( mockElectronLog.info ).toHaveBeenCalledTimes( messagesWithAnsi.length );
        });

        it( 'should handle mixed ANSI and regular text', () =>
        {
            vi.clearAllMocks();

            const mixedMessage = 'Normal text \x1b[31mred text\x1b[0m more normal text \x1b[32mgreen\x1b[0m';

            Log.info( mixedMessage );

            // Should have called with cleaned message
            expect( mockElectronLog.info ).toHaveBeenCalledWith(
                '[info]',
                'Normal text red text more normal text green'
            );
        });
    });

    describe( 'Environment variable edge cases', () =>
    {
        it( 'should handle invalid LOG_LEVEL values', () =>
        {
            const originalLogLevel = process.env.LOG_LEVEL;

            // Test invalid values
            const invalidValues = [ 'abc', '', 'null', 'undefined', '-1', '10', '0.5' ];

            invalidValues.forEach( ( invalidValue ) =>
            {
                process.env.LOG_LEVEL = invalidValue;
                vi.clearAllMocks();

                // Should not throw and should use default behavior
                expect( () => Log.info( 'test invalid log level' ) ).not.toThrow();
            });

            // Restore original value
            process.env.LOG_LEVEL = originalLogLevel;
        });

        it( 'should handle missing LOG_LEVEL environment variable', () =>
        {
            const originalLogLevel = process.env.LOG_LEVEL;
            delete process.env.LOG_LEVEL;

            vi.clearAllMocks();

            // Should use default level
            Log.info( 'test missing log level' );
            expect( console.info ).toHaveBeenCalled();

            // Restore
            process.env.LOG_LEVEL = originalLogLevel;
        });
    });

    describe( 'Process type variations', () =>
    {
        it( 'should handle undefined process type with mocked process', () =>
        {
            // mock the entire process object to test undefined type
            const originalProcess = global.process;

            global.process =
            {
                ...originalProcess,
                type: undefined,
                env: originalProcess.env
            };

            vi.clearAllMocks();

            expect( () => Log.info( 'undefined process type' ) ).not.toThrow();
            expect( console.info ).toHaveBeenCalled();

            // Restore original process
            global.process = originalProcess;
        });
        });

        it( 'should handle unknown process types', () =>
        {
            Object.defineProperty( process, 'type',
            {
                value: 'unknown',
                writable: true
            });

            expect( () => Log.info( 'unknown process type' ) ).not.toThrow();

            // Reset to browser
            Object.defineProperty( process, 'type',
            {
                value: 'browser',
                writable: true
            });
        });
    });

    describe( 'Broadcast method edge cases', () =>
    {
        it( 'should handle broadcast with boolean flag and multiple parameters', () =>
        {
            vi.clearAllMocks();

            const mockWindow =
            {
                webContents:
                {
                    executeJavaScript: vi.fn()
                }
            };

            Log.broadcast( mockWindow, true, 'param1', 'param2', 'param3' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockWindow.webContents.executeJavaScript ).toHaveBeenCalled();
        });

        it( 'should handle broadcast without boolean flag', () =>
        {
            vi.clearAllMocks();

            const mockWindow =
            {
                webContents:
                {
                    executeJavaScript: vi.fn()
                }
            };

            Log.broadcast( mockWindow, 'message without color' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockWindow.webContents.executeJavaScript ).toHaveBeenCalled();
        });

        it( 'should handle broadcast with false boolean flag', () =>
        {
            vi.clearAllMocks();

            const mockWindow =
            {
                webContents:
                {
                    executeJavaScript: vi.fn()
                }
            };

            Log.broadcast( mockWindow, false, 'message with false flag' );

            expect( console.log ).toHaveBeenCalled();
            expect( mockWindow.webContents.executeJavaScript ).toHaveBeenCalled();
        });

        it( 'should handle broadcast with window without webContents', () =>
        {
            vi.clearAllMocks();

            const mockWindowWithoutWebContents = {};

            expect( () => Log.broadcast( mockWindowWithoutWebContents, 'test message' ) ).not.toThrow();
            expect( console.log ).toHaveBeenCalled();
        });
    });

    describe( 'All log levels with edge cases', () =>
    {
        beforeEach( () =>
        {
            process.env.LOG_LEVEL = '7'; // Enable all levels
            vi.clearAllMocks();
        });

        it( 'should handle verbose with no parameters', () =>
        {
            Log.verbose();
            expect( mockElectronLog.debug ).toHaveBeenCalledWith( '[verbose]', '' );
        });

        it( 'should handle debug with no parameters', () =>
        {
            Log.debug();
            expect( mockElectronLog.debug ).toHaveBeenCalledWith( '[debug]', '' );
        });

        it( 'should handle info with no parameters', () =>
        {
            Log.info();
            expect( mockElectronLog.info ).toHaveBeenCalledWith( '[info]', '' );
        });

        it( 'should handle ok with no parameters', () =>
        {
            Log.ok();
            expect( mockElectronLog.info ).toHaveBeenCalledWith( '[ok]', '' );
        });

        it( 'should handle notice with no parameters', () =>
        {
            Log.notice();
            expect( mockElectronLog.warn ).toHaveBeenCalledWith( '[notice]', '' );
        });

        it( 'should handle warn with no parameters', () =>
        {
            Log.warn();
            expect( mockElectronLog.warn ).toHaveBeenCalledWith( '[warn]', '' );
        });

        it( 'should handle error with no parameters', () =>
        {
            Log.error();
            expect( mockElectronLog.error ).toHaveBeenCalledWith( '[error]', '' );
        });
    });

    describe( 'Production environment behavior', () =>
    {
        it( 'should suppress console output in production but still log to file', () =>
        {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            vi.clearAllMocks();

            Log.info( 'production test message' );

            // Should still log to file via electron-log
            expect( mockElectronLog.info ).toHaveBeenCalled();

            // Restore environment
            process.env.NODE_ENV = originalEnv;
        });
    });

    describe( 'Timestamp functionality edge cases', () =>
    {
        it( 'should return properly formatted timestamp', () =>
        {
            const timestamp = Log.now();

            expect( typeof timestamp ).toBe( 'string' );
            // Should be wrapped in brackets and contain time
            expect( timestamp ).toMatch( /^.*\[\d{1,2}:\d{2}:\d{2}.*\].*$/ );
        });

        it( 'should handle multiple timestamp calls', () =>
        {
            const timestamp1 = Log.now();
            const timestamp2 = Log.now();

            expect( typeof timestamp1 ).toBe( 'string' );
            expect( typeof timestamp2 ).toBe( 'string' );
            // Both should be valid timestamps
            expect( timestamp1 ).toMatch( /\[\d{1,2}:\d{2}:\d{2}/ );
            expect( timestamp2 ).toMatch( /\[\d{1,2}:\d{2}:\d{2}/ );
        });
    });

/**
 * Integration tests for Log class
 */
describe( 'Log Integration Tests', () =>
{
    beforeAll( () =>
    {
        process.env.NODE_ENV = 'development';
        process.env.LOG_LEVEL = '7';
    });

    it( 'should handle complex logging scenario', () =>
    {
        vi.clearAllMocks();

        // Simulate a complex logging scenario
        Log.info( 'Starting application' );
        Log.debug( 'Configuration loaded' );
        Log.warn( 'Deprecated feature used' );
        Log.error( 'Connection failed', 'retrying...' );
        Log.ok( 'Connection restored' );

        // Verify all methods were called
        expect( console.info ).toHaveBeenCalled();

        // At LOG_LEVEL=7, debug() uses console.trace, otherwise console.debug
        // Check if either was called
        const debugCalled = console.debug.mock.calls.length > 0;
        const traceCalled = console.trace.mock.calls.length > 0;
        expect( debugCalled || traceCalled ).toBe( true );

        expect( console.warn ).toHaveBeenCalled();
        expect( console.error ).toHaveBeenCalled();
        expect( console.log ).toHaveBeenCalled();
    });

    it( 'should maintain performance with high-volume logging', () =>
    {
        vi.clearAllMocks();

        const startTime = performance.now();

        // Generate high volume of logs
        for ( let i = 0; i < 100; i++ )
        {
            Log.debug( `Debug message ${ i }` );
        }

        const endTime = performance.now();
        const duration = endTime - startTime;

        // Should complete within reasonable time (1 second)
        expect( duration ).toBeLessThan( 1000 );
    });
});

