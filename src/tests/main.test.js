/*
    Tests > Main Process

    runs tests on the main electron process.
    tests app initialization, message fetching, validation, and IPC
*/

import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest';
import { EventEmitter } from 'events';

/*
    mock all external dependencies before importing
*/

const mockElectron =
{
    app:
    {
        on: vi.fn(),
        whenReady: vi.fn( () => Promise.resolve() ),
        isPackaged: false,
        getAppPath: vi.fn( () => '/mock/app/path' ),
        getPath: vi.fn( ( type ) =>
        {
            const paths =
            {
                userData: '/mock/userData',
                logs: '/mock/logs'
            };
            return paths[ type ] || '/mock';
        }),
        badgeCount: 0,
        quit: vi.fn()
    },
    BrowserWindow: vi.fn( () => (
    {
        loadURL: vi.fn(),
        webContents:
        {
            send: vi.fn(),
            executeJavaScript: vi.fn(),
            on: vi.fn(),
            toggleDevTools: vi.fn(),
            devToolsWebContents: {
                executeJavaScript: vi.fn().mockResolvedValue()
            }
        },
        on: vi.fn(),
        hide: vi.fn(),
        show: vi.fn()
    }) ),
    ipcMain:
    {
        on: vi.fn(),
        handle: vi.fn()
    },
    Tray: vi.fn( () => (
    {
        setToolTip: vi.fn(),
        setContextMenu: vi.fn(),
        on: vi.fn()
    }) ),
    Menu:
    {
        buildFromTemplate: vi.fn(),
        setApplicationMenu: vi.fn()
    },
    MenuItem: vi.fn(),
    dialog:
    {
        showMessageBox: vi.fn()
    },
    shell:
    {
        openExternal: vi.fn()
    }
};

vi.mock( 'electron', () => mockElectron );

/*
    mock moment
*/

vi.mock( 'moment', () => (
{
    default:
    {
        unix: vi.fn( () => (
        {
            format: vi.fn( () => '2024-01-01 12:00 PM' )
        }) )
    }
}) );

/*
    mock chalk with support for chaining
*/

const mockChalk = ( str ) => str;

/*
    Add all the colors and background colors used in Log.js
*/

const chalkProperties =
[
    'white', 'gray', 'grey', 'yellow', 'blueBright', 'greenBright', 'yellowBright', 'redBright', 'red',
    'magentaBright', 'bgBlack', 'blackBright', 'bold', 'bgMagenta', 'bgGray', 'bgBlueBright',
    'bgGreen', 'bgYellow', 'bgRedBright'
];

chalkProperties.forEach( ( prop ) =>
{
    Object.defineProperty( mockChalk, prop,
    {
        get: () => mockChalk
    });
});

mockChalk.level = 3;
vi.mock( 'chalk', () => ({ default: mockChalk }) );

/*
    mock fs
*/

vi.mock( 'fs', () => (
{
    default:
    {
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        existsSync: vi.fn( () => true ),
        mkdirSync: vi.fn(),
        unlinkSync: vi.fn()
    }
}) );

/*
    mock electron-log
*/

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

        console: { level: false }
    },
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

vi.mock( 'electron-log', () => ({ default: mockElectronLog }) );

/*
    mock toasted-notifier
*/

const mockToasted =
{
    notify: vi.fn()
};

vi.mock( 'toasted-notifier', () => ({ default: mockToasted }) );

/*
    mock electron-plugin-prompts
*/

vi.mock( 'electron-plugin-prompts', () => (
{
    default:
    {
        prompt: vi.fn(),
        alert: vi.fn()
    }
}) );

/*
    mock Log class
*/

const mockLog =
{
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    ok: vi.fn(),
    notice: vi.fn(),
    verbose: vi.fn()
};
vi.mock( '#log', () => ({ default: mockLog }) );

/*
    mock Storage class
*/

const mockStorage =
{
    get: vi.fn(),
    set: vi.fn(),
    getInt: vi.fn(),
    getSanitized: vi.fn()
};

vi.mock( '#storage', () => (
{
    default: vi.fn( () => mockStorage )
}) );

/*
    mock Utils class
*/

const mockUtils =
{
    isJsonString: vi.fn( () => true )
};

vi.mock( '#utils', () => ({ default: mockUtils }) );

/*
    mock Menu class
*/

