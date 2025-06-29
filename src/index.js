/*
    electron > main process

    this is the main project file to initiate the electron app
*/

import { app, BrowserWindow, dialog, ipcMain, Tray, shell, Menu, MenuItem } from 'electron';
import path from 'path';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import log from 'electron-log';
import toasted from 'toasted-notifier';
import prompt from 'electron-plugin-prompts';
import Log from './classes/Log.js';
import Storage from './classes/Storage.js';
import Utils from './classes/Utils.js';
import { fileURLToPath } from 'url';
import { newMenuMain, newMenuContext, setMenuDeps } from './classes/Menu.js';

/**
    Define > Package.json
*/

import packageJson from '#package' with { type: 'json' };
const appVer = packageJson.version;
const appName = packageJson.name;
const appTitle = packageJson.title;
const appAuthor = packageJson.author;
const appElectron = process.versions.electron;
const appRepo = packageJson.repository;
const appIcon = app.getAppPath() + '/assets/icons/ntfy.png';

/**
    Define > Env Variables
*/

const LOG_LEVEL = process.env.LOG_LEVEL || 4;
const DEV_MODE = process.env.DEV_MODE || false;

/**
    initialize electron-log for main process
    this will be called after app is ready
*/

function initializeMainProcessLogging()
{
    try
    {
        /*
            set up file transport for main process
        */

        log.transports.file.level = 'debug';

        /*
            for packaged apps; use a better location.
            try mutliple possible paths for better compatibility, because why not.
        */

        let logDir, logPath;
        const isPackaged = app.isPackaged;

        if ( DEV_MODE === true )
        {
            Log.info( 'Starting main process logging...' );
            Log.info( '(bool) App packaged:', isPackaged );
            Log.info( '(str)  App path:', app.getAppPath() );
            Log.info( '(str)  User data path:', app.getPath( 'userData' ) );
            Log.info( '(str)  Logs path:', app.getPath( 'logs' ) );
        }

        if ( isPackaged )
        {
            /*
                for packaged version of ntfy, use the folder where the exe is located.
                process.execPath will output the path to the .exe file
            */

            const exeDir = path.dirname( process.execPath );
            logDir = path.join( exeDir, 'logs' );
        }
        else
        {
            /*
                in development mode; use app path
            */

            logDir = path.join( app.getAppPath(), 'logs' );
        }

        // eslint-disable-next-line prefer-const
        logPath = path.join( logDir, 'main.log' );

        if ( DEV_MODE === true )
        {
            console.log( 'Selected log directory:', logDir );
            console.log( 'Selected log file path:', logPath );
        }

        /*
            make sure our folder exists
        */

        try
        {
            if ( !fs.existsSync( logDir ) )
            {
                fs.mkdirSync( logDir, { recursive: true });
                if ( DEV_MODE === true )
                    console.log( 'Created log directory:', logDir );
            }
            else
            {
                if ( DEV_MODE === true )
                    console.log( 'Log directory already exists:', logDir );
            }

            /*
                test write permissions
            */

            const testFile = path.join( logDir, 'test.log' );
            fs.writeFileSync( testFile, 'test' );
            fs.unlinkSync( testFile );

            if ( DEV_MODE === true )
                console.log( 'Log directory is writable' );
        }
        catch ( dirError )
        {
            console.error( 'Failed to create/access log directory:', dirError.message );

            // Fallback to electron-log's default path
            console.log( 'Using electron-log default path as fallback' );
            log.transports.file.level = 'debug';
            log.transports.console.level = 'debug';
            log.info( 'Main process electron-log initialized with default path' );

            return true;
        }

        // Configure the file transport
        log.transports.file.resolvePathFn = () =>
        {
            if ( DEV_MODE === true )
                console.log( 'electron-log requesting file path, returning:', logPath );

            return logPath;
        };

        log.transports.file.fileName = 'main.log';

        // Disable console transport to prevent double logging
        // We handle console output manually with chalk colors
        log.transports.console.level = false;

        /*
            debugging > force test write
        */

        setTimeout( () =>
        {
            Log.info( 'Log file should be at:', logPath );
        }, 500 );

        Log.debug( 'electron-log file transport configured for main process' );

        return true;
    }
    catch ( error )
    {
        Log.error( 'Failed to initialize main process logging:', error.message );
        Log.error( 'Error stack:', error.stack );

        return false;
    }
}

/**
    Define > Menus
*/

let menuMain, menuTray;

/**
    Define > cjs vars converted to esm
*/

const __filename = fileURLToPath( import.meta.url );        // get resolved path to the file
const __dirname = path.dirname( __filename );               // get name of the directory

/**
    chalk.level

    @ref                https://npmjs.com/package/chalk
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
    Debug > Print args
*/

console.log( process.argv );

/**
    Define > Electron Elements
*/

let guiMain, guiAbout, guiTray;

/**
    Define > CLI State

    bDevTools           --dev           dev tools added to menu
    bHotkeysEnabled     --hotkeys       keyboard shortcuts added to menu
    bQuitOnClose        --terminate     when pressing top-right close button, app exits instead of going to tray
    bWinHidden          --hidden        app closes to tray on start
*/

