/**
    Class > Storage

    allows for us to save, store, and get settings configured by the user from the options available
    in the app settings.

    original version provided by:
        https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
*/

import electron from 'electron';
import path from 'path';
import fs from 'fs';

/**
    class > storage
*/

class Storage
{
    constructor( opts )
    {
        /**
            Renderer proccess has to get the app module from `remote`, whereas main process can get it directly.
            app.getPath('userData') will return a string of the user's app data directory path.
        */

        const userDataPath = ( electron.app || electron.remote.app ).getPath( 'userData' );

        /**
            Use `configName` property to set file name and path.join to bring everything together as string
        */

        this.path = path.join( userDataPath, opts.configName + `.json` );
        this.data = GetStorageFile( this.path, opts.defaults );
    }

    /**
        get property value; returned as string
    */

    get( key )
    {
        return this.data[ key ];
    }

    /**
        get property value; remove all whitespace
    */

    getSanitized( key )
    {
        return this.data[ key ].replace( /\s/g, '' );
    }

    /**
        get property value; returned as string but parsed as integer

        Non-numeric strings → 0
        true → 1
        false → 0
        null → 0
        undefined → 0
        undefined → 0
        '0042' → 42
        '0xFF' → 255
        '1e3' → 1000
        123abc' → 0 (NaN)
        '   ' → 0


    */

    getInt( key )
    {
        const value = this.data[ key ];

        // handle null and undefined
        if ( value === null || value === undefined ) return 0;

        // handle booleans
        if ( typeof value === 'boolean' ) return value ? 1 : 0;

        // handle empty strings
        if ( typeof value === 'string' && value.trim() === '' ) return 0;

        // convert to number and truncate to integer
        const num = Number( value );
        return isNaN( num ) ? 0 : Math.trunc( num );
    }

    /**
        Set Property Value
    */

    set( key, val )
    {
        this.data[ key ] = val;
        fs.writeFileSync( this.path, JSON.stringify( this.data ) );
    }
}

/**
    Storage > Get File

    grabs the existing data from the storage file and parses it for use.
*/

function GetStorageFile( filePath, defaults )
{
    /**
        try/catch in case config file does not yet exist. this is true when the user starts the app for the
        first time.

        `fs.readFileSync` returns a JSON string which we then parse into a Javascript object
    */

    try
    {
        return JSON.parse( fs.readFileSync( filePath ) );
    }
    catch ( error )
    {
        /**
            pass default value if error detected
        */

        return defaults;
    }
}

/**
    export class

    @usage          import Storage from './classes/Storage.js';
*/

export default Storage;
