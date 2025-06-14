import { app, BrowserWindow, Tray, shell, Menu, MenuItem } from 'electron';
import toasted from 'toasted-notifier';
import path from 'path';
import moment from 'moment';
import chalk from 'chalk';
import { Storage } from './storage.js';
import { fileURLToPath } from 'url';

/*
    Define > Prompt

    @docs   : https://araxeus.github.io/custom-electron-prompt/
*/

// eslint-disable-next-line n/no-extraneous-import
import prompt from 'electron-plugin-prompts';

/*
    Define > Package
*/

import packageJson from './package.json' with { type: 'json' };
const appVer = packageJson.version;
const appName = packageJson.name;
const appTitle = packageJson.title;
const appAuthor = packageJson.author;
const appElectron = process.versions.electron;
const appRepo = packageJson.repository;
const appIcon = app.getAppPath() + '/assets/icons/ntfy.png';

/*
    Define > Env Variables
*/

const LOG_LEVEL = process.env.LOG_LEVEL || 4;

/*
    Define > cjs vars converted to esm
*/

const __filename = fileURLToPath( import.meta.url );        // get resolved path to the file
const __dirname = path.dirname( __filename );               // get name of the directory

/*
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

/*
    Debug > Print args
*/

console.log( process.argv );

/*
    Define > Window
*/

let guiMain, guiAbout, guiTray;

/*
    Define > CLI State

    bWinHidden          --hidden        app closes to tray on start
    bDevTools           --dev           dev tools added to menu
    bHotkeysEnabled     --hotkeys       keyboard shortcuts added to menu
    bQuitOnClose        --quit          when pressing top-right close button, app exits instead of going to tray
*/

let bDevTools = 0;
let bHotkeysEnabled = 0;
let bQuitOnClose = 0;
// eslint-disable-next-line prefer-const
let bStartHidden = 0;
let bWinHidden = 0;

/*
    Define > Status
*/

let statusBoolError = false;
let statusBadURL = false;
let statusStrMsg;

/*
    Define > Default Fallbacks

    fallback values in case a user does something unforeseen to cause an index error.
    if you try to poll too quick on the official instance; it will throw an error:
        ["{\"code\":42909,\"http\":429,\"error\":\"limit reached: too many auth failures; increase your limits with a paid plan, see https://ntfy.sh\",\"link\":\"https://ntfy.sh/docs/publish/#limitations\"}"]
*/

const defInstanceUrl = 'https://ntfy.sh/app';
const defDatetime = 'YYYY-MM-DD hh:mm a';
const defPollrate = 60;


/*
    Define > Logs

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
            chalk.white(` `),
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

class Log
{
    static now()
    {
        const now = new Date();
        return chalk.gray( `[${ now.toLocaleTimeString() }]` );
    }

    static verbose( ...msg )
    {
        if ( LOG_LEVEL >= 6 )
            console.debug( chalk.white.bgBlack.blackBright.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.gray( msg.join( ' ' ) ) );
    }

    static debug( ...msg )
    {
        if ( LOG_LEVEL >= 7 )
            console.trace( chalk.white.bgMagenta.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.magentaBright( msg.join( ' ' ) ) );
        else if ( LOG_LEVEL >= 5 )
            console.debug( chalk.white.bgGray.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.gray( msg.join( ' ' ) ) );
    }

    static info( ...msg )
    {
        if ( LOG_LEVEL >= 4 )
            console.log( chalk.white.bgBlueBright.bold( ` ${ appName } ` ), chalk.white( ' ' ), this.now(), chalk.blueBright( msg.join( ' ' ) ) );
    }

    static ok( ...msg )
    {
        if ( LOG_LEVEL >= 4 )
            console.log( chalk.white.bgGreen.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.greenBright( msg.join( ' ' ) ) );
    }

    static notice( ...msg )
    {
        if ( LOG_LEVEL >= 3 )
            console.log( chalk.white.bgYellow.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.yellowBright( msg.join( ' ' ) ) );
    }

    static warn( ...msg )
    {
        if ( LOG_LEVEL >= 2 )
            console.warn( chalk.white.bgYellow.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.yellowBright( msg.join( ' ' ) ) );
    }

    static error( ...msg )
    {
        if ( LOG_LEVEL >= 1 )
            console.error( chalk.white.bgRedBright.bold( ` ${ appName } ` ), chalk.white( ` ` ), this.now(), chalk.redBright( msg.join( ' ' ) ) );
    }
}

/*
    Define > Store Values

    @note   : defaults will not be set until the first time a user edits any of their settings.
              storage: AppData\Roaming\ntfy-desktop
*/