let bDevTools = 0;
let bHotkeysEnabled = 0;
let bQuitOnClose = 0;
let bWinHidden = 0;
const bStartHidden = 0;

/**
    Define > Status
*/

let statusBoolError = false;                        // user instance url returned error
let statusBadURL = false;                           // user instance url entered a bad url
let statusStrMsg;                                   // string status message
let isShuttingDown = false;                         // determine if app is currently attempting to shut down
let pollInterval = null;                            // store interval reference for proper cleanup

/**
    Define > Default Fallbacks

    fallback values in case a user does something unforeseen to cause an index error.
    if you try to poll too quick on the official instance; it will throw an error:
        ["{\"code\":42909,\"http\":429,\"error\":\"limit reached: too many auth failures; increase your limits with a paid plan, see https://ntfy.sh\",\"link\":\"https://ntfy.sh/docs/publish/#limitations\"}"]
*/

const defInstanceUrl = `https://ntfy.sh/app`;       // default instance url
const defDatetime = `YYYY-MM-DD hh:mm a`;           // default datetime format
const defTopics = `announcements,stats`;            // default ntfy topics
const defPollrate = 60;                             // default polling rate
const minPollrate = 5;                              // minimum poll rate to prevent rate limiting
const maxPollrate = 3600;                           // maximum poll rate (1 hour)
const maxRetries = 3;                               // maximum retry attempts for network requests

/**
    Define > Store Values

    @note               defaults will not be set until the first time a user edits any of their settings.
                        storage: AppData\Roaming\ntfy-desktop
*/

const store = new Storage(
{
    configName: 'prefs',
    defaults: {
        instanceURL: defInstanceUrl,
        apiToken: '',
        topics: defTopics,
        indicatorMessages: 0,
        bHotkeys: 0,
        bDevTools: 0,
        bQuitOnClose: 0,
        bStartHidden: 0,
        bPersistentNoti: 0,
        bLocalhost: 0,
        datetime: defDatetime
    }
});

/**
    helper > validate instance url

    checks a given instance url to see if it is valid.
    this check is bypassed if the user enables localhost mode in the interface settings.
*/

function IsValidUrl( uri, tries, delay )
{
    const originalTries = tries;                                                // Store original value for error reporting
    return new Promise( ( success, reject ) =>
    {
        ( function rec( i )
        {
            /**
                create an AbortController for timeout handling
            */

            const controller = new AbortController();
            const timeoutId = setTimeout( () => controller.abort(), 10000 );    // 10 sec timeout

            /**
                determine if this is a localhost/local network url
            */

            const isLocalUrl = uri.includes( 'localhost' ) ||
                              uri.includes( '127.0.0.1' ) ||
                              uri.includes( '0.0.0.0' ) ||
                              uri.match( /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/i );

            /**
                configure fetch options based on URL type
            */

            const fetchOptions =
            {
                method: 'HEAD',                                                 // use HEAD request for faster validation
                redirect: 'follow',
                signal: controller.signal,
                headers: {
                    'User-Agent': 'ntfy-desktop-validator/1.0',
                    Accept: '*/*',
                    'Cache-Control': 'no-cache'
                }
            };

            /**
                specifically for localhost and local network urls, use different mode
            */

            if ( isLocalUrl )
            {
                fetchOptions.mode = 'cors';
                fetchOptions.headers[ 'Access-Control-Request-Method' ] = 'HEAD';       // add additional headers that might be needed for local apps
            }
            else
            {
                fetchOptions.mode = 'no-cors';
            }

            fetch( uri, fetchOptions )
            .then( ( response ) =>
            {
                clearTimeout( timeoutId );

                /**
                    no-CORS mode

                    we can't check status, but if we get here, the URL resolved
                */

                if ( fetchOptions.mode === 'no-cors' )
                {
                    success( response );
                    return;
                }

                /**
                    CORS mode (localhost / self-hosted)

                    check if response is reasonable
                    accept any response that isn't a clear network error
                */

                if ( response.status < 500 || response.type === 'opaque' )
                    success( response );
                else
                    throw new Error( `Server error: ${ response.status }` );
            })
            .catch( ( err ) =>
            {
                clearTimeout( timeoutId );

                /**
                    for localhost urls, try a fallback GET request if HEAD fails
                */

                if ( isLocalUrl && fetchOptions.method === 'HEAD' && tries > 1 )
                {
                    const fallbackOptions = { ...fetchOptions, method: 'GET' };
                    const fallbackController = new AbortController();
                    const fallbackTimeoutId = setTimeout( () => fallbackController.abort(), 5000 );
                    fallbackOptions.signal = fallbackController.signal;

                    fetch( uri, fallbackOptions )
                    .then( ( response ) =>
                    {
                        clearTimeout( fallbackTimeoutId );

                        if ( response.status < 500 || response.type === 'opaque' )
                            success( response );
                        else
                            throw new Error( `Server error: ${ response.status }` );
                    })
                    .catch( ( fallbackErr ) =>
                    {
                        clearTimeout( fallbackTimeoutId );

                        if ( tries === 0 )
                            return reject( new Error( `Failed to validate URL: ${ fallbackErr.message }` ) );

                        setTimeout( () => rec( --tries ), delay );
                    });

                    return;
                }

                if ( tries === 0 )
                {
                    let errorMsg = `Failed to resolve URL after ${ originalTries } attempts`;
                    if ( err.name === 'AbortError' )
                        errorMsg += ' (timeout)';
                    else if ( err.message )
                        errorMsg += `: ${ err.message }`;

                    return reject( new Error( errorMsg ) );
                }

                setTimeout( () => rec( --tries ), delay );
            });
        })( tries );
    });
}

