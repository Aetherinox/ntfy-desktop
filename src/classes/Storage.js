/**
    Class > Storage

    allows for us to save, store, and get settings configured by the user from the options available
    in the app settings.
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

        this.path = path.join( userDataPath, opts.configName + '.json' );
        this.data = parseDataFile( this.path, opts.defaults );
    }

    /**
        Get Property Value
    */

    get( key )
    {
        return this.data[ key ];
    }

    /**
        Get Property Value as number
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
    parse data files
*/

function parseDataFile( filePath, defaults )
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
