/**
    Class > Log

    When assigning text colors, terminals and the windows command prompt can display any color; however apps
    such as Portainer console cannot. If you use 16 million colors and are viewing console in Portainer, colors will
    not be the same as the rgb value. It's best to just stick to Chalk's default colors.

    Various levels of logs with the following usage:
        Log.verbose(`This is verbose`)
        Log.debug(`This is debug`)
        Log.info(`This is info`)
        Log.ok(`This is ok`)
        Log.notice(`This is notice`)
        Log.warn(`This is warn`)
        Log.error(
            `Error fetching sports data with error:`,
            chalk.white(`→`),
            chalk.grey(`This is the error message`)
        );

        Level               Type
    -----------------------------------
        6                   Trace
        5                   Debug
        4                   Info
        3                   Notice
        2                   Warn
        1                   Error
*/

import fs from 'fs';
import chalk from 'chalk';

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
    Define
*/

const getLogLevel = () => parseInt( process.env.LOG_LEVEL ) || 4;           // dynamic LOG_LEVEL getter to allow runtime changes
const { name } = JSON.parse( fs.readFileSync( './package.json' ) );         // get app name to add to each log message

/**
    Class > Log

    When assigning text colors, terminals and the windows command prompt can display any color; however apps
    such as Portainer console cannot. If you use 16 million colors and are viewing console in Portainer, colors will
    not be the same as the rgb value. It's best to just stick to Chalk's default colors.

    if using this inside `preload.js`, you can only colorize the front part of the string.
        console.log( chalk.white.bgBlueBright.bold( ` ntfy-desktop ` ), 'Your Message' );

    if you attempt to stack or change colors, the electron dev console will print the ASCII code instead of showing the color
        console.log( chalk.white.bgBlueBright.bold( ` ntfy-desktop ` ), 'this', chalk.white.bgBlueBright.bold( ` wont work ` ) );

    to use this class with electron dev console messages; add a boolean to the front
        Log.ok( true, 'This is a message' );

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

    To send messages to electron dev console
        Log.ok( true, 'This is a message' );
        Log.verbose( true, 'This is a message' );

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
        if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
        {
            console.log( chalk.white.bgBlack.blackBright.bold( ` ${ name } ` ), msg.join( ' ' ) );
            return;
        }

        console.debug( chalk.white.bgBlack.blackBright.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.gray( msg.join( ' ' ) ) );
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

        if ( logLevel >= 7 )
        {
            if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
            {
                console.log( chalk.white.bgMagenta.bold( ` ${ name } ` ), msg.join( ' ' ) );
                return;
            }

            console.trace( chalk.white.bgMagenta.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.magentaBright( msg.join( ' ' ) ) );
        }
        else if ( logLevel >= 5 )
        {
            if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
            {
                console.log( chalk.white.bgGray.bold( ` ${ name } ` ), msg.join( ' ' ) );
                return;
            }

            console.debug( chalk.white.bgGray.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.gray( msg.join( ' ' ) ) );
        }
    }

    static info( ...msg )
    {
        if ( getLogLevel() < 4 ) return;
        if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
        {
            console.log( chalk.white.bgBlueBright.bold( ` ${ name } ` ), msg.join( ' ' ) );
            return;
        }

        console.info( chalk.white.bgBlueBright.bold( ` ${ name } ` ), chalk.white( ' ' ), this.now(), chalk.blueBright( msg.join( ' ' ) ) );
    }

    static ok( ...msg )
    {
        if ( getLogLevel() < 4 ) return;
        if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
        {
            console.log( chalk.white.bgGreen.bold( ` ${ name } ` ), msg.join( ' ' ) );
            return;
        }

        console.log( chalk.white.bgGreen.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.greenBright( msg.join( ' ' ) ) );
    }

    static notice( ...msg )
    {
        if ( getLogLevel() < 3 ) return;
        if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
        {
            console.log( chalk.white.bgYellow.bold( ` ${ name } ` ), msg.join( ' ' ) );
            return;
        }

        console.log( chalk.white.bgYellow.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.yellowBright( msg.join( ' ' ) ) );
    }

    static warn( ...msg )
    {
        if ( getLogLevel() < 2 ) return;
        if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
        {
            console.log( chalk.white.bgYellow.bold( ` ${ name } ` ), msg.join( ' ' ) );
            return;
        }

        console.warn( chalk.white.bgYellow.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.yellowBright( msg.join( ' ' ) ) );
    }

    static error( ...msg )
    {
        if ( getLogLevel() < 1 ) return;
        if ( typeof msg[ 0 ] === 'boolean' &&  msg[ 0 ] === true )
        {
            console.log( chalk.white.bgRedBright.bold( ` ${ name } ` ), msg.join( ' ' ) );
            return;
        }

        console.error( chalk.white.bgRedBright.bold( ` ${ name } ` ), chalk.white( ` ` ), this.now(), chalk.redBright( msg.join( ' ' ) ) );
    }

    /**
        used to show log messages both in the node command prompt console AND electron developer console
    */

    static broadcast( window, ...msg )
    {
        console.log( msg.join( ' ' ) );
        if ( window && window.webContents )
        {
            window.webContents.executeJavaScript( `console.log("${ msg.join( ' ' ) }")` );
        }
    }
}

/**
    export class

    @usage          import Log from './classes/Log.js';
*/

export default Log;