/**
    Badges > Update
*/

function UpdateBadge( i )
{
    let userMsgs = store.getInt( 'indicatorMessages' );
    if ( !userMsgs || Number.isNaN( userMsgs ) )
        userMsgs = 0;

    userMsgs = userMsgs + ( i || 1 );
    store.set( 'indicatorMessages', userMsgs );
    app.badgeCount = userMsgs;
}

/**
    Get Message Data

    Even though ntfy's permissions are open by default, provide authorization bearer for users who
    have their permissions set to 'deny'.

    API Token can be specified in app.
*/

async function GetMessageData( uri )
{
    if ( isShuttingDown )
    {
        Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `Skipping message fetch - app is shutting down` ) );

        return null;
    }

    try
    {
        const controller = new AbortController();
        const timeoutId = setTimeout( () => controller.abort(), 30000 );    // 30 second timeout

        const req = await fetch( uri,
        {
            method: 'GET',
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${ store.get( 'apiToken' ) || '' }`,
                'User-Agent': `ntfy-desktop/${ appVer }`,
                'Cache-Control': 'no-cache'
            }
        });

        clearTimeout( timeoutId );

        /**
            ntfy has the option to output message results as json, however the structure of that json
            is not properly formatted json and adds a newline to the end of each message.

            bring the json results in as a string, split them at newline and then push them to a new
            array.
        */

        const json = await req.text();
        const jsonArr = [];
        const entries = json.split( '\n' );
        for ( let i = 0; i < entries.length; i++ )
        {
            jsonArr.push( entries[ i ] );
        }

        /**
            Filter out empty entry in array which was caused by the last newline
        */

        const jsonResult = jsonArr.filter( ( el ) =>
        {
            return el !== null && el !== '';
        });

        return jsonResult;
    }
    catch ( err )
    {
        if ( err.name === 'AbortError' )
        {
            Log.warn( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.yellowBright( `<msg>` ), chalk.gray( `Request to ntfy server timed out` ),
                chalk.yellowBright( `<uri>` ), chalk.gray( `${ uri }` ) );
        }
        else
        {
            Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
                chalk.redBright( `<msg>` ), chalk.gray( `Failed to get messages from ntfy server` ),
                chalk.redBright( `<error>` ), chalk.gray( `${ err.message }` ),
                chalk.redBright( `<uri>` ), chalk.gray( `${ uri }` ) );
        }
        return null;
    }
}

/**
    Get Messages

    ntfy url requires '&poll=1' otherwise the requests will freeze.
    @ref        : https://docs.ntfy.sh/subscribe/api/#poll-for-messages
*/

const msgHistory = [];
let isPolling = false;              // prevent concurrent polling

async function GetMessages( )
{
    /**
        this is to prevent concurrent polling
    */

    if ( isPolling )
    {
        Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `Polling already in progress, skipping` ) );

        return;
    }

    if ( isShuttingDown )
    {
        Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `App is shutting down, stopping polling` ) );

        return;
    }

    isPolling = true;

    try
    {
        const cfgInstanceURL = store.get( 'instanceURL' );
        const cfgTopics = store.getSanitized( 'topics', defTopics );
        let cfgPollrate = store.get( 'pollrate' ) || defPollrate;

        /*
            validate and clamp poll rate
        */

        cfgPollrate = Math.max( minPollrate, Math.min( maxPollrate, cfgPollrate ) );
        if ( cfgPollrate !== store.get( 'pollrate' ) )
        {
            store.set( 'pollrate', cfgPollrate );
            Log.warn( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.yellowBright( `<msg>` ), chalk.gray( `Poll rate was out of bounds, clamped to ${ cfgPollrate }s` ) );
        }

        /**
            Instance url missing
        */

        if ( !cfgInstanceURL || cfgInstanceURL === '' || cfgInstanceURL === null )
        {
            Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
                chalk.redBright( `<msg>` ), chalk.gray( `Aborting attempt to fetch new messages; instance url missing` ),
                chalk.redBright( `<func>` ), chalk.gray( `GetMessages()` ) );

            return;
        }

        /**
            Topics validation
        */

        if ( !cfgTopics || cfgTopics.trim() === '' )
        {
            Log.warn( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.yellowBright( `<msg>` ), chalk.gray( `No topics configured, skipping message fetch` ) );

            return;
        }

    /**
        Concatenate instance query url
    */

    let uri = `${ cfgInstanceURL }/${ cfgTopics }/json?since=${ cfgPollrate }s&poll=1`;

    Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `⚙️` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `fetching messages from url` ),
        chalk.blueBright( `<url>` ), chalk.gray( `${ cfgInstanceURL }` ),
        chalk.blueBright( `<topics>` ), chalk.gray( `${ cfgTopics }` ),
        chalk.blueBright( `<pollrate>` ), chalk.gray( `${ cfgPollrate }` ) );

    /**
        For the official ntfy.sh API, url must be changed internally
            https://ntfy.sh/app/ -> https://ntfy.sh/
    */

    if ( uri.includes( 'ntfy.sh/app' ) )
        uri = uri.replace( 'ntfy.sh/app', 'ntfy.sh' );

    /**
        Bad URL detected, skip polling
    */

    if ( statusBadURL === true )
    {
        Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
            chalk.redBright( `<msg>` ), chalk.gray( `Could not resolve specified instance url; aborting attempt to poll for messages` ),
            chalk.redBright( `<url>` ), chalk.gray( `${ uri }` ),
            chalk.redBright( `<func>` ), chalk.gray( `GetMessages()` ) );

        return;
    }

        /**
            get pending messages from polling
        */

        const json = await GetMessageData( uri );

        /**
            Check if request failed or returned null
        */

        if ( json === null )
        {
            Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.blueBright( `<msg>` ), chalk.gray( `Message fetch returned null, skipping processing` ) );
            return;
        }

        /**
            will be thrown if the instance url does not return valid json (ntfy server possibly down?)
        */

        if ( Utils.isJsonString( json ) === false )
        {
            Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
                chalk.redBright( `<msg>` ), chalk.gray( `Polling for new messages returned invalid json; skipping fetch. Change your instance URL to a valid ntfy instance.` ),
                chalk.redBright( `<func>` ), chalk.gray( `GetMessages()` ) );

            return;
        }

    Log.info( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Fetching new messages` ),
        chalk.blueBright( `<instance>` ), chalk.gray( `${ cfgInstanceURL }` ),
        chalk.blueBright( `<query>` ), chalk.gray( `${ uri }` ),
        chalk.blueBright( `<topics>` ), chalk.gray( `${ cfgTopics }` ) );

    /**
        Loop ntfy api results.
        only items with event = 'message' will be allowed through to display in a notification.
    */

    Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Ntfy server query response` ),
        chalk.blueBright( `<history>` ), chalk.gray( `${ msgHistory }` ),
        chalk.blueBright( `<messages>` ), chalk.gray( `${ JSON.stringify( json ) }` ) );

    /**
        Loop all messages to send to user notifications
    */

    for ( let i = 0; i < json.length; i++ )
    {
        const object = JSON.parse( json[ i ] );
        const id = object.id;
        const type = object.event;
        const time = object.time;
        const expires = object.expires;
        const message = object.message;
        const topic = object.topic;

        /**
            Auth Error > 401
                Unauthorized connection
        */

        if ( object.http === 401 )
        {
            Log.warn( `auth`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.yellowBright( `<msg>` ), chalk.red( `Unauthorized connection, ensure you set the correct instance URL, and provide your API Token` ),
                chalk.yellowBright( `<url>` ), chalk.gray( `${ defInstanceUrl }` ),
                chalk.yellowBright( `<docs>` ), chalk.gray( `${ object.link }` ) );

            continue;
        }

        /**
            Auth Error > 429
                Poll limit reached
        */

        if ( object.http === 429 )
        {
            Log.warn( `auth`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.yellowBright( `<msg>` ), chalk.red( `poll limit reached: too many auth failures; increase your limits with a paid plan, see https://ntfy.sh` ),
                chalk.yellowBright( `<url>` ), chalk.gray( `${ defInstanceUrl }` ),
                chalk.yellowBright( `<docs>` ), chalk.gray( `${ object.link }` ) );

            continue;
        }

        /**
            Other errors
        */

        if ( object.error )
        {
            Log.warn( `auth`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.yellowBright( `<msg>` ), chalk.red( `skipped getting pending messages` ),
                chalk.yellowBright( `<error>` ), chalk.red( `${ object.error }` ),
                chalk.yellowBright( `<code>` ), chalk.red( `${ object.http }` ),
                chalk.yellowBright( `<url>` ), chalk.gray( `${ defInstanceUrl }` ),
                chalk.yellowBright( `<docs>` ), chalk.gray( `${ object.link }` ) );
        }

        /**
            skip other notifications that aren't messages
        */

        if ( type !== 'message' )
            continue;

        /**
            convert unix timestamp into human readable
        */

        // eslint-disable-next-line no-constant-binary-expression
        const dateHuman = moment.unix( time ).format( store.get( 'datetime' || defDatetime ) );

        /**
            debugging to console to show the status of messages
        */

        const msgStatus = msgHistory.includes( id ) === true ? 'already sent, skipping' : 'pending send';

        Log.info( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `Pending messages received` ),
            chalk.blueBright( `<type>` ), chalk.gray( `${ type }` ),
            chalk.blueBright( `<id>` ), chalk.gray( `${ id }` ),
            chalk.blueBright( `<status>` ), chalk.gray( `${ msgStatus }` ) );

        /**
            @ref            https://github.com/Aetherinox/toasted-notifier
        */

        const cfgPersistent = store.getInt( 'bPersistentNoti' ) !== 0;
        const cfgInstanceURL = store.get( 'instanceURL' );

        if ( !msgHistory.includes( id ) )
        {
            toasted.notify({
                title: `${ topic } - ${ dateHuman }`,
                subtitle: `${ dateHuman }`,
                message: `${ message }`,
                sound: 'Pop',
                open: cfgInstanceURL,
                persistent: cfgPersistent,
                sticky: cfgPersistent
            });

            msgHistory.push( id );

            /**
                Calcuate badge count
            */

            UpdateBadge( );

            Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
                chalk.blueBright( `<msg>` ), chalk.gray( `Sent pending ntfy messages to client` ),
                chalk.blueBright( `<type>` ), chalk.gray( `${ type }` ),
                chalk.blueBright( `<id>` ), chalk.gray( `${ id }` ),
                chalk.blueBright( `<date>` ), chalk.gray( `${ dateHuman }` ),
                chalk.blueBright( `<topic>` ), chalk.gray( `${ topic }` ),
                chalk.blueBright( `<instance>` ), chalk.gray( `${ cfgInstanceURL }` ) );
        }
    }

        Log.ok( `core`, chalk.yellow( `[instance]` ), chalk.white( `:  ` ),
            chalk.greenBright( `<msg>` ), chalk.gray( `Messages checked` ),
            chalk.greenBright( `<instance>` ), chalk.gray( `${ uri }` ) );

        return json;
    }
    catch ( error )
    {
        Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
            chalk.redBright( `<msg>` ), chalk.gray( `Error during message polling` ),
            chalk.redBright( `<error>` ), chalk.gray( `${ error.message }` ) );
        return null;
    }
    finally
    {
        isPolling = false;
    }
}

