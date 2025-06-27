/**
 * Test Setup
 * 
 * Global setup for all vitest tests
 * Sets up mocks, global variables, and test environment
 */

import { vi } from 'vitest';
import os from 'os';
import path from 'path';

/**
 * Mock Electron globally
 */
vi.mock('electron', () => ({
    app: {
        getPath: vi.fn((type) => {
            if (type === 'userData') {
                return path.join(os.tmpdir(), 'ntfy-desktop-test');
            }
            if (type === 'logs') {
                return path.join(os.tmpdir(), 'ntfy-desktop-test', 'logs');
            }
            return os.tmpdir();
        }),
        getAppPath: vi.fn(() => path.join(__dirname, '..')),
        isPackaged: false,
        badgeCount: 0,
        isQuiting: false,
        whenReady: vi.fn(() => Promise.resolve()),
        on: vi.fn(),
        quit: vi.fn()
    },
    BrowserWindow: vi.fn(() => ({
        loadURL: vi.fn(),
        webContents: {
            send: vi.fn(),
            executeJavaScript: vi.fn(),
            toggleDevTools: vi.fn(),
            on: vi.fn(),
            isDestroyed: vi.fn(() => false)
        },
        on: vi.fn(),
        hide: vi.fn(),
        show: vi.fn(),
        getAllWindows: vi.fn(() => [])
    })),
    ipcMain: {
        on: vi.fn(),
        handle: vi.fn()
    },
    ipcRenderer: {
        on: vi.fn(),
        send: vi.fn(),
        invoke: vi.fn()
    },
    contextBridge: {
        exposeInMainWorld: vi.fn()
    },
    Tray: vi.fn(() => ({
        setToolTip: vi.fn(),
        setContextMenu: vi.fn(),
        on: vi.fn()
    })),
    Menu: {
        buildFromTemplate: vi.fn(),
        setApplicationMenu: vi.fn()
    },
    MenuItem: vi.fn(),
    dialog: {
        showMessageBox: vi.fn()
    },
    shell: {
        openExternal: vi.fn()
    }
}));

/**
 * Mock electron-log globally
 */
vi.mock('electron-log', () => ({
    default: {
        transports: {
            file: {
                level: 'debug',
                resolvePathFn: vi.fn(),
                fileName: 'main.log'
            },
            console: {
                level: false
            },
            ipc: {
                level: false
            },
            remote: {
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
}));

/**
 * Mock chalk globally
 */
vi.mock('chalk', () => {
    const createChainableFunction = () => {
        const fn = (str) => str; // Return the string as-is
        
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
        
        const modifiers = ['bold', 'dim', 'italic', 'underline', 'strikethrough'];
        
        [...colors, ...backgrounds, ...modifiers].forEach(prop => {
            Object.defineProperty(fn, prop, {
                get: () => createChainableFunction()
            });
        });
        
        return fn;
    };
    
    const chalk = createChainableFunction();
    chalk.level = 3;
    
    return { default: chalk };
});

/**
 * Mock fs for testing
 */
vi.mock('fs', async () => {
    const actual = await vi.importActual('fs');
    return {
        ...actual,
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        existsSync: vi.fn(() => true),
        mkdirSync: vi.fn(),
        unlinkSync: vi.fn()
    };
});

/**
 * Mock moment for testing
 */
vi.mock('moment', () => ({
    default: {
        unix: vi.fn(() => ({
            format: vi.fn(() => '2024-01-01 12:00 PM')
        }))
    }
}));

/**
 * Mock toasted-notifier
 */
vi.mock('toasted-notifier', () => ({
    default: {
        notify: vi.fn()
    }
}));

/**
 * Mock electron-plugin-prompts
 */
vi.mock('electron-plugin-prompts', () => ({
    default: {
        prompt: vi.fn(),
        alert: vi.fn()
    }
}));

/**
 * Set up global test environment
 */
global.fetch = vi.fn();
global.AbortController = vi.fn(() => ({
    abort: vi.fn(),
    signal: {}
}));

/**
 * Set NODE_ENV to test
 */
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = '4';

/**
 * Console mock to prevent test pollution
 */
const originalConsole = { ...console };
global.originalConsole = originalConsole;

// Override console methods for cleaner test output
console.log = vi.fn();
console.info = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();
console.debug = vi.fn();
console.trace = vi.fn();

/**
 * Restore console for specific tests if needed
 */
global.restoreConsole = () => {
    Object.assign(console, originalConsole);
};

/**
 * Mock console for specific tests if needed
 */
global.mockConsole = () => {
    console.log = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.debug = vi.fn();
    console.trace = vi.fn();
};

