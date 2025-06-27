/**
    electron > process > preload

    Logs from the main process are automatically forwarded to the electron dev console.
    The app name will be colored, and the rest of the message will be plain text.
*/

import { contextBridge, ipcRenderer } from 'electron';
import Log from './classes/Log.js';
import chalk from 'chalk';
import log from 'electron-log';

/**
    Disable electron-log console output in preload process to prevent duplicates
    This ensures the preload script doesn't interfere with our custom logging
*/

if ( log.transports && log.transports.console )
{
    log.transports.console.level = false;
}

if ( log.transports && log.transports.ipc )
{
    log.transports.ipc.level = false;
}

/**
    expose protected methods that allow the renderer process to use
    the ipcRenderer without exposing the entire object
*/

contextBridge.exposeInMainWorld( 'electron',
{
    /**
        send message to main process
    */

    sendToMain: ( chan, data ) =>
    {
        /**
            list of channels to allow for communication
        */

        const allowChans = [ 'toMain', 'button-clicked' ];
        if ( allowChans.includes( chan ) )
            ipcRenderer.send( chan, data );
    },

    /**
        receive message from main process
    */

    receiveFromMain: ( chan, func ) =>
    {
        const allowChans = [ 'fromMain' ];
        if ( allowChans.includes( chan ) )
        {
            /**
                strip event since it includes 'sender' info
            */

            ipcRenderer.on( chan, ( env, ...args ) => func( ...args ) );
        }
    },

    /**
        handle ping for testing
    */

    ping: () => ipcRenderer.invoke( 'ping' )
});

/**
    Set up IPC listener for main process logs
*/

ipcRenderer.on( 'main-log-to-renderer', ( event, logData ) =>
{
    const { level, message, isSimplified, appName } = logData;

    /*
        Helper functions for console styling
    */

    const getConsoleMethod = ( level ) =>
    {
        switch ( level )
        {
            case 'error': return 'error';
            case 'warn':
            case 'notice': return 'warn';
            case 'info':
            case 'ok': return 'log';
            case 'debug':
            case 'verbose': return 'debug';
            default: return 'log';
        }
    };

    const getConsoleStyle = ( level ) =>
    {
        const baseStyle = 'color: white; font-weight: bold; padding: 2px 6px; border-radius: 3px;';

        switch ( level )
        {
            case 'error':
                return `background-color: #dc2626; ${ baseStyle }`; // red
            case 'warn':
            case 'notice':
                return `background-color: #eab308; ${ baseStyle }`; // yellow
            case 'info':
                return `background-color: #3b82f6; ${ baseStyle }`; // blue
            case 'ok':
                return `background-color: #16a34a; ${ baseStyle }`; // green
            case 'debug':
                return `background-color: #6b7280; ${ baseStyle }`; // gray
            case 'verbose':
                return `background-color: #6b7280; ${ baseStyle }`; // gray
            default:
                return `background-color: #3b82f6; ${ baseStyle }`; // default blue
        }
    };

    /*
        Route logs to renderer console with appropriate styling
    */

    if ( isSimplified )
    {
        // App name colored, message plain text
        const styledMessage = `%c ${ appName } %c ${ message }`;
        const appNameStyle = getConsoleStyle( level );
        const messageStyle = 'color: inherit; font-weight: normal;';

        console[ getConsoleMethod( level ) ]( styledMessage, appNameStyle, messageStyle );
    }
    else
    {
        // Plain text logs
        console[ getConsoleMethod( level ) ]( `${ appName }: ${ message }` );
    }
});

/**
    just to confirm that our renderer process is successfully working
*/

Log.debug( '🔗 PRELOAD: Electron API exposed to renderer process' );