/**
    helper functions to manage state
*/

function setStatusBadURL( value )
{
    statusBadURL = value;
}

function setStatusStrMsg( value )
{
    statusStrMsg = value;
}

function setPollInterval( value )
{
    pollInterval = value;
}

/**
    must wait for app to be ready before setting dependencies

    menus will be initialized in the ready() function
*/

function initializeMenus()
{
    setMenuDeps(
    {
        store,
        bHotkeysEnabled,
        appIcon,
        defInstanceUrl,
        defTopics,
        defDatetime,
        defPollrate,
        minPollrate,
        maxPollrate,
        guiMain,
        prompt,
        activeDevTools,
        IsValidUrl,
        statusBadURL,
        setStatusBadURL,
        statusStrMsg,
        setStatusStrMsg,
        pollInterval,
        setPollInterval,
        GetMessages,
        Log,
        chalk,
        toasted,
        UpdateBadge,
        shell,
        packageJson,
        appTitle,
        appVer,
        appRepo,
        appAuthor,
        appElectron,
        gracefulShutdown,
        app
    });

    /**
        get menus
    */

    menuMain = newMenuMain();
    menuTray = newMenuContext();

    /**
        menu > main > Set
    */

    const menuHeader = Menu.buildFromTemplate( menuMain );
    Menu.setApplicationMenu( menuHeader );

    return { menuMain, menuTray };
}

