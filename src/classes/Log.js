/**
    Class > Log

    When assigning text colors, terminals and the windows command prompt can display any color; however apps
    such as Portainer console cannot. If you use 16 million colors and are viewing console in Portainer, colors will
    not be the same as the rgb value. It's best to just stick to Chalk's default colors.

    Logs are automatically forwarded to three destinations:
        1. File logs (logs/main.log)        plain text without colors
        2. Command prompt/terminal          full color output (development mode only)
        3. Electron dev console             app name colored, message plain text (via IPC)

    Various levels of logs with the following usage:
        Log.verbose(`This is verbose`)
        Log.debug(`This is debug`)
        Log.info(`This is info`)
        Log.ok(`This is ok`)
        Log.notice(`This is notice`)
        Log.warn(`This is warn`)
        Log.error(
            `Error fetching sports data with error:`,
            chalk.white(` `),
            chalk.grey(`This is the error message`)
        );

    All log messages are automatically sent to appropriate destinations:
        Log.ok( 'This is a message' );
        Log.verbose( 'This is a message' );

        Level               Type
    --------------------------------------------------------------
        7                   Verbose + Debug (with trace logs)
        6                   Verbose
        5                   Debug
        4                   Info
        3                   Notice
        2                   Warn
        1                   Error
*/

import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import log from 'electron-log';
import packageJson from '#package' with { type: 'json' };

/**
    chalk.level

    @ref        https://npmjs.com/package/chalk
                - 0    All colors disabled
                - 1    Basic color support (16 colors)
                - 2    256 color support
                - 3    Truecolor support (16 million colors)

    When assigning text colors, terminals and the windows command prompt can display any color; however apps
    such as Portainer console cannot. If you use 16 million colors and are viewing console in Portainer, colors will
    not be the same as the rgb value. It's best to just stick to Chalk's default colors.
*/

chalk.level = 3;

/**
    define > general
*/

const getLogLevel = () => parseInt( process.env.LOG_LEVEL ) || 4;           // dynamic LOG_LEVEL getter to allow runtime changes
const name = packageJson.name;

/**
    detect if we're in development or production mode
*/

const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true' || process.env.NODE_ENV === 'test' || !process.env.NODE_ENV;
const isProduction = !isDevelopment;

/**
    strip ANSI escape codes from strings
    This removes chalk color formatting from text
*/

