/**
    electron > process > preload

    if you want to send messages from the Log.js class to electron dev console; you must use a boolean
    as the first argument:

        Log.ok( true, 'This is a log message' );
*/

import { contextBridge, ipcRenderer } from 'electron';
import Log from './classes/Log.js';
import chalk from 'chalk';

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
    just to confirm that our renderer process is successfully working
*/

console.log( '🔗 PRELOAD: Electron API exposed to renderer process' );