/**
    Main Menu > Developer Tools

    adds `developer tools` to end of main menu if toggled in user settings.
*/

function activeDevTools()
{
    const menuHeader = Menu.buildFromTemplate( menuMain );
    Menu.setApplicationMenu( menuHeader );

    if ( bDevTools === 1 || store.getInt( 'bDevTools' ) === 1 )
    {
        const menuItem = menuHeader.getMenuItemById( 'view' );

        menuItem.submenu.insert( menuHeader.items.length + 1, new MenuItem(
        {
            type: 'separator'
        }) );
        menuItem.submenu.insert( menuHeader.items.length + 2, new MenuItem(
        {
            label: 'Toggle Dev Tools',
            accelerator: process.platform === 'darwin' ? 'ALT+CMD+I' : 'CTRL+SHIFT+I',
            click: () =>
            {
                guiMain.webContents.toggleDevTools();
            }
        }) );
    }
}

/**
    app > ready
*/

function ready()
{
    // Initialize main process logging first
    initializeMainProcessLogging();

    Log.info( `core`, chalk.yellow( `[initiate]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Starting ${ appName }` ),
        chalk.blueBright( `<version>` ), chalk.gray( `${ appVer }` ),
        chalk.blueBright( `<electron>` ), chalk.gray( `${ appElectron }` ) );

    /**
        new window
    */

    guiMain = new BrowserWindow(
    {
        title: `${ appTitle } : v${ appVer }`,
        width: 1280,
        height: 720,
        icon: appIcon,
        webPreferences:
        {
            preload: path.join( __dirname, 'preload.js' ),      // use a preload script
            nodeIntegration: false,                             // security: disable node integration
            contextIsolation: true,                             // security: enable context isolation
            enableRemoteModule: false,                          // security: disable remote module
            sandbox: false,                                     // keep false for preload script functionality
            webSecurity: true,                                  // security: enable web security
            allowRunningInsecureContent: false,                 // security: block insecure content
            experimentalFeatures: false                         // security: disable experimental features
        },
        backgroundColor: '#212121'
    });

    /**
        initialize menu after window creation when guiMain is available
    */

    initializeMenus();

    /**
        Load default url to main window

        since the user has settings they can modify; add check to instanceUrl and ensure it is a valid string.
        otherwise app will return invalid index and stop loading.
    */

    if ( typeof ( store.get( 'instanceURL' ) ) !== 'string' || store.get( 'instanceURL' ) === '' || store.get( 'instanceURL' ) === null )
    {
        store.set( 'instanceURL', defInstanceUrl );

        statusBoolError = true;
        statusStrMsg = `Invalid instance URL specified; defaulting to ${ defInstanceUrl }`;

        Log.warn( `core`, chalk.yellow( `[warn]` ), chalk.white( `:  ` ),
            chalk.yellowBright( `<msg>` ), chalk.yellowBright( `Invalid instance URL specified; setting to default instance url` ),
            chalk.yellowBright( `<url>` ), chalk.gray( `${ defInstanceUrl }` ) );
    }

    /**
        Validate URL

        Invalid URLs should not perform polling.
        load default defInstanceUrl url

        add renderer script injection for all instances
    */

    guiMain.webContents.on( 'dom-ready', () =>
    {
        try
        {
            const rendererContent = fs.readFileSync( path.join( __dirname, 'renderer.js' ), 'utf8' );
            guiMain.webContents.executeJavaScript( rendererContent );
            Log.info( `core`, chalk.yellow( `[renderer]` ), chalk.white( `:  ` ),
                chalk.blueBright( `<msg>` ), chalk.gray( `Renderer script injected successfully` ) );
        }
        catch ( error )
        {
            Log.error( `core`, chalk.redBright( `[renderer]` ), chalk.white( `:  ` ),
                chalk.redBright( `<msg>` ), chalk.gray( `Failed to inject renderer script` ),
                chalk.redBright( `<error>` ), chalk.gray( `${ error.message }` ) );
        }
    });

    /**
        get instance url;
        determine if the user has enabled localhost

        in localhost mode, we do not validate the url

        @todo:              add conditions to IsValidUrl to support localhost websites
    */

    const instanceUrl = store.get( 'instanceURL' ) || defInstanceUrl;
    if ( store.getInt( 'bLocalhost' ) === 1 )
    {
        guiMain.loadURL( instanceUrl );
    }
    else
    {
        IsValidUrl( instanceUrl, maxRetries, 1000 ).then( ( item ) =>
        {
            Log.ok( `core`, chalk.yellow( `[instance]` ), chalk.white( `:  ` ),
                chalk.greenBright( `<msg>` ), chalk.gray( `Specified instance successfully resolves` ),
                chalk.greenBright( `<instance>` ), chalk.gray( `${ instanceUrl }` ) );

            statusBadURL = false;
            guiMain.loadURL( store.get( 'instanceURL' ) );
        }).catch( ( err ) =>
        {
            Log.error( `core`, chalk.redBright( `[instance]` ), chalk.white( `:  ` ),
                chalk.redBright( `<msg>` ), chalk.gray( `Failed to resolve instance url; switching to default` ),
                chalk.redBright( `<error>` ), chalk.gray( `${ err.message }` ),
                chalk.redBright( `<instanceBad>` ), chalk.gray( `${ instanceUrl }` ),
                chalk.redBright( `<instanceDef>` ), chalk.gray( `${ defInstanceUrl }` ) );

            statusBadURL = true;
            statusStrMsg = `Failed to resolve ` + instanceUrl + `; defaulting to ${ defInstanceUrl }`;

            store.set( 'instanceURL', defInstanceUrl );
            
            // Check if guiMain is still valid before calling loadURL
            if ( guiMain && typeof guiMain.loadURL === 'function' )
            {
                guiMain.loadURL( defInstanceUrl );
            }
        });
    }


    /**
        Event > Page Title Update
    */

    guiMain.on( 'page-title-updated', ( e ) =>
    {
        e.preventDefault();
    });

    /**
        Event > Window Restored
    */

    guiMain.on( 'restore', ( e, cmd ) =>
    {
        store.set( 'indicatorMessages', 0 );
        app.badgeCount = 0;
    });

    /**
        Event > Close

        if --terminate cli argument specified, app will completely terminate when close pressed.
        otherwise; app will hide
    */

    guiMain.on( 'close', ( e ) =>
    {
        if ( !app.isQuiting )
        {
            e.preventDefault();
            if ( bQuitOnClose === 1 || store.getInt( 'bQuitOnClose' ) === 1 )
            {
                gracefulShutdown();
            }
            else
            {
                guiMain.hide();
            }
        }

        return false;
    });

    /**
        Event > Closed
    */

    guiMain.on( 'closed', () =>
    {
        guiMain = null;
    });

    /**
        Event > New Window

        buttons leading to external websites should open in user browser
    */

    guiMain.webContents.on( 'new-window', ( e, url ) =>
    {
        e.preventDefault();
        shell.openExternal( url );
    });

    /**
        Display footer div on website if something has gone wrong.
        user shouldn't see this unless its something serious
    */

    guiMain.webContents.on( 'did-finish-load', ( e, url ) =>
    {
        if ( ( statusBoolError === true || statusBadURL === true ) && statusStrMsg !== '' )
        {
            guiMain.webContents
                .executeJavaScript(
                `
                    const div = document.createElement("div");
                    div.style.bottom = "0";
                    div.style.position = "sticky";
                    div.style.height = "43px";
                    div.style.width = "100%";
                    div.style.zIndex = "3000";
                    div.style.overflow = "hidden";
                    div.style.color = "#FFFFFF";
                    div.style.backgroundColor = "rgb(137 41 41)";
                    div.style.textAlign = "center";
                    div.style.fontSize = "0.93rem";
                    div.style.fontWeight = "100";
                    div.style.display = "grid";
                    div.style.alignItems = "center";

                    const span = document.createElement("span");
                    span.setAttribute("class","ntfy-notify error");
                    span.textContent = '${ statusStrMsg }';

                    div.appendChild(span);
                    document.body.appendChild(div);
                ` );
            }
        }
    );

    /**
        Event > Input
    */

    guiMain.webContents.on( 'before-input-event', ( e, input ) =>
    {
        /**
            Input > Refresh Page (CTRL + r)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'r' )
            guiMain.webContents.reload();

        /**
            Input > Zoom In (CTRL + =)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '=' )
            guiMain.webContents.zoomFactor += 0.1;

        /**
            Input > Zoom Out (CTRL + -)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '-' )
            guiMain.webContents.zoomFactor -= 0.1;

        /**
            Input > Zoom Reset (CTRL + 0)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '0' )
            guiMain.webContents.zoomFactor = 1;

        /**
            Input > Quit (CTRL + q)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'q' )
            gracefulShutdown();

        /**
            Input > Minimize to tray (CTRL + m)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'm' )
        {
            bWinHidden = 1;
            guiMain.hide();
        }

        /**
            Input > Dev Tools (CTRL + SHIFT + I || F12)
        */

        if ( ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.control && input.shift ) || input.key === 'F12' )
        {
            if ( input.type === 'keyDown' && ( input.key === 'I' || input.key === 'F12' ) )
            {
                guiMain.webContents.toggleDevTools();
                guiMain.webContents.on( 'devtools-opened', () =>
                {
                    guiMain.webContents.devToolsWebContents
                        .executeJavaScript(
                            `
                            new Promise((resolve)=> {
                                let keysPressed = {};

                                addEventListener('keydown', (e) => {
                                    if (e.key === 'F12') {
                                        resolve();
                                    }
                                }, { once: true });

                                addEventListener('keydown', (e) => {
                                    keysPressed[e.key] = true;
                                    if (keysPressed['Control'] && keysPressed['Shift'] && e.key == 'I') {
                                        resolve();
                                    }
                                });

                                addEventListener('keyup', (e) => {
                                    delete keysPressed[e.key];
                                });
                            })
                        `
                        )
                        .then( () =>
                        {
                            guiMain.webContents.toggleDevTools();
                        });
                });
            }
        }
    });

    /**
        Tray

        Windows         : left-click opens app, right-click opens context menu
        Linux           : left and right click have same functionality
    */

    guiTray = new Tray( appIcon );
    guiTray.setToolTip( `${ appTitle }` );
    guiTray.setContextMenu( menuTray );
    guiTray.on( 'click', () =>
    {
        if ( bWinHidden )
        {
            bWinHidden = 0;
            guiMain.show();
        }
        else
        {
            bWinHidden = 1;
            guiMain.hide();
        }
    });

    /**
        Loop args

        --hidden            automatically hide window
        --dev               enable developer tools
        --terminate         quit app when close button pressed
    */

    for ( let i = 0; i < process.argv.length; i++ )
    {
        if ( process.argv[ i ] === '--hidden' )
        {
            bWinHidden = 1;
        }
        else if ( process.argv[ i ] === '--dev' )
        {
            bDevTools = 1;
            activeDevTools();
        }
        else if ( process.argv[ i ] === '--terminate' )
        {
            bQuitOnClose = 1;
        }
        else if ( process.argv[ i ] === '--hotkeys' )
        {
            bHotkeysEnabled = 1;
        }
    }

    /*
        no topics are set; warn the user to set some
    */

    const cfgTopics = store.getSanitized( 'topics', 'announcements, stats' );
    if ( !cfgTopics || cfgTopics.trim() === '' )
    {
        setTimeout( () =>
        {
            const warnTopicsEmpty =
            {
                defaultId: 1,
                type: 'warning',
                buttons: [ 'OK' ],
                title: `Topics Not Set`,
                message: `No Topics Set`,
                detail: `You must define topics that you wish to receive notifications for.\nIn the top menu, select "App" -> "Settings" -> "Topics"\n\nTopics should be listed as\n      ${ defTopics },topic3,topic4`
            };

            dialog.showMessageBox( null, warnTopicsEmpty, ( response, cboxChk ) =>
            {
                Log.debug( `User input received: ${ response }` );
            });
        }, 5000 );
    }

    /**
        Run timer every X seconds to check for new messages
        Store interval reference for proper cleanup
    */

    let cfgPollrate = store.get( 'pollrate' ) || defPollrate;
    cfgPollrate = Math.max( minPollrate, Math.min( maxPollrate, cfgPollrate ) );
    const fetchInterval = ( cfgPollrate * 1000 ) + 600;                             // add 600ms buffer

    if ( pollInterval )
        clearInterval( pollInterval );

    pollInterval = setInterval( GetMessages, fetchInterval );

    Log.info( `core`, chalk.yellow( `[polling]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Started message polling` ),
        chalk.blueBright( `<interval>` ), chalk.gray( `${ fetchInterval }ms` ) );

    /**
        check stored setting for developer tools and set state when
        app launches
    */

    activeDevTools();

    /**
        start minimized in tray
    */

    if ( store.getInt( 'bStartHidden' ) === 1 || bWinHidden === 1 )
        guiMain.hide();
}