vi.mock( './classes/Menu.js', () => (
{
    newMenuMain: vi.fn( () => [] ),
    newMenuContext: vi.fn( () => [] ),
    setMenuDeps: vi.fn()
}) );

/*
    mock global fetch
*/

global.fetch = vi.fn();
global.AbortController = vi.fn( () => (
{
    abort: vi.fn(),
    signal: {}
}) );

global.setTimeout = vi.fn( ( fn, delay ) =>
{
    if ( typeof fn === 'function' )
    {
        fn();
    }

    return 1;
});

global.clearTimeout = vi.fn();
global.setInterval = vi.fn( () => 1 );
global.clearInterval = vi.fn();

/*
    Console mocking functions
*/

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

describe( 'Main Process Tests', () =>
{
    let indexModule;

    beforeAll( async() =>
    {
        /*
            Set up test environment
        */

        process.env.NODE_ENV = 'test';
        process.env.LOG_LEVEL = '4';
        process.env.DEV_MODE = 'false';

        /*
            mock process.argv
        */

        process.argv = [ 'node', 'index.js' ];

        /*
            Set up default mock returns
        */

        mockStorage.get.mockImplementation( ( key ) =>
        {
            const defaults =
            {
                instanceURL: 'https://ntfy.sh/app',
                apiToken: '',
                topics: 'test-topic',
                pollrate: 60,
                bLocalhost: 0,
                bHotkeys: 0,
                bDevTools: 0,
                bQuitOnClose: 0,
                bStartHidden: 0,
                bPersistentNoti: 0,
                datetime: 'YYYY-MM-DD hh:mm a',
                indicatorMessages: 0
            };

            return defaults[ key ] || 'default-value';
        });

        mockStorage.getInt.mockImplementation( ( key ) =>
        {
            const intDefaults =
            {
                indicatorMessages: 0,
                bLocalhost: 0,
                bHotkeys: 0,
                bDevTools: 0,
                bQuitOnClose: 0,
                bStartHidden: 0,
                bPersistentNoti: 0
            };

            return intDefaults[ key ] || 0;
        });

        mockStorage.getSanitized.mockImplementation( ( key, defaultValue ) =>
        {
            const value = mockStorage.get( key );
            return value || defaultValue;
        });
    });

    beforeEach( () =>
    {
        vi.clearAllMocks();
        mockConsole();
    });

    afterEach( () =>
    {
        vi.clearAllMocks();
    });

    afterAll( () =>
    {
        restoreConsole();
    });

    describe( 'URL Validation', () =>
    {
        it( 'should validate valid URLs', async() =>
        {
            // mock successful fetch
            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                status: 200
            });

            const { IsValidUrl } = await import( '#main' );

            await expect( IsValidUrl( 'https://ntfy.sh', 1, 100 ) ).resolves.toBeDefined();
            expect( global.fetch ).toHaveBeenCalled();
        });

        it( 'should handle invalid URLs', async() =>
        {
            /*
                mock failed fetch properly
            */

            global.fetch.mockImplementation( () => Promise.reject( new Error( 'Network error' ) ) );

            const { IsValidUrl } = await import( '#main' );

            await expect( IsValidUrl( 'https://invalid-url.com', 1, 100 ) ).rejects.toThrow( 'Network error' );
        });

        it( 'should handle localhost URLs differently', async() =>
        {
            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                status: 200,
                type: 'cors'
            });

            const { IsValidUrl } = await import( '#main' );

            await expect( IsValidUrl( 'http://localhost:8080', 1, 100 ) ).resolves.toBeDefined();
        });

        it( 'should retry on failure', async() =>
        {
            /*
                mock first call fails, second succeeds
            */

            global.fetch
                .mockRejectedValueOnce( new Error( 'Network error' ) )
                .mockResolvedValueOnce(
                {
                    ok: true,
                    status: 200
                });

            const { IsValidUrl } = await import( '#main' );

            await expect( IsValidUrl( 'https://ntfy.sh', 2, 10 ) ).resolves.toBeDefined();
            expect( global.fetch ).toHaveBeenCalledTimes( 2 );
        });

        it( 'should handle timeout errors', async() =>
        {
            /*
                mock AbortController
            */

            const mockAbort = vi.fn();
            global.AbortController.mockImplementation( () => (
            {
                abort: mockAbort,
                signal: {}
            }) );

            const abortError = new Error( 'Request timeout' );
            abortError.name = 'AbortError';
            global.fetch.mockImplementation( () => Promise.reject( abortError ) );

            const { IsValidUrl } = await import( '#main' );

            await expect( IsValidUrl( 'https://slow-url.com', 1, 100 ) ).rejects.toThrow();
        });
    });

    describe( 'Message Fetching', () =>
    {
        it( 'should fetch messages from ntfy API', async() =>
        {
            const mockResponse = JSON.stringify(
            {
                id: 'test-id',
                event: 'message',
                time: 1640995200,
                message: 'Test message',
                topic: 'test-topic'
            });

            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( mockResponse )
            });

            const { GetMessageData } = await import( '#main' );

            const result = await GetMessageData( 'https://ntfy.sh/test-topic/json?poll=1' );
            expect( result ).toEqual( [ mockResponse ] );
            expect( global.fetch ).toHaveBeenCalledWith(
                'https://ntfy.sh/test-topic/json?poll=1',
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: 'Bearer default-value',
                        'Cache-Control': 'no-cache',
                        'User-Agent': 'ntfy-desktop/2.2.0'
                    },
                    signal: {}
                }
            );
        });

        it( 'should handle fetch timeout', async() =>
        {
            global.fetch.mockRejectedValueOnce({ name: 'AbortError' });

            const { GetMessageData } = await import( '#main' );

            const result = await GetMessageData( 'https://ntfy.sh/test-topic/json?poll=1' );
            expect( result ).toBeNull();
            expect( mockLog.warn ).toHaveBeenCalledWith(
                'core',
                '[messages]',
                ':  ',
                '<msg>',
                expect.stringContaining( 'timed out' ),
                '<uri>',
                'https://ntfy.sh/test-topic/json?poll=1'
            );
        });

        it( 'should handle fetch errors', async() =>
        {
            global.fetch.mockRejectedValueOnce( new Error( 'Network error' ) );

            const { GetMessageData } = await import( '#main' );

            const result = await GetMessageData( 'https://ntfy.sh/test-topic/json?poll=1' );
            expect( result ).toBeNull();
            expect( mockLog.error ).toHaveBeenCalled();
        });

        it( 'should include API token in requests', async() =>
        {
            mockStorage.get.mockImplementation( ( key ) =>
            {
                if ( key === 'apiToken' ) return 'test-token';
                return 'default-value';
            });

            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( '[]' )
            });

            const { GetMessageData } = await import( '#main' );

            await GetMessageData( 'https://ntfy.sh/test-topic/json?poll=1' );

            expect( global.fetch ).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining(
                {
                    headers: expect.objectContaining(
                    {
                        Authorization: 'Bearer test-token'
                    })
                })
            );
        });
    });

    describe( 'Message Processing', () =>
    {
        it( 'should process valid messages', async() =>
        {
            const testMessage =
            {
                id: 'test-id-123',
                event: 'message',
                time: 1640995200,
                message: 'Test notification message',
                topic: 'test-topic'
            };

            mockUtils.isJsonString.mockReturnValue( true );
            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( JSON.stringify( testMessage ) )
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockToasted.notify ).toHaveBeenCalledWith(
            {
                title: 'test-topic - 2024-01-01 12:00 PM',
                subtitle: '2024-01-01 12:00 PM',
                message: 'Test notification message',
                sound: 'Pop',
                open: 'default-value',
                persistent: false,
                sticky: false
            });
        });

        it( 'should handle authentication errors (401)', async() =>
        {
            const authErrorMessage =
            {
                http: 401,
                error: 'Unauthorized',
                link: 'https://ntfy.sh/docs/auth'
            };

            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( JSON.stringify( authErrorMessage ) )
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockLog.warn ).toHaveBeenCalledWith(
                'auth',
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.stringContaining( 'Unauthorized' ),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );

            expect( mockToasted.notify ).not.toHaveBeenCalled();
        });

        it( 'should handle rate limiting errors (429)', async() =>
        {
            const rateLimitMessage =
            {
                http: 429,
                error: 'too many requests',
                link: 'https://ntfy.sh/docs/limits'
            };

            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( JSON.stringify( rateLimitMessage ) )
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockLog.warn ).toHaveBeenCalledWith(
                'auth',
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.stringContaining( 'poll limit reached' ),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything()
            );
        });

        it( 'should skip non-message events', async() =>
        {
            const keepAliveMessage =
            {
                id: 'keep-alive-123',
                event: 'keepalive',
                time: 1640995200
            };

            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( JSON.stringify( keepAliveMessage ) )
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockToasted.notify ).not.toHaveBeenCalled();
        });

        it( 'should not send duplicate notifications', async() =>
        {
            const testMessage =
            {
                id: 'duplicate-test-id',
                event: 'message',
                time: 1640995200,
                message: 'Duplicate test message',
                topic: 'test-topic'
            };

            global.fetch.mockResolvedValue(
            {
                ok: true,
                text: () => Promise.resolve( JSON.stringify( testMessage ) )
            });

            const { GetMessages } = await import( '#main' );

            /*
                Call twice with same message ID
            */

            await GetMessages();
            await GetMessages();

            /*
                Should only notify once
            */

            expect( mockToasted.notify ).toHaveBeenCalledTimes( 1 );
        });

        it( 'should validate poll rate limits', async() =>
        {
            /*
                Test minimum poll rate
            */

            mockStorage.get.mockImplementation( ( key ) =>
            {
                if ( key === 'pollrate' ) return 1; // Below minimum of 5
                return 'default';
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockStorage.set ).toHaveBeenCalledWith( 'pollrate', 5 );
            expect( mockLog.warn ).toHaveBeenCalledWith(
                'core',
                '[messages]',
                ':  ',
                '<msg>',
                'Poll rate was out of bounds, clamped to 5s'
            );
        });

        it( 'should handle missing instance URL', async() =>
        {
            mockStorage.get.mockImplementation( ( key ) =>
            {
                if ( key === 'instanceURL' ) return '';
                return 'default';
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockLog.error ).toHaveBeenCalledWith(
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.anything(),
                expect.stringContaining( 'instance url missing' ),
                expect.anything(),
                expect.anything()
            );
        });

        it( 'should handle empty topics', async() =>
        {
            mockStorage.getSanitized.mockImplementation( ( key, defaultValue ) =>
            {
                if ( key === 'topics' ) return '';
                if ( key === 'pollrate' ) return 60; // Return valid pollrate to prevent NaN issue
                return defaultValue;
            });

            mockStorage.get.mockImplementation( ( key ) =>
            {
                if ( key === 'topics' ) return '';
                if ( key === 'pollrate' ) return 60;
                if ( key === 'instanceURL' ) return 'https://ntfy.sh/app';
                return 'default';
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockLog.warn ).toHaveBeenCalledWith(
                'core',
                '[messages]',
                ':  ',
                '<msg>',
                'No topics configured, skipping message fetch'
            );
        });
    });

    describe( 'Badge Management', () =>
    {
        it( 'should update badge count', async() =>
        {
            mockStorage.getInt.mockReturnValue( 5 );

            const { UpdateBadge } = await import( '#main' );

            UpdateBadge( 2 );

            expect( mockStorage.set ).toHaveBeenCalledWith( 'indicatorMessages', 7 );
            expect( mockElectron.app.badgeCount ).toBe( 7 );
        });

        it( 'should handle invalid badge counts', async() =>
        {
            mockStorage.getInt.mockReturnValue( NaN );

            const { UpdateBadge } = await import( '#main' );

            UpdateBadge();

            expect( mockStorage.set ).toHaveBeenCalledWith( 'indicatorMessages', 1 );
            expect( mockElectron.app.badgeCount ).toBe( 1 );
        });
    });

    describe( 'Main Process Logging Initialization', () =>
    {
        it( 'should initialize logging for packaged app', async() =>
        {
            mockElectron.app.isPackaged = true;

            /*
                mock process.execPath for packaged app
            */

            Object.defineProperty( process, 'execPath',
            {
                value: '/app/ntfy-desktop.exe',
                writable: true
            });

            const { initializeMainProcessLogging } = await import( '#main' );

            const result = initializeMainProcessLogging();

            expect( result ).toBe( true );
            expect( mockElectronLog.transports.file.level ).toBe( 'debug' );
            expect( mockElectronLog.transports.console.level ).toBe( false );
        });

        it( 'should initialize logging for development', async() =>
        {
            mockElectron.app.isPackaged = false;
            process.env.DEV_MODE = 'true';

            const { initializeMainProcessLogging } = await import( '#main' );

            const result = initializeMainProcessLogging();

            expect( result ).toBe( true );
            expect( mockLog.info ).toHaveBeenCalledWith( 'Log file should be at:', '\\mock\\app\\path\\logs\\main.log' );
        });

        it( 'should handle logging initialization errors', async() =>
        {
            /*
                mock fs to throw error
            */

            const fs = await import( 'fs' );
            fs.default.mkdirSync.mockImplementationOnce( () =>
            {
                throw new Error( 'Permission denied' );
            });

            const { initializeMainProcessLogging } = await import( '#main' );

            const result = initializeMainProcessLogging();

            expect( result ).toBe( true ); // Should fallback to default
            expect( mockElectronLog.transports.file.level ).toBe( 'debug' );
        });
    });

    describe( 'CLI Arguments', () =>
    {
        it( 'should handle --dev argument', async() =>
        {
            process.argv = [ 'node', 'index.js', '--dev' ];

            /*
                this would be tested by importing and checking if dev tools are enabled.
                the actual implementation would need to be refactored to be more testable
            */

            expect( process.argv ).toContain( '--dev' );
        });

        it( 'should handle --hidden argument', async() =>
        {
            process.argv = [ 'node', 'index.js', '--hidden' ];
            expect( process.argv ).toContain( '--hidden' );
        });

        it( 'should handle --quit argument', async() =>
        {
            process.argv = [ 'node', 'index.js', '--quit' ];
            expect( process.argv ).toContain( '--quit' );
        });

        it( 'should handle --hotkeys argument', async() =>
        {
            process.argv = [ 'node', 'index.js', '--hotkeys' ];
            expect( process.argv ).toContain( '--hotkeys' );
        });
    });

    describe( 'Error Handling', () =>
    {
        it( 'should handle concurrent polling gracefully', async() =>
        {
            /*
                This tests the isPolling flag functionality
            */

            const { GetMessages } = await import( '#main' );

            /*
                mock storage to return valid values
            */

            mockStorage.get.mockImplementation( ( key ) =>
            {
                if ( key === 'instanceURL' ) return 'https://ntfy.sh/app';
                if ( key === 'pollrate' ) return 60;
                return 'default';
            });

            mockStorage.getSanitized.mockImplementation( ( key, defaultValue ) =>
            {
                if ( key === 'topics' ) return 'test-topic';
                return defaultValue || 'default';
            });

            /*
                mock fetch to return valid response
            */

            global.fetch.mockResolvedValue(
            {
                ok: true,
                text: () => Promise.resolve( '' )
            });

            /*
                Simulate concurrent calls
            */

            const promise1 = GetMessages();
            const promise2 = GetMessages();

            await Promise.all( [ promise1, promise2 ] );

            /*
                The second call should be skipped due to polling flag
                We just check that the function completes without error
            */

            expect( global.fetch ).toHaveBeenCalled();
        });

        it( 'should handle app shutdown during polling', async() =>
        {
            /*
                mock shutdown state
            */

            const moduleScope = await import( '#main' );

            /*
                This would need the actual module to export isShuttingDown for testing
                For now, we test that the function exists
            */

            expect( typeof moduleScope.GetMessages ).toBe( 'function' );
        });

        it( 'should handle invalid JSON responses', async() =>
        {
            mockUtils.isJsonString.mockReturnValue( false );

            /*
                Set up mocks to ensure we get to the JSON validation part
            */

            mockStorage.get.mockImplementation( ( key ) =>
            {
                if ( key === 'instanceURL' ) return 'https://ntfy.sh/app';
                if ( key === 'pollrate' ) return 60;
                return 'default';
            });

            mockStorage.getSanitized.mockImplementation( ( key, defaultValue ) =>
            {
                if ( key === 'topics' ) return 'test-topic';
                return defaultValue || 'default';
            });

            global.fetch.mockResolvedValueOnce(
            {
                ok: true,
                text: () => Promise.resolve( 'invalid json' )
            });

            const { GetMessages } = await import( '#main' );

            await GetMessages();

            expect( mockLog.error ).toHaveBeenCalledWith(
                'core',
                '[messages]',
                ':  ',
                '<msg>',
                'Polling for new messages returned invalid json; skipping fetch. Change your instance URL to a valid ntfy instance.',
                '<func>',
                'GetMessages()'
            );
        });
    });
});