const store = new Storage(
{
    configName: 'prefs',
    defaults: {
        instanceURL: defInstanceUrl,
        apiToken: '',
        topics: 'topic1,topic2,topic3',
        bHotkeys: 0,
        bDevTools: 0,
        bQuitOnClose: 0,
        bStartHidden: 0,
        bPersistentNoti: 0,
        bLocalhost: 0,
        datetime: defDatetime
    }
});

/*
    helper > valid json

    parse json string to make sure it is valid.
*/

function isJsonString( json )
{
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

/*
    helper > validate instance url
*/

function IsValidUrl( uri, tries, delay )
{
    return new Promise( ( success, reject ) =>
    {
        ( function rec( i )
        {
            fetch( uri,
            {
                mode: 'no-cors',
                redirect: 'follow',
                headers: {
                    accept: '*/*',
                    'cache-control': 'max-age=0'
                }
            }).then( ( r ) =>
            {
                success( r ); // success: resolve promise
            }).catch( ( err ) =>
            {
                if ( tries === 0 ) // num of tries reached
                    return reject( err );

                setTimeout( () => rec( --tries ), delay ); // retry
            }); // retries exceeded
        })( tries );
    });
}

/*
    Get Message Data

    Even though ntfy's permissions are open by default, provide authorization bearer for users who
    have their permissions set to 'deny'.

    API Token can be specified in app.
*/

async function GetMessageData( uri )
{
    try
    {
        const req = await fetch( uri,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${ store.get( 'apiToken' ) }`
            }
        });

        /*
            ntfy has the option to output message results as json, however the structure of that json
            is not properly formatted json and adds a newline to the end of each message.

            bring the json results in as a string, split them at newline and then push them to a new
            array.
        */

        const json = await req.text();
        const jsonArr = [];
        const entries = json.split( '\n' );
        for ( let i = 0;i < entries.length;i++ )
        {
            jsonArr.push( entries[ i ] );
        }

        /*
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
        Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
            chalk.redBright( `<msg>` ), chalk.gray( `Failed to get messages from ntfy server` ),
            chalk.redBright( `<error>` ), chalk.gray( `${ err.message }` ) );
    }
}

/*
    Get Messages

    ntfy url requires '&poll=1' otherwise the requests will freeze.
    @ref        : https://docs.ntfy.sh/subscribe/api/#poll-for-messages
*/

const msgHistory = [];
async function GetMessages( )
{
    const cfgInstanceURL = store.get( 'instanceURL' );
    const cfgTopics = store.get( 'topics' );
    const cfgPollrate = store.get( 'pollrate' ) || defPollrate;

    /*
        Instance url missing
    */

    if ( !cfgInstanceURL || cfgInstanceURL === '' || cfgInstanceURL === null )
    {
        Log.error( `core`, chalk.redBright( `[messages]` ), chalk.white( `:  ` ),
            chalk.redBright( `<msg>` ), chalk.gray( `Aborting attempt to fetch new messages; instance url missing` ),
            chalk.redBright( `<func>` ), chalk.gray( `GetMessages()` ) );

        return;
    }

    /*
        Concatenate instance query url
    */

    let uri = `${ cfgInstanceURL }/${ cfgTopics }/json?since=${ cfgPollrate }s&poll=1`;

    Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `⚙️` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `fetching messages from url` ),
        chalk.blueBright( `<url>` ), chalk.gray( `${ cfgInstanceURL }` ),
        chalk.blueBright( `<topics>` ), chalk.gray( `${ cfgTopics }` ),
        chalk.blueBright( `<pollrate>` ), chalk.gray( `${ cfgPollrate }` ) );

    /*
        For the official ntfy.sh API, url must be changed internally
            https://ntfy.sh/app/ -> https://ntfy.sh/
    */

    if ( uri.includes( 'ntfy.sh/app' ) )
        uri = uri.replace( 'ntfy.sh/app', 'ntfy.sh' );

    /*
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

    /*
        get pending messages from polling
    */

    const json = await GetMessageData( uri );

    /*
        will be thrown if the instance url does not return valid json (ntfy server possibly down?)
    */

    if ( isJsonString( json ) === false )
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

    /*
        Loop ntfy api results.
        only items with event = 'message' will be allowed through to display in a notification.
    */

    Log.debug( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Ntfy server query response` ),
        chalk.blueBright( `<history>` ), chalk.gray( `${ msgHistory }` ),
        chalk.blueBright( `<messages>` ), chalk.gray( `${ JSON.stringify( json ) }` ) );

    /*
        Loop all messages to send to user notifications
    */

    for ( let i = 0;i < json.length;i++ )
    {
        const object = JSON.parse( json[ i ] );
        const id = object.id;
        const type = object.event;
        const time = object.time;
        const expires = object.expires;
        const message = object.message;
        const topic = object.topic;

        /*
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

        /*
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

        /*
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

        /*
            skip other notifications that aren't messages
        */

        if ( type !== 'message' )
            continue;

        /*
            convert unix timestamp into human readable
        */

        // eslint-disable-next-line no-constant-binary-expression
        const dateHuman = moment.unix( time ).format( store.get( 'datetime' || defDatetime ) );

        /*
            debugging to console to show the status of messages
        */

        const msgStatus = msgHistory.includes( id ) === true ? 'already sent, skipping' : 'pending send';

        Log.info( `core`, chalk.yellow( `[messages]` ), chalk.white( `:  ` ),
            chalk.blueBright( `<msg>` ), chalk.gray( `Pending messages received` ),
            chalk.blueBright( `<type>` ), chalk.gray( `${ type }` ),
            chalk.blueBright( `<id>` ), chalk.gray( `${ id }` ),
            chalk.blueBright( `<status>` ), chalk.gray( `${ msgStatus }` ) );

        /*
            @ref    : https://github.com/Aetherinox/toasted-notifier
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

/*
    Menu > Main

    Entries for the top interface menu

    App | Configure | Help
*/

const menuMain = [
{
    label: '&App',
    id: 'app',
    submenu: [
        {
            label: '&Settings',
            id: 'settings',
            accelerator: 'S',
            submenu: [
                {
                    label: 'General',
                    id: 'general',
                    accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+G' : '',
                    click: function ()
                    {
                        prompt(
                            {
                                title: 'General Settings',
                                label: 'General Settings<div class="label-desc">Change the overall functionality of the app.</div>',
                                useHtmlLabel: true,
                                alwaysOnTop: true,
                                type: 'multiInput',
                                resizable: false,
                                customStylesheet: path.join( __dirname, `pages`, `css`, `prompt.css` ),
                                height: 640,
                                icon: appIcon,
                                multiInputOptions:
                                    [
                                        {
                                            label: 'Enable Developer Tools',
                                            description: 'Add developer tools to top menu',
                                            selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                            value: store.get( 'bDevTools' )
                                        },
                                        {
                                            label: 'Enable Hotkeys',
                                            description: 'Enable the ability to use hotkeys to navigate',
                                            selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                            value: store.get( 'bHotkeys' )
                                        },
                                        {
                                            label: 'Quit on Exit',
                                            description: 'Quit app instead of send-to-tray for close button',
                                            selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                            value: store.get( 'bQuitOnClose' )
                                        },
                                        {
                                            label: 'Minimize to Tray',
                                            description: 'Start app minimized in tray',
                                            selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                            value: store.get( 'bStartHidden' )
                                        }
                                    ]
                            },
                            guiMain
                        )
                        .then( ( resp ) =>
                        {
                            if ( resp !== null )
                            {
                                // do not update dev tools if value hasn't changed
                                if ( store.get( 'bDevTools' ) !== resp[ 0 ] )
                                {
                                    store.set( 'bDevTools', resp[ 0 ] );
                                    activeDevTools();
                                }

                                store.set( 'bHotkeys', resp[ 1 ] );
                                store.set( 'bQuitOnClose', resp[ 2 ] );
                                store.set( 'bStartHidden', resp[ 3 ] );
                            }
                        })
                        .catch( ( resp ) =>
                        {
                            console.error;
                        });
                        /*
                        setTimeout(function (){
                            BrowserWindow.getFocusedWindow().webContents.openDevTools();
                        }, 3000);
                        */
                    }
                },
                {
                    label: 'Instance',
                    accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+I' : '',
                    click: function ()
                    {
                        prompt(
                            {
                                title: 'Instance Settings',
                                label: 'Instance Settings<div class="label-desc">This can either be the official ntfy.sh server, or your own self-hosted domain / ip.</div>',
                                useHtmlLabel: true,
                                alwaysOnTop: true,
                                type: 'multiInput',
                            // customStylesheet: path.join( __dirname, `pages`, `css`, `prompt.css` ),
                                height: 440,
                                icon: appIcon,
                                multiInputOptions:
                                    [
                                        {
                                            label: 'Instance URL',
                                            description: 'Remove everything to set back to official ntfy.sh server.',
                                            value: store.get( 'instanceURL' ) || defInstanceUrl,
                                            inputAttrs: {
                                                placeholder: 'Enter URL to ntfy server',
                                                type: 'url',
                                                min: 5,
                                                step: 1
                                            }
                                        },
                                        {
                                            label: 'Localhost Mode',
                                            description: 'Enable this if you are running a localhost ntfy server',
                                            selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                            value: store.get( 'bLocalhost' )
                                        }
                                    ]
                            },
                            guiMain
                        )
                        .then( ( resp ) =>
                        {
                            // set new instance url
                            const argUrl = resp[ 0 ];
                            let argLHM = resp[ 1 ];

                            if ( argUrl !== null )
                            {
                                const newUrl = ( argUrl === '' ? defInstanceUrl : argUrl );

                                if ( !argLHM )
                                    argLHM = 0;

                                store.set( 'instanceURL', newUrl );
                                store.set( 'bLocalhost', argLHM );

                                if ( store.getInt( 'bLocalhost' ) === 1 )
                                {
                                    guiMain.loadURL( newUrl );
                                }
                                else
                                {
                                    IsValidUrl( store.get( 'instanceURL' ), 3, 1000 ).then( ( item ) =>
                                    {
                                        statusBadURL = false;
                                        console.log( `Successfully resolved ` + store.get( 'instanceURL' ) );
                                        guiMain.loadURL( store.get( 'instanceURL' ) );
                                    }).catch( ( err ) =>
                                    {
                                        statusBadURL = true;
                                        const msg = `Failed to resolve ` + store.get( 'instanceURL' ) + ` - defaulting to ${ defInstanceUrl }`;
                                        statusStrMsg = `${ msg }`;
                                        console.error( `${ msg }` );
                                        store.set( 'instanceURL', defInstanceUrl );
                                        guiMain.loadURL( defInstanceUrl );
                                    });
                                }
                            }
                        })
                        .catch( ( resp ) =>
                        {
                            console.error;
                        });
                        /*
                        setTimeout(function (){
                            BrowserWindow.getFocusedWindow().webContents.openDevTools();
                        }, 3000);
                        */
                    }
                },
                {
                    label: 'API Token',
                    accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+T' : '',
                    click: function ()
                    {
                        prompt(
                            {
                                title: 'Set API Token',
                                label: 'API Token<div class="label-desc">Generate an API token within ntfy.sh  or your self-hosted instance and provide it below to receive desktop push notifications.</div>',
                                useHtmlLabel: true,
                                value: store.get( 'apiToken' ),
                                alwaysOnTop: true,
                                type: 'input',
                                customStylesheet: path.join( __dirname, `pages`, `css`, `prompt.css` ),
                                height: 290,
                                icon: appIcon,
                                inputAttrs: {
                                    type: 'text'
                                }
                            },
                            guiMain
                        )
                        .then( ( resp ) =>
                        {
                            if ( resp !== null )
                            {
                                store.set( 'apiToken', resp );
                            }
                        })
                        .catch( ( resp ) =>
                        {
                            console.error;
                        });
                    }
                },
                {
                    label: 'Topics',
                    accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+SHIFT+T' : '',
                    click: function ()
                    {
                        prompt(
                            {
                                title: 'Set Subscribed Topics',
                                label: 'Subscribed Topics<div class="label-desc">Specify a list of topics you would like to receive push notifications for, separated by commas.<br><br>Ex: Meetings,Personal,Urgent</div>',
                                useHtmlLabel: true,
                                value: store.get( 'topics' ),
                                alwaysOnTop: true,
                                type: 'input',
                                customStylesheet: path.join( __dirname, `pages`, `css`, `prompt.css` ),
                                height: 310,
                                icon: appIcon,
                                inputAttrs: {
                                    type: 'text'
                                }
                            },
                            guiMain
                        )
                        .then( ( resp ) =>
                        {
                            if ( resp !== null )
                            {
                                // do not update topics unless values differ from original, since we need to reload the page
                                if ( store.get( 'topics' ) !== resp )
                                {
                                    store.set( 'topics', resp );

                                    if ( typeof ( store.get( 'instanceURL' ) ) !== 'string' || store.get( 'instanceURL' ) === '' || store.get( 'instanceURL' ) === null )
                                    {
                                        store.set( 'instanceURL', defInstanceUrl );
                                    }

                                    guiMain.loadURL( store.get( 'instanceURL' ) );
                                }
                            }
                        })
                        .catch( ( resp ) =>
                        {
                            console.error;
                        });
                    }
                },
                {
                    label: 'Notifications',
                    accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+N' : '',
                    click: function ()
                    {
                        prompt(
                            {
                                title: 'Notifications',
                                label: 'Notification Settings<div class="label-desc">Determines how notifications will behave</div>',
                                useHtmlLabel: true,
                                alwaysOnTop: true,
                                type: 'multiInput',
                                resizable: false,
                                customStylesheet: path.join( __dirname, `pages`, `css`, `prompt.css` ),
                                height: 550,
                                icon: appIcon,
                                multiInputOptions:
                                    [
                                        {
                                            label: 'Sticky Notifications',
                                            description: 'Stay on screen until dismissed',
                                            selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                            value: store.get( 'bPersistentNoti' )
                                        },
                                        {
                                            label: 'Datetime Format',
                                            description: 'Determines the format for date and timestamps',
                                            value: store.get( 'datetime' ) || defDatetime,
                                            inputAttrs:
                                            {
                                                placeholder: `${ defDatetime }`,
                                                required: true
                                            }
                                        },
                                        {
                                            label: 'Polling Rate',
                                            description: 'The number of seconds between requests to get new notifications.',
                                            value: store.get( 'pollrate' ) || defPollrate,
                                            inputAttrs: {
                                                type: 'number',
                                                required: true,
                                                min: 5,
                                                step: 1
                                            }
                                        }
                                    ]
                            },
                            guiMain
                        )
                        .then( ( resp ) =>
                        {
                            if ( resp !== null )
                            {
                                store.set( 'bPersistentNoti', resp[ 0 ] );
                                store.set( 'datetime', resp[ 1 ] );
                                store.set( 'pollrate', resp[ 2 ] );

                                let cfgPollrate = ( store.get( 'pollrate' ) || defPollrate );
                                const fetchInterval = ( cfgPollrate * 1000 ) + 600;
                                clearInterval( cfgPollrate );
                                cfgPollrate = setInterval( GetMessages, fetchInterval );
                            }
                        })
                        .catch( ( resp ) =>
                        {
                            console.error;
                        });

                        /*
                        setTimeout(function (){
                            BrowserWindow.getFocusedWindow().webContents.openDevTools();
                        }, 3000);
                        */
                    }
                }
            ]
        },
        {
            type: 'separator'
        },
        {
            label: 'Quit',
            id: 'quit',
            accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+Q' : '',
            click: function ()
            {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]
},
{
    label: '&Edit',
    id: 'edit',
    submenu: [
        {
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            role: 'undo'
        },
        {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            role: 'redo'
        },
        {
            type: 'separator'
        },
        {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            role: 'cut'
        },
        {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            role: 'copy'
        },
        {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            role: 'paste'
        },
        {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            role: 'selectall'
        }
    ]
},
{
    label: '&View',
    id: 'view',
    submenu: [
        {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click: function ( item, focusedWindow )
            {
                if ( focusedWindow )
                    focusedWindow.reload();
            }
        },
        {
            label: 'Toggle Full Screen',
            accelerator: ( function ()
            {
                if ( process.platform === 'darwin' )
                    return 'Ctrl+Command+F';
                else
                    return 'F11';
            })(),
            click: function ( item, focusedWindow )
            {
                if ( focusedWindow )
                focusedWindow.setFullScreen( !focusedWindow.isFullScreen() );
            }
        }
    ]
},
{
    label: '&Help',
    id: 'help',
    submenu: [
        {
            label: 'Send Test Notification',
            click()
            {
                toasted.notify(
                {
                    title: `${ appTitle } - Test Notification`,
                    subtitle: `${ appVer }`,
                    message: `This is a test notification which determines if NtfyToast and toasted-notifier are working on your system. If you can see this, then everything is good.`,
                    sound: 'Pop',
                    open: store.get( 'instanceURL' ),
                    persistent: true,
                    sticky: true
                });
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Check for Updates',
            click()
            {
                shell.openExternal( `${ packageJson.homepage }` );
            }
        },
        {
            label: 'Sponsor',
            click()
            {
                shell.openExternal( `https://buymeacoffee.com/aetherinox` );
            }
        },
        {
            id: 'about',
            label: 'About',
            click()
            {
                const aboutTitle = `About`;
                guiAbout = new BrowserWindow({
                    width: 480,
                    height: 440,
                    title: `${ aboutTitle }`,
                    icon: appIcon,
                    parent: guiMain,
                    center: true,
                    resizable: false,
                    fullscreenable: false,
                    minimizable: false,
                    maximizable: false,
                    modal: true,
                    backgroundColor: '#212121',
                    webPreferences: {
                        nodeIntegration: true,
                        contextIsolation: false,
                        enableRemoteModule: true
                    }
                });

                guiAbout.loadFile( path.join( __dirname, `pages`, `about.html` ) ).then( () =>
                {
                    guiAbout.webContents
                        .executeJavaScript(
                            `
                setTitle('${ aboutTitle }');
                setAppInfo('${ appRepo }', '${ appTitle }', '${ appVer }', '${ appAuthor }', '${ appElectron }');`,
                            true
                        )
                        .then( ( result ) => {})
                        .catch( console.error );
                });

                guiAbout.webContents.on( 'new-window', ( e, url ) =>
                {
                    e.preventDefault();
                    require( 'electron' ).shell.openExternal( url );
                });

                // Remove menubar from about window
                guiAbout.setMenu( null );
            }
        }
    ]
}
];

/*
    Tray > Context Menu
*/

const contextMenu = Menu.buildFromTemplate( [
    {
        label: 'Show App',
        click: function ()
        {
            guiMain.show();
        }
    },
    {
        label: 'Quit',
        click: function ()
        {
            app.isQuiting = true;
            app.quit();
        }
    }
] );

/*
    Main Menu > Set
*/

const menuHeader = Menu.buildFromTemplate( menuMain );
Menu.setApplicationMenu( menuHeader );

/*
    Main Menu > Developer Tools
    slides in top position of 'App' menu

    when user disables dev console, must re-build menu, otherwise dev tools will stick

    App | Configure | Help
*/

function activeDevTools()
{
    const menuHeader = Menu.buildFromTemplate( menuMain );
    Menu.setApplicationMenu( menuHeader );

    if ( bDevTools === 1 || store.getInt( 'bDevTools' ) === 1 )
    {
        const menuItem = menuHeader.getMenuItemById( 'view' );

        menuItem.submenu.insert( 0, new MenuItem(
        {
            label: 'Toggle Dev Tools',
            accelerator: process.platform === 'darwin' ? 'ALT+CMD+I' : 'CTRL+SHIFT+I',
            click: () =>
            {
                guiMain.webContents.toggleDevTools();
            }
        },
        {
            type: 'separator'
        }) );
    }
}

/*
    App > Ready
*/

function ready()
{
    Log.info( `core`, chalk.yellow( `[initiate]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Starting ${ appName }` ),
        chalk.blueBright( `<version>` ), chalk.gray( `${ appVer }` ),
        chalk.blueBright( `<electron>` ), chalk.gray( `${ appElectron }` ) );

    /*
        New Window
    */

    guiMain = new BrowserWindow({
        title: `${ appTitle } : v${ appVer }`,
        width: 1280,
        height: 720,
        icon: appIcon,
        backgroundColor: '#212121'
    });

    /*
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

    /*
        Validate URL.
        Invalid URLs should not perform polling.
        load default defInstanceUrl url
    */

    const instanceUrl = store.get( 'instanceURL' ) || defInstanceUrl;
    if ( store.getInt( 'bLocalhost' ) === 1 )
    {
        guiMain.loadURL( instanceUrl );
    }
    else
    {
        IsValidUrl( instanceUrl, 3, 1000 ).then( ( item ) =>
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
            guiMain.loadURL( defInstanceUrl );
        });
    }

    /*
        Event > Page Title Update
    */

    guiMain.on( 'page-title-updated', ( e ) =>
    {
        e.preventDefault();
    });

    /*
        Event > Close

        if --quit cli argument specified, app will completely quit when close pressed.
        otherwise; app will hide
    */

    guiMain.on( 'close', ( e ) =>
    {
        if ( !app.isQuiting )
        {
            e.preventDefault();
            if ( bQuitOnClose === 1 || store.getInt( 'bQuitOnClose' ) === 1 )
            {
                app.isQuiting = true;
                app.quit();
            }
            else
            {
                guiMain.hide();
            }
        }

        return false;
    });

    /*
        Event > Closed
    */

    guiMain.on( 'closed', () =>
    {
        guiMain = null;
    });

    /*
        Event > New Window

        buttons leading to external websites should open in user browser
    */

    guiMain.webContents.on( 'new-window', ( e, url ) =>
    {
        e.preventDefault();
        require( 'electron' ).shell.openExternal( url );
    });

    /*
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

    /*
        Event > Input
    */

    guiMain.webContents.on( 'before-input-event', ( e, input ) =>
    {
        /*
            Input > Refresh Page (CTRL + r)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'r' )
        {
            guiMain.webContents.reload();
        }

        /*
            Input > Zoom In (CTRL + =)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '=' )
        {
            guiMain.webContents.zoomFactor += 0.1;
        }

        /*
            Input > Zoom Out (CTRL + -)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '-' )
        {
            guiMain.webContents.zoomFactor -= 0.1;
        }

        /*
            Input > Zoom Reset (CTRL + 0)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '0' )
        {
            guiMain.webContents.zoomFactor = 1;
        }

        /*
            Input > Quit (CTRL + q)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'q' )
        {
            app.isQuiting = true;
            app.quit();
        }

        /*
            Input > Minimize to tray (CTRL + m)
        */

        if ( ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'm' )
        {
            bWinHidden = 1;
            guiMain.hide();
        }

        /*
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

    /*
        Tray

        Windows         : left-click opens app, right-click opens context menu
        Linux           : left and right click have same functionality
    */

    guiTray = new Tray( appIcon );
    guiTray.setToolTip( `${ appTitle }` );
    guiTray.setContextMenu( contextMenu );
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

    /*
        Loop args

        --hidden        : automatically hide window
        --dev           : enable developer tools
        --quit          : quit app when close button pressed
    */

    for ( let i = 0;i < process.argv.length;i++ )
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
        else if ( process.argv[ i ] === '--quit' )
        {
            bQuitOnClose = 1;
        }
        else if ( process.argv[ i ] === '--hotkeys' )
        {
            bHotkeysEnabled = 1;
        }
    }

    /*
        Run timer every X seconds to check for new messages
    */

    const fetchInterval = ( ( store.get( 'pollrate' ) || defPollrate ) * 1000 ) + 600;
    setInterval( GetMessages, fetchInterval );

    /*
        Check stored setting for developer tools and set state when
        app launches
    */

    activeDevTools();

    /*
        Start minimized in tray
    */

    if ( store.getInt( 'bStartHidden' ) === 1 || bWinHidden === 1 )
        guiMain.hide();
}

/*
    App > Ready
*/

app.on( 'ready', ready );