/**
    graceful shutdown
*/

function gracefulShutdown()
{
    Log.info( `core`, chalk.yellow( `[shutdown]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Initiating graceful shutdown` ) );

    isShuttingDown = true;

    /**
        stop polling
    */

    if ( pollInterval )
    {
        clearInterval( pollInterval );
        pollInterval = null;
        Log.info( `core`, chalk.yellow( `[shutdown]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `Stopped message polling` ) );
    }

    /**
        set quit flag and exit
    */

    app.isQuiting = true;
    app.quit();
}

/**
    App > Ready
*/

app.on( 'ready', ready );

/**
    App > Before Quit - Cleanup
*/

app.on( 'before-quit', () =>
{
    Log.info( `core`, chalk.yellow( `[shutdown]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `App is quitting - performing cleanup` ) );

    isShuttingDown = true;

    if ( pollInterval )
    {
        clearInterval( pollInterval );
        pollInterval = null;
    }
});

/**
    App > Window All Closed
*/

app.on( 'window-all-closed', () =>
{
    /**
        because macos is special; keep app running in dock even when all windows are closed
    */

    if ( process.platform !== 'darwin' )
        gracefulShutdown();
});

/**
    App > Activate (macOS)
*/

app.on( 'activate', () =>
{
    /**
        on macos; re-create window when dock icon is clicked
    */

    if ( BrowserWindow.getAllWindows().length === 0 )
        ready();
});