const stripAnsi = ( str ) =>
{
    if ( typeof str !== 'string' )
    {
        // Handle Symbol values safely
        if ( typeof str === 'symbol' )
            return str.toString();
        
        // Handle other non-string values
        return String( str );
    }

    /**
        since chalk log messages have colors in them, strip all ANSI escape codes so that
        we can write the file to a file and not have all the color crap show as well.
    */

    // eslint-disable-next-line no-control-regex
    return str.replace( /\x1b\[[0-9;]*m/g, '' );
};

/**
    clean message array by removing ANSI codes from all elements
*/

const cleanMessage = ( msgArray ) =>
{
    return msgArray.map( ( item ) => 
    {
        // Handle Symbol values safely before passing to stripAnsi
        if ( typeof item === 'symbol' )
            return stripAnsi( item.toString() );
        
        // Handle other values
        return stripAnsi( String( item ) );
    });
};

/**
    safely join an array that may contain Symbols
*/

const safeJoin = ( msgArray, separator = ' ' ) =>
{
    return msgArray.map( ( item ) => 
    {
        // Handle Symbol values safely
        if ( typeof item === 'symbol' )
            return item.toString();
        
        // Handle other values
        return String( item );
    }).join( separator );
};

/**
    Class > Log

    This class automatically routes logs to three destinations:
        1.  File Logs (electron-log)                Clean text without any colors
        2.  Console Logs (console.* commands)       Full chalk colors (development mode only)
        3.  Electron Dev Console                    App name colored, message plain text (via IPC)

    No boolean flags are needed - all routing is handled automatically.
    Usage: Log.info( 'My log message' )
*/

class Log
{
    /**
        date current timestamp
    */

    static now()
    {
        const now = new Date();
        return chalk.gray( `[${ now.toLocaleTimeString() }]` );
    }

    /**
        Log.verbose requires LOG_LEVEL=6 or 7
        shows messages using console.debug.
    */

    static verbose( ...msg )
    {
        if ( getLogLevel() < 6 ) return;

        /**
            always send clean messages to electron-log for file output
        */

        const msgForLog = msg;
        const cleanedMsg = cleanMessage( msgForLog );
        log.debug( `[verbose]`, cleanedMsg.join( ' ' ) );

        /**
            always show colored console output for command prompt / terminal
        */

        if ( isDevelopment )
            console.debug( chalk.white.bgBlack.blackBright.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.gray( safeJoin( msg ) ) );

        /**
            send to renderer console (automatic forwarding with first word colored)
        */

        sendToRendererConsole( 'verbose', safeJoin( msg ), true );
    }

    /**
        Log.debug shows for LOG_LEVEL=5, 6, and 7

        however, when LOG_LEVEL=7 is specified, this debug function uses console.trace instead of console.debug
        which is why it is the highest number; otherwise logs would get annoying.

        LOG_LEVEL=5             shows normal logs with console.debug
        LOG_LEVEL=6             shows normal logs with console.debug
        LOG_LEVEL=7             shows detailed logs with console.trace
    */

    static debug( ...msg )
    {
        const logLevel = getLogLevel();
        if ( logLevel < 5 ) return;

        /**
            always send clean messages to electron-log for file output
        */

        const msgForLog = msg;
        const cleanedMsg = cleanMessage( msgForLog );
        log.debug( `[debug]`, cleanedMsg.join( ' ' ) );

        if ( logLevel >= 7 )
        {
            /**
                always show colored console output for command prompt / terminal
            */

            if ( isDevelopment )
                console.trace( chalk.white.bgMagenta.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.magentaBright( safeJoin( msg ) ) );

            /**
                send to renderer console (automatic forwarding with first word colored)
            */

            sendToRendererConsole( 'debug', safeJoin( msg ), true );
        }
        else if ( logLevel >= 5 )
        {
            /**
                always show colored console output for command prompt / terminal
            */

            if ( isDevelopment )
                console.debug( chalk.white.bgGray.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.gray( safeJoin( msg ) ) );

            /**
                send to renderer console (automatic forwarding with first word colored)
            */

            sendToRendererConsole( 'debug', safeJoin( msg ), true );
        }
    }


    static info(...msg) {
        if (getLogLevel() < 4) return;

        try {
            // Clean messages and log
            const msgForLog = msg;
            const cleanedMsg = cleanMessage(msgForLog);
            log.info('[info]', cleanedMsg.join(' '));

            // Console output for development
            if (isDevelopment) {
                console.info(chalk.white.bgBlueBright.bold(` ${name} `), chalk.white(' '), this.now(), chalk.blueBright(safeJoin(msg)));
            }

            // Send to renderer console
            sendToRendererConsole('info', safeJoin(msg), true);
        } catch (error) {
            console.warn('Error in logging:', error);  // Handle the error
        }
    }

    static ok( ...msg )
    {
        if ( getLogLevel() < 4 ) return;

        /**
            always send clean messages to electron-log for file output
        */

        const msgForLog = msg;
        const cleanedMsg = cleanMessage( msgForLog );
        log.info( `[ok]`, cleanedMsg.join( ' ' ) );

        /**
            always show colored console output for command prompt / terminal
        */

        if ( isDevelopment )
            console.log( chalk.white.bgGreen.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.greenBright( safeJoin( msg ) ) );

        /**
            send to renderer console (automatic forwarding with first word colored)
        */

        sendToRendererConsole( 'ok', safeJoin( msg ), true );
    }

    static notice( ...msg )
    {
        if ( getLogLevel() < 3 ) return;

        /**
            always send clean messages to electron-log for file output
        */

        const msgForLog = msg;
        const cleanedMsg = cleanMessage( msgForLog );
        log.warn( `[notice]`, cleanedMsg.join( ' ' ) );

        /**
            always show colored console output for command prompt / terminal
        */

        if ( isDevelopment )
            console.log( chalk.white.bgYellow.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.yellowBright( safeJoin( msg ) ) );

        /**
            send to renderer console (automatic forwarding with first word colored)
        */

        sendToRendererConsole( 'notice', safeJoin( msg ), true );
    }

    static warn( ...msg )
    {
        if ( getLogLevel() < 2 ) return;

        /**
            always send clean messages to electron-log for file output
        */

        const msgForLog = msg;
        const cleanedMsg = cleanMessage( msgForLog );
        log.warn( `[warn]`, cleanedMsg.join( ' ' ) );

        /**
            always show colored console output for command prompt / terminal
        */

        if ( isDevelopment )
            console.warn( chalk.white.bgYellow.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.yellowBright( safeJoin( msg ) ) );

        /**
            send to renderer console (automatic forwarding with first word colored)
        */

        sendToRendererConsole( 'warn', safeJoin( msg ), true );
    }

    static error( ...msg )
    {
        if ( getLogLevel() < 1 ) return;

        /**
            always send clean messages to electron-log for file output
        */

        const msgForLog = msg;
        const cleanedMsg = cleanMessage( msgForLog );
        log.error( `[error]`, cleanedMsg.join( ' ' ) );

        /**
            always show colored console output for command prompt / terminal
        */

        if ( isDevelopment )
            console.error( chalk.white.bgRedBright.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.redBright( safeJoin( msg ) ) );

        /**
            send to renderer console (automatic forwarding with first word colored)
        */

        sendToRendererConsole( 'error', safeJoin( msg ), true );
    }

    /**
        used to show log messages both in the node command prompt console AND electron developer console

        supports boolean flag as first parameter:
            - Log.broadcast(window, true, 'message')            colors only app name in electron dev console
            - Log.broadcast(window, 'message')                  plain text in both consoles
    */

    static broadcast( window, ...msg )
    {
        /**
            check if first parameter is boolean
        */

        const hasColorFlag = typeof msg[ 0 ] === 'boolean' && msg[ 0 ] === true;

        if ( hasColorFlag )
        {
            /**
                remove boolean flag from message array
            */

            const cleanMsg = msg.slice( 1 );

            /**
                development console; show with colored app name
            */

            console.log( chalk.white.bgBlueBright.bold( ` ${ name } ` ), safeJoin( cleanMsg ) );

            /**
                electron dev console; show with colored app name using css styling
            */

            if ( window && window.webContents )
            {
                const styledMessage = `%c ${ name } %c ${ safeJoin( cleanMsg ) }`;
                const appNameStyle = 'background-color: #3b82f6; color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;';
                const messageStyle = 'color: inherit; font-weight: normal;';

                window.webContents.executeJavaScript(
                    `console.log("${ styledMessage }", "${ appNameStyle }", "${ messageStyle }")`
                );
            }
        }
        else
        {
            /**
                no color flags; plain text in both consoles
            */

            const displayMsg = typeof msg[ 0 ] === 'boolean' ? msg.slice( 1 ) : msg;
            console.log( safeJoin( displayMsg ) );

            if ( window && window.webContents )
            {
                window.webContents.executeJavaScript( `console.log("${ safeJoin( displayMsg ) }")` );
            }
        }
    }
}

/**
    electron > log transports

    Handle different configurations for main and renderer processes
    check if we're in the main process or renderer process
*/

const isMainProcess = process?.type === 'browser';
const isRendererProcess = process?.type === 'renderer';

/**
    initialize electron-log with safe config
*/

const initializeElectronLog = async() =>
{
    try
    {
        /**
            force initialization of electron-log package
        */

        if ( typeof log.initialize === 'function' )
            log.initialize();

        /**
            wait for transport to be available
        */

        if ( !log.transports )
        {
            Log.warn( 'electron-log transports not available, using fallback' );
            return false;
        }

        Log.debug( 'Available transports:', Object.keys( log.transports ) );
        Log.debug( 'Process type:', process.type );

        if ( isMainProcess )
        {
            /**
                Process > Main
            */

            try
            {
                /**
                    dynamic import for es modules
                */

                const electron = await import( 'electron' );
                const { app } = electron;

                /**
                    config file transport with custom path
                */

                if ( log.transports.file )
                {
                    const customLogPath = path.join( app.getAppPath(), 'logs', 'main.log' );
                    Log.debug( 'Setting main process log path to:', customLogPath );

                    /**
                        make sure log directory exists
                    */

                    const logDir = path.dirname( customLogPath );
                    if ( !fs.existsSync( logDir ) )
                    {
                        fs.mkdirSync( logDir, { recursive: true });
                        Log.debug( 'Created log directory:', logDir );
                    }

                    log.transports.file.level = 'debug';
                    log.transports.file.resolvePathFn = () => customLogPath;
                    log.transports.file.fileName = 'main.log';

                    /**
                        disable electron-log console output for main process
                        we handle console output manually with chalk colors
                    */

                    if ( log.transports.console )
                        log.transports.console.level = false;

                    /**
                        test write to verify path
                    */

                    setTimeout( () =>
                    {
                        Log.debug( 'electron-log initialized for main process' );
                    }, 100 );
                }
                else
                {
                    Log.warn( 'File transport not available in main process' );
                }
            }
            catch ( appError )
            {
                Log.warn( 'Could not configure main process logging:', appError.message );

                /**
                    fallback: try to use default electron-log file behavior
                */

                if ( log.transports.file )
                {
                    log.transports.file.level = 'debug';
                    Log.debug( 'Using default electron-log file path' );
                }
            }
        }
        else
        {
            /**
                Process > Renderer > Progress Log Configuration

                since renderer doesn't have file transport by default, use IPC to send to main process
            */

            console.debug( 'Renderer process detected - file transport not available by default' );
            console.debug( 'Logs will be sent via IPC to main process for file writing' );

            /**
                @important              completely disable electron-log console output in renderer
                                        We handle renderer console output via our custom IPC system
            */

            if ( log.transports.console )
            {
                log.transports.console.level = false;
                console.debug( 'Disabled electron-log console output in renderer - using custom IPC system' );
            }

            /**
                config IPC transport for renderer to main communication
                Disable this to prevent duplicate logging through electron-log's IPC
            */

            if ( log.transports.ipc )
            {
                log.transports.ipc.level = false;
                console.debug( 'Disabled electron-log IPC transport - using custom Log class IPC system' );
            }

            /**
                test write to verify renderer logging
            */

            setTimeout( () =>
            {
                Log.debug( 'electron-log initialized for renderer process' );
            }, 100 );
        }


        /**
            during tests: completely disable electron-log output to prevent test pollution
            while keeping the API available for our code to call
        */

        if ( process.env.NODE_ENV === 'test' )
        {
            /**
                save original methods; we may need them later
            */

            const originalMethods =
            {
                error: log.error,
                warn: log.warn,
                info: log.info,
                debug: log.debug,
                verbose: log.verbose
            };

            /**
                replace all electron-log methods with no-ops during tests
            */

            log.error = () => {};
            log.warn = () => {};
            log.info = () => {};
            log.debug = () => {};
            log.verbose = () => {};
            log.silly = () => {};

            /**
                disable all electron-log transports during tests
            */

            if ( log.transports.file )
                log.transports.file.level = false;
            if ( log.transports.console )
                log.transports.console.level = false;
            if ( log.transports.ipc )
                log.transports.ipc.level = false;
            if ( log.transports.remote )
                log.transports.remote.level = false;
        }
        else
        {
            /**
                disable remote transport (only when not in test environment)
            */

            if ( log.transports.remote )
                log.transports.remote.level = false;
        }

        /**
            debugging > log current configuration
        */

        Log.debug( 'File transport level:', log.transports.file?.level );
        Log.debug( 'Console transport level:', log.transports.console?.level );
        Log.debug( 'IPC transport level:', log.transports.ipc?.level );

        return true;
    }
    catch ( error )
    {
        /**
            only show warning in development or if NODE_ENV is not 'test'
        */

        if ( process.env.NODE_ENV !== 'test' && ( process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true' ) )
            Log.warn( 'Failed to initialize electron-log:', error.message );

        return false;
    }
};

/**
    initialize the log system
    This function is called automatically but can also be called manually for testing
*/

const initializeLogSystem = async() =>
{
    const logInitialized = await initializeElectronLog();

    /**
        fallback logging if electron-log fails
    */

    if ( !logInitialized && process.env.NODE_ENV !== 'test' && ( process.env.NODE_ENV === 'development' || process.env.DEV_MODE === 'true' ) )
        Log.warn( 'Using console fallback for logging' );

    /**
        make sure log level is set
    */

    process.env.LOG_LEVEL = process.env.LOG_LEVEL || '4';

    /**
        use a dummy log message to ensure everything is initialized
    */

    Log.debug( 'Log system initialized' );

    return logInitialized;
};

/**
    auto-initialize unless we're in test environment
*/

if ( process.env.NODE_ENV !== 'test' )
{
    initializeLogSystem();
}

/**
    override console.log
*/

// console.log = log.log;

/**
    send log to all renderer processes (Electron dev console)
*/

async function sendToRendererConsole( level, message, isSimplified = false )
{
    if ( typeof process !== 'undefined' )
    {
        if ( process.type === 'browser' )
        {
            /**
                Process > Main

                send to all renderer processes via IPC
            */

            try
            {
                const electron = await import( 'electron' );
                const { BrowserWindow } = electron;
                const allWindows = BrowserWindow.getAllWindows();

                allWindows.forEach( ( window ) =>
                {
                    if ( window && window.webContents && !window.webContents.isDestroyed() )
                    {
                        /**
                            send log data via IPC to renderer
                        */

                        window.webContents.send( 'main-log-to-renderer',
                        {
                            level: level,
                            message: message,
                            isSimplified: isSimplified,
                            appName: name
                        });
                    }
                });
            }
            catch ( error )
            {
                /**
                    fail silently if electron not available
                */

                Log.error( 'Failed to send log to renderer:', error.message );
            }
        }
    }
}

/**
    export class and initialization function

    @usage          import Log from './classes/Log.js';
    @usage          import { initializeLogSystem } from './classes/Log.js';
*/

export default Log;
export { initializeLogSystem };
