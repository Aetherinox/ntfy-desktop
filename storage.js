const electron = require( 'electron' );
const path = require( 'path' );
const fs = require( 'fs' );

class Storage
{
    constructor( opts )
    {
        /*
            Renderer proccess has to get the app module from `remote`, whereas main process can get it directly.
            app.getPath('userData') will return a string of the user's app data directory path.
        */

        const userDataPath = ( electron.app || electron.remote.app ).getPath( 'userData' );

        /*
            Use `configName` property to set file name and path.join to bring everything together as string
        */

        this.path = path.join( userDataPath, opts.configName + '.json' );
        this.data = parseDataFile( this.path, opts.defaults );
    }

    /*
        Get Property Value
    */

    get( key )
    {
        return this.data[key];
    }

    /*
        Set Property Value
    */

    set( key, val )
    {
        this.data[key] = val;
        fs.writeFileSync( this.path, JSON.stringify( this.data ) );
    }
}

function parseDataFile( filePath, defaults )
{
    /*
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
        /*
            pass default value if error detected
        */

        return defaults;
    }
}

module.exports = Storage;