/**
    ping functionality to announce signals from renderer
*/

app.whenReady().then( () =>
{
    ipcMain.handle( 'ping', () =>
    {
        Log.debug( `ipc`, chalk.yellow( `[ping]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `Ping received from renderer` ) );

        return 'pong';
    });
});

/**
    ipc > to main process
*/

ipcMain.on( 'toMain', ( event, args ) =>
{
    Log.debug( `ipc`, chalk.yellow( `[toMain]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Received message from renderer` ),
        chalk.blueBright( `<data>` ), chalk.gray( `${ args }` ) );

    guiMain.webContents.send( 'fromMain', 'Signal from main' );
});

/**
    ipc > renderer > handle button click events from renderer
*/

ipcMain.on( 'button-clicked', ( event, data ) =>
{
    Log.debug( `ipc`, chalk.yellow( `[button-clicked]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `MuiButtonBase-root button clicked - resetting badge count` ),
        chalk.blueBright( `<data>` ), chalk.gray( `${ JSON.stringify( data ) }` ) );

    /**
        reset badge count when user clicks .MuiButtonBase-root element
    */

    app.badgeCount = 0;
    store.set( 'indicatorMessages', 0 );

    Log.debug( `badge`, chalk.yellow( `[reset]` ), chalk.white( `:  ` ),
        chalk.greenBright( `<msg>` ), chalk.gray( `Badge count reset to 0` ),
        chalk.greenBright( `<trigger>` ), chalk.gray( `MuiButtonBase-root click detected` ) );
});

/**
    IPC > Log forwarding from main to renderer
    This handles forwarding main process logs to renderer dev console
*/

ipcMain.on( 'main-log-to-renderer', ( event, logData ) =>
{
    /*
        this is handled automagically by the log class sendToRendererConsole method;
        this handler exists for any future custom log forwarding
    */
});

/**
 * Export functions for testing
 * Only export when in test environment to avoid polluting the main app
 */

if ( process.env.NODE_ENV === 'test' )
{
    // Export the functions that tests need to access
    global.IsValidUrl = IsValidUrl;
    global.GetMessageData = GetMessageData;
    global.GetMessages = GetMessages;
    global.UpdateBadge = UpdateBadge;
    global.initializeMainProcessLogging = initializeMainProcessLogging;
}

// For ES modules, we need named exports
export {
    IsValidUrl,
    GetMessageData,
    GetMessages,
    UpdateBadge,
    initializeMainProcessLogging
};
