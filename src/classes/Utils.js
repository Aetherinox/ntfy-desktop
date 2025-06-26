import chalk from 'chalk';
import Log from './Log.js';

class Utils
{
    /**
        Returns the name of the function that this function was called from.
        used for Log.verbose
    */

    static getFuncName()
    {
        return ( new Error() ).stack.match( /at (\S+)/g )[ 1 ].slice( 3 );
    }

    /**
        Returns the name of the constructor that this function was called from.
        used for Log.verbose
    */

    static getConstructorName()
    {
        return ( new Error() ).stack.match( /new\s+(\w+)/g )[ 0 ];
    }

    /**
        check if json has been converted to string
    */

    // Storage.isJsonString
    static isJsonString( json )
    {
        Log.verbose( `func`, chalk.yellow( `[executed]` ), chalk.white( `: ` ), chalk.blueBright( `<name>` ), chalk.gray( `${ this.getFuncName() }` ) );

        try
        {
            JSON.parse( json );
        }
        catch ( e )
        {
            return false;
        }

        return true;
    }

    /**
        helper > json object empty
    */

    // Storage.isJsonEmpty
    static isJsonEmpty( json )
    {
        Log.verbose( `func`, chalk.yellow( `[executed]` ), chalk.white( `: ` ), chalk.blueBright( `<name>` ), chalk.gray( `${ this.getFuncName() }` ) );

        if ( Object.keys( json ).length === 0 )
            return true;

        if ( JSON.stringify( json ) === '\"{}\"' )
            return true;

        for ( const key in json )
        {
            if ( ! Object.prototype.hasOwnProperty.call( json, key ) )
                return true;
        }

        return false;
    }
}

export default Utils;
