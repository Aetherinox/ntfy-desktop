/*
    Tests > Setup

    this file is associated with vitest tests.
    sets up mocks, global variables and a test env
*/

import { vi } from 'vitest';
import os from 'os';
import path from 'path';

/*
    mock electron globally
*/

vi.mock( 'electron', () => (
{
    app: {
        getPath: vi.fn( ( type ) =>
        {
            if ( type === 'userData' )
                return path.join( os.tmpdir(), 'ntfy-desktop-test' );

            if ( type === 'logs' )
                return path.join( os.tmpdir(), 'ntfy-desktop-test', 'logs' );

            return os.tmpdir();
        }),
        getAppPath: vi.fn( () => path.join( __dirname, '..' ) ),
        isPackaged: false,
        badgeCount: 0,
        isQuiting: false,
        whenReady: vi.fn( () => Promise.resolve() ),
        on: vi.fn(),
        quit: vi.fn()
    },
    BrowserWindow: vi.fn().mockImplementation( () => (
    {
        loadURL: vi.fn().mockResolvedValue(undefined),
        loadFile: vi.fn().mockResolvedValue(undefined),
        webContents:
        {
            send: vi.fn(),
            executeJavaScript: vi.fn().mockResolvedValue(undefined),
            toggleDevTools: vi.fn(),
            on: vi.fn(),
            isDestroyed: vi.fn( () => false ),
            navigationHistory: {
                canGoBack: () => true,
                canGoForward: () => true,
                goBack: () => {},
                goForward: () => {}
            }
        },
        on: vi.fn(),
        hide: vi.fn(),
        show: vi.fn(),
        reload: vi.fn(),
        setFullScreen: vi.fn(),
        isFullScreen: vi.fn(() => false),
        setMenu: vi.fn(),
        getAllWindows: vi.fn( () => [] )
    }) ),
    ipcMain:
    {
        on: vi.fn(),
        handle: vi.fn()
    },
    ipcRenderer:
    {
        on: vi.fn(),
        send: vi.fn(),
        invoke: vi.fn()
    },
    contextBridge:
    {
        exposeInMainWorld: vi.fn()
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
}) );

/*
    mock electron-log globally
*/

vi.mock( 'electron-log', () => (
{
    default:
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
    }
}) );

/*
    mock chalk globally
*/

vi.mock( 'chalk', () =>
{
    const createChainableFunction = () =>
    {
        const fn = ( str ) => str; // Return the string as-is

        // Add chainable color properties
        const colors = [
            'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
            'gray', 'grey', 'blackBright', 'redBright', 'greenBright', 'yellowBright',
            'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'
        ];

        const backgrounds = [
            'bgBlack', 'bgRed', 'bgGreen', 'bgYellow', 'bgBlue', 'bgMagenta',
            'bgCyan', 'bgWhite', 'bgGray', 'bgGrey', 'bgBlackBright', 'bgRedBright',
            'bgGreenBright', 'bgYellowBright', 'bgBlueBright', 'bgMagentaBright',
            'bgCyanBright', 'bgWhiteBright'
        ];

        const modifiers = [ 'bold', 'dim', 'italic', 'underline', 'strikethrough' ];

        [ ...colors, ...backgrounds, ...modifiers ].forEach( ( prop ) =>
        {
            Object.defineProperty( fn, prop,
            {
                get: () => createChainableFunction()
            });
        });

        return fn;
    };

    const chalk = createChainableFunction();
    chalk.level = 3;

    return { default: chalk };
});

/*
    mock fs globally
*/

vi.mock( 'fs', async() =>
{
    const actual = await vi.importActual( 'fs' );
    return {
        ...actual,
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        existsSync: vi.fn( () => true ),
        mkdirSync: vi.fn(),
        unlinkSync: vi.fn()
    };
});

/*
    mock moment for testing
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
    mock toasted-notifier
*/

vi.mock( 'toasted-notifier', () => (
{
    default:
    {
        notify: vi.fn()
    }
}) );

/*
    mock electrn-plugin-prompts
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
    create global test env
*/

global.fetch = vi.fn();
global.AbortController = vi.fn( () => (
{
    abort: vi.fn(),
    signal: {}
}) );

/*
    set NODE_ENV for testing
*/

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = '4';

/*
    comprehensive fix for process.listeners issue in worker threads
*/

if (typeof process !== 'undefined') {
    // Ensure process.listeners exists and works properly
    if (!process.listeners) {
        process.listeners = function(event) {
            return [];
        };
    }
    
    // Patch process to prevent undefined access
    const originalListeners = process.listeners;
    process.listeners = function(event) {
        try {
            if (typeof originalListeners === 'function') {
                return originalListeners.call(this, event) || [];
            }
            return [];
        } catch (e) {
            return [];
        }
    };
    
    // Ensure other process methods exist
    if (!process.listenerCount) {
        process.listenerCount = function(event) {
            return 0;
        };
    }
    
    if (!process.removeAllListeners) {
        process.removeAllListeners = function(event) {
            return this;
        };
    }
    
    // Override uncaughtException handler to suppress specific errors
    const originalUncaughtException = process.listeners('uncaughtException');
    process.removeAllListeners('uncaughtException');
    
    process.on('uncaughtException', (error) => {
        // Suppress specific worker thread errors
        if (error.message && (
            error.message.includes('Cannot read properties of undefined (reading \'listeners\')') ||
            error.message.includes('Channel closed') ||
            error.message.includes('ERR_IPC_CHANNEL_CLOSED')
        )) {
            // Silently ignore these errors
            return;
        }
        
        // Re-emit other errors through original handlers
        if (originalUncaughtException && originalUncaughtException.length > 0) {
            originalUncaughtException.forEach(handler => {
                try {
                    handler(error);
                } catch (e) {
                    // Ignore handler errors
                }
            });
        }
    });
    
    // Override unhandledRejection handler to suppress specific errors
    const originalUnhandledRejection = process.listeners('unhandledRejection');
    process.removeAllListeners('unhandledRejection');
    
    process.on('unhandledRejection', (reason, promise) => {
        // Suppress specific worker thread errors
        if (reason && reason.message && (
            reason.message.includes('Cannot read properties of undefined (reading \'listeners\')') ||
            reason.message.includes('Channel closed') ||
            reason.message.includes('ERR_IPC_CHANNEL_CLOSED') ||
            reason.code === 'ERR_IPC_CHANNEL_CLOSED'
        )) {
            // Silently ignore these errors
            return;
        }
        
        // Re-emit other errors through original handlers
        if (originalUnhandledRejection && originalUnhandledRejection.length > 0) {
            originalUnhandledRejection.forEach(handler => {
                try {
                    handler(reason, promise);
                } catch (e) {
                    // Ignore handler errors
                }
            });
        }
    });
}

/*
    console mock to prevent test pollution
*/

const originalConsole = { ...console };
global.originalConsole = originalConsole;

/*
    override console methods for cleaner test output
*/

console.log = vi.fn();
console.info = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
console.debug = vi.fn();
console.trace = vi.fn();

/*
    restore console for specific tests (if needed)
*/

global.restoreConsole = () =>
{
    Object.assign( console, originalConsole );
};

/*
    mock console for specific tests (if needed)
*/

global.mockConsole = () =>
{
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.debug = vi.fn();
    console.trace = vi.fn();
};

