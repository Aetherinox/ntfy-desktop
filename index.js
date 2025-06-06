import { app, BrowserWindow, Tray, shell, Menu, MenuItem } from 'electron';
import toasted from 'toasted-notifier';
import path from 'path';
import moment from 'moment';
import chalk from 'chalk';
import { Storage } from './storage.js';
import { fileURLToPath } from 'url';

/*
    Declare > Prompt

    @docs   : https://araxeus.github.io/custom-electron-prompt/
*/

import prompt from 'custom-electron-prompt';

/*
    Declare > Package
*/

import packageJson from './package.json' with { type: 'json' };
const appVer = packageJson.version;
const appName = packageJson.name;
const appAuthor = packageJson.author;
const appElectron = process.versions.electron;
const appRepo = packageJson.repository;
const appIcon = app.getAppPath() + '/assets/icons/ntfy.png';

/*
    Define > Env Variables
*/

const LOG_LEVEL = process.env.LOG_LEVEL || 4;

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
    Declare > Window
*/

let winMain, winAbout, timerPollrate, tray;

/*
    Declare > CLI State

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
    Declare > Status
*/

let statusHasError = false;
let statusBadURL = false;
let statusMessage;

/*
    cjs to esm
*/

const __filename = fileURLToPath( import.meta.url );        // get resolved path to the file
const __dirname = path.dirname( __filename );               // get name of the directory

/*
    Declare > Fallback

    fallback values in case a user does something unforseen to cause an index error.
    if you try to poll too quick on the official instance; it will throw an error:
        ["{\"code\":42909,\"http\":429,\"error\":\"limit reached: too many auth failures; increase your limits with a paid plan, see https://ntfy.sh\",\"link\":\"https://ntfy.sh/docs/publish/#limitations\"}"]
*/

const _Instance = 'https://ntfy.sh/app';
const _Datetime = 'YYYY-MM-DD hh:mm a';
const _Pollrate = 60;

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


    @note   : defaults will not be set until the first time a user edits any of their settings.
              storage: AppData\Roaming\ntfy-desktop
*/

const store = new Storage(
{
    configName: 'prefs',
    defaults: {
        instanceURL: _Instance,
        apiToken: '',
        topics: 'topic1,topic2,topic3',
        bHotkeys: 0,
        bDevTools: 0,
        bQuitOnClose: 0,
        bStartHidden: 0,
        bPersistentNoti: 0,
        bLocalhost: 0,
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
        const cfgApiToken = store.get( 'apiToken' );
        const req = await fetch( uri,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${ cfgApiToken }`
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
    catch (err)
    {
        alert(err);
    }
}

/*
    Get Messages

    ntfy url requires '&poll=1' otherwise the requests will freeze.
    @ref        : https://docs.ntfy.sh/subscribe/api/#poll-for-messages
*/

const msgHistory = [];
async function GetMessages()
{
    const cfgPollrate = store.get( 'pollrate' ) || _Pollrate;
    const cfgTopics = store.get( 'topics' );
    const cfgInstanceURL = store.get( 'instanceURL' );

    if ( cfgInstanceURL === '' || cfgInstanceURL === null )
    {
        console.log( `URL Missing, skipping GetMessages(): ${ uri }` );
        return;
    }

    let uri = `${ cfgInstanceURL }/${ cfgTopics }/json?since=${ cfgPollrate }s&poll=1`;
    console.log( `URL: ${ uri }` );

    /*
        For the official ntfy.sh API, url must be changed internally
            https://ntfy.sh/app/ -> https://ntfy.sh/
    */

    if ( uri.includes( 'ntfy.sh/app' ) )
    {
        uri = uri.replace( 'ntfy.sh/app', 'ntfy.sh' );
    }

    /*
        Bad URL detected, skip polling
    */

    if ( statusBadURL === true )
    {
        console.error( `Invalid instance URL specified, skipping polling` );
        return;
    }

    const json = await GetMessageData( uri );

    /*
        will be thrown if the instance url does not return valid json (ntfy server possibly down?)
    */

    if ( isJsonString( json ) === false )
    {
        console.error( `Specified  instance URL not returning valid json. Change your instance URL to a valid Ntfy instance` );
        return;
    }

    console.log( `CHECKING FOR NEW MESSAGES` );
    console.log( `---------------------------------------------------------` );
    console.log( `InstanceURL ........... ${ cfgInstanceURL }` );
    console.log( `Query ................. ${ uri }` );
    console.log( `Topics ................ ${ cfgTopics }` );

    /*
        Loop ntfy api results.
        only items with event = 'message' will be allowed through to display in a notification.
    */

    console.log( `---------------------------------------------------------` );
    console.log( `History ............... ${ msgHistory }` );
    console.log( `Messages .............. ${ JSON.stringify( json ) }` );
    console.log( `---------------------------------------------------------\n` );

    for ( let i = 0;i < json.length;i++ )
    {
        const object = JSON.parse( json[ i ] );
        const id = object.id;
        const type = object.event;
        const time = object.time;
        const expires = object.expires;
        const message = object.message;
        const topic = object.topic;

        const cfgPersistent = store.get( 'bPersistentNoti' ) !== 0;
        const cfgInstanceURL = store.get( 'instanceURL' );

        if ( type !== 'message' )
            continue;

        /*
            convert unix timestamp into human readable
        */

        // eslint-disable-next-line no-constant-binary-expression
        const dateHuman = moment.unix( time ).format( store.get( 'datetime' || _Datetime ) );

        /*
            debugging to console to show the status of messages
        */

        const msgStatus = msgHistory.includes( id ) === true ? 'already sent, skipping' : 'pending send';
        console.log( `Messages .............. ${ type }:${ id } ${ msgStatus }` );

        /*
            @ref    : https://github.com/Aetherinox/toasted-notifier
        */

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

            console.log( `   Topic .............. ${ type }:${ id } ${ topic }` );
            console.log( `   Date ............... ${ type }:${ id } ${ dateHuman }` );
            console.log( `   InstanceURL ........ ${ type }:${ id } ${ cfgInstanceURL }` );
            console.log( `   Persistent ......... ${ type }:${ id } ${ cfgPersistent }` );
        }

        console.log( `Messages .............. ${ type }:${ id } sent` );
    }

    console.log( `\n\n` );

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
            label: 'Quit',
            id: 'quit',
            accelerator: ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) ? 'CTRL+Q' : '',
            click: function ()
            {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]
},
{
    label: '&Configure',
    id: 'configure',
    submenu: [
        {
            label: 'General',
            id: 'general',
            accelerator: ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) ? 'CTRL+G' : '',
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
                        height: 480,
                        icon: appIcon,
                        multiInputOptions:
                            [
                                {
                                    label: 'Developer tools in app menu',
                                    selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                    value: store.get( 'bDevTools' )
                                },
                                {
                                    label: 'Allow usage of hotkeys to navigate',
                                    selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                    value: store.get( 'bHotkeys' )
                                },
                                {
                                    label: 'Quit app instead of send-to-tray for close button',
                                    selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                    value: store.get( 'bQuitOnClose' )
                                },
                                {
                                    label: 'Start app minimized in tray',
                                    selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                    value: store.get( 'bStartHidden' )
                                }
                            ]
                    },
                    winMain
                )
                .then( ( response ) =>
                {
                    if ( response !== null )
                    {
                        // do not update dev tools if value hasn't changed
                        if ( store.get( 'bDevTools' ) !== response[ 0 ] )
                        {
                            store.set( 'bDevTools', response[ 0 ] );
                            activeDevTools();
                        }

                        store.set( 'bHotkeys', response[ 1 ] );
                        store.set( 'bQuitOnClose', response[ 2 ] );
                        store.set( 'bStartHidden', response[ 3 ] );
                    }
                })
                .catch( ( response ) =>
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
            accelerator: ( bHotkeysEnabled === 1 || store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+U' : '',
            click: function ()
            {
                prompt(
                    {
                        title: 'Instance Settings',
                        label: 'Instance Settings<div class="label-desc">This can either be the official ntfy.sh server, or your own self-hosted domain / ip.</div>',
                        useHtmlLabel: true,
                        alwaysOnTop: true,
                        type: 'multiInput',
                        customStylesheet: path.join( __dirname, `pages`, `css`, `prompt.css` ),
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
                                        required: true,
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
                .then( ( response ) =>
                {
                    if ( response !== null )
                    {
                        const newUrl = ( response === '' ? defInstanceUrl : response );
                        store.set( 'instanceURL', newUrl );

                        /*
                            Validate URL.
                            Invalid URLs should not perform polling.
                            load default defInstanceUrl url
                        */

                        if ( store.getInt( 'bLocalhost' ) === 1 )
                        {
                            store.set( 'instanceURL', defInstanceUrl );
                            guiMain.loadURL( defInstanceUrl );
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
                .catch( ( response ) =>
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
            accelerator: ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) ? 'CTRL+T' : '',
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
                        height: 265,
                        icon: appIcon,
                        inputAttrs: {
                            type: 'text'
                        }
                    },
                    winMain
                )
                .then( ( response ) =>
                {
                    if ( response !== null )
                    {
                        store.set( 'apiToken', response );
                    }
                })
                .catch( ( response ) =>
                {
                    console.error;
                });
            }
        },
        {
            label: 'Topics',
            accelerator: ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) ? 'CTRL+SHIFT+T' : '',
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
                        height: 290,
                        icon: appIcon,
                        inputAttrs: {
                            type: 'text'
                        }
                    },
                    winMain
                )
                .then( ( response ) =>
                {
                    if ( response !== null )
                    {
                        // do not update topics unless values differ from original, since we need to reload the page
                        if ( store.get( 'topics' ) !== response )
                        {
                            store.set( 'topics', response );

                            if ( typeof ( store.get( 'instanceURL' ) ) !== 'string' || store.get( 'instanceURL' ) === '' || store.get( 'instanceURL' ) === null )
                            {
                                store.set( 'instanceURL', _Instance );
                            }

                            winMain.loadURL( store.get( 'instanceURL' ) );
                        }
                    }
                })
                .catch( ( response ) =>
                {
                    console.error;
                });
            }
        },
        {
            label: 'Notifications',
            accelerator: ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) ? 'CTRL+N' : '',
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
                        height: 400,
                        icon: appIcon,
                        multiInputOptions:
                            [
                                {
                                    label: 'Stay on screen until dismissed',
                                    selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                    value: store.get( 'bPersistentNoti' )
                                },
                                {
                                    label: 'Datetime format for notification title',
                                    value: store.get( 'datetime' ) || _Datetime,
                                    inputAttrs:
                                    {
                                        placeholder: `${ _Datetime }`,
                                        required: true
                                    }
                                },
                                {
                                    label: 'Polling rate / fetch messages (seconds)',
                                    value: store.get( 'pollrate' ) || _Pollrate,
                                    inputAttrs: {
                                        type: 'number',
                                        required: true,
                                        min: 5,
                                        step: 1
                                    }
                                }
                            ]
                    },
                    winMain
                )
                .then( ( response ) =>
                {
                    if ( response !== null )
                    {
                        store.set( 'bPersistentNoti', response[ 0 ] );
                        store.set( 'datetime', response[ 1 ] );
                        store.set( 'pollrate', response[ 2 ] );

                        const cfgPollrate = ( store.get( 'pollrate' ) || _Pollrate );
                        const fetchInterval = ( cfgPollrate * 1000 ) + 600;
                        clearInterval( timerPollrate );
                        timerPollrate = setInterval( GetMessages, fetchInterval );
                    }
                })
                .catch( ( response ) =>
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
    label: '&Help',
    id: 'help',
    submenu: [
        {
            id: 'about',
            label: 'About',
            click()
            {
                const aboutTitle = `About`;
                winAbout = new BrowserWindow({
                    width: 480,
                    height: 440,
                    title: `${ aboutTitle }`,
                    icon: appIcon,
                    parent: winMain,
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

                winAbout.loadFile( path.join( __dirname, `pages`, `about.html` ) ).then( () =>
                {
                    winAbout.webContents
                        .executeJavaScript(
                            `
                setTitle('${ aboutTitle }');
                setAppInfo('${ appRepo }', '${ appName }', '${ appVer }', '${ appAuthor }', '${ appElectron }');`,
                            true
                        )
                        .then( ( result ) => {})
                        .catch( console.error );
                });

                winAbout.webContents.on( 'new-window', ( e, url ) =>
                {
                    e.preventDefault();
                    require( 'electron' ).shell.openExternal( url );
                });

                // Remove menubar from about window
                winAbout.setMenu( null );
            }
        },
        {
            label: 'View New Releases',
            click()
            {
                shell.openExternal( `${ packageJson.homepage }` );
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
            winMain.show();
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

    if ( bDevTools === 1 || store.get( 'bDevTools' ) === 1 )
    {
        const menuItem = menuHeader.getMenuItemById( 'app' );

        menuItem.submenu.insert( 0, new MenuItem(
        {
            label: 'Toggle Dev Tools',
            accelerator: process.platform === 'darwin' ? 'ALT+CMD+I' : 'CTRL+SHIFT+I',
            click: () =>
            {
                winMain.webContents.toggleDevTools();
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
    Log.info( `core`, chalk.yellow( `[info]` ), chalk.white( `:  ` ),
        chalk.blueBright( `<msg>` ), chalk.gray( `Starting ${ appName }` ),
        chalk.blueBright( `<version>` ), chalk.gray( `${ appVer }` ),
        chalk.blueBright( `<electron>` ), chalk.gray( `${ appElectron }` ) );

    /*
        New Window
    */

    winMain = new BrowserWindow({
        title: `${ appName }`,
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

    if ( store.getInt( 'bLocalhost' ) === 1 )
    {
        store.set( 'instanceURL', defInstanceUrl );
        guiMain.loadURL( defInstanceUrl );
    }
    else
    {
        IsValidUrl( store.get( 'instanceURL' ), 3, 1000 ).then( ( item ) =>
        {
            Log.ok( `core`, chalk.yellow( `[instance]` ), chalk.white( `:  ` ),
                chalk.greenBright( `<msg>` ), chalk.gray( `Specified instance successfully resolves` ),
                chalk.greenBright( `<instance>` ), chalk.gray( `${ store.get( 'instanceURL' ) }` ) );

            statusBadURL = false;
            guiMain.loadURL( store.get( 'instanceURL' ) );
        }).catch( ( err ) =>
        {
            Log.error( `core`, chalk.redBright( `[instance]` ), chalk.white( `:  ` ),
                chalk.redBright( `<msg>` ), chalk.gray( `Failed to resolve instance url; switching to default` ),
                chalk.redBright( `<instanceBad>` ), chalk.gray( `${ store.get( 'instanceURL' ) }` ),
                chalk.redBright( `<instanceDef>` ), chalk.gray( `${ defInstanceUrl }` ) );

            statusBadURL = true;
            statusStrMsg = `Failed to resolve ` + store.get( 'instanceURL' ) + `; defaulting to ${ defInstanceUrl }`;

            store.set( 'instanceURL', defInstanceUrl );
            guiMain.loadURL( defInstanceUrl );
        });
    }

    /*
        Event > Page Title Update
    */

    winMain.on( 'page-title-updated', ( e ) =>
    {
        e.preventDefault();
    });

    /*
        Event > Close

        if --quit cli argument specified, app will completely quit when close pressed.
        otherwise; app will hide
    */

    winMain.on( 'close', ( e ) =>
    {
        if ( !app.isQuiting )
        {
            e.preventDefault();
            if ( bQuitOnClose === 1 || store.get( 'bQuitOnClose' ) === 1 )
            {
                app.isQuiting = true;
                app.quit();
            }
            else
            {
                winMain.hide();
            }
        }

        return false;
    });

    /*
        Event > Closed
    */

    winMain.on( 'closed', () =>
    {
        winMain = null;
    });

    /*
        Event > New Window

        buttons leading to external websites should open in user browser
    */

    winMain.webContents.on( 'new-window', ( e, url ) =>
    {
        e.preventDefault();
        require( 'electron' ).shell.openExternal( url );
    });

    /*
        Display footer div on website if something has gone wrong.
        user shouldn't see this unless its something serious
    */

    winMain.webContents.on( 'did-finish-load', ( e, url ) =>
    {
        if ( ( statusHasError === true || statusBadURL === true ) && statusMessage !== '' )
        {
            winMain.webContents
                .executeJavaScript(
                `
                    const div = document.createElement("div");
                    div.style.position = "sticky";
                    div.style.height = "34px";
                    div.style.width = "100%";
                    div.style.zIndex = "3000";
                    div.style.overflow = "hidden";
                    div.style.marginTop = "-34px";
                    div.style.padding = "7px";
                    div.style.paddingLeft = "20px";
                    div.style.paddingRight = "20px";
                    div.style.backgroundColor = "rgb(151 63 63)";
                    div.style.textAlign = "center";
                    div.style.fontSize = "13px";

                    const span = document.createElement("span");
                    span.setAttribute("class","ntfy-notify error");
                    span.textContent = '${ statusMessage }';

                    div.appendChild(span);
                    document.body.appendChild(div);
                ` );
            }
        }
    );

    /*
        Event > Input
    */

    winMain.webContents.on( 'before-input-event', ( e, input ) =>
    {
        /*
            Input > Refresh Page (CTRL + r)
        */

        if ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'r' )
        {
            winMain.webContents.reload();
        }

        /*
            Input > Zoom In (CTRL + =)
        */

        if ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '=' )
        {
            winMain.webContents.zoomFactor += 0.1;
        }

        /*
            Input > Zoom Out (CTRL + -)
        */

        if ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '-' )
        {
            winMain.webContents.zoomFactor -= 0.1;
        }

        /*
            Input > Zoom Reset (CTRL + 0)
        */

        if ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === '0' )
        {
            winMain.webContents.zoomFactor = 1;
        }

        /*
            Input > Quit (CTRL + q)
        */

        if ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'q' )
        {
            app.isQuiting = true;
            app.quit();
        }

        /*
            Input > Minimize to tray (CTRL + m)
        */

        if ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.type === 'keyDown' && input.control && input.key === 'm' )
        {
            bWinHidden = 1;
            winMain.hide();
        }

        /*
            Input > Dev Tools (CTRL + SHIFT + I || F12)
        */

        if ( ( ( bHotkeysEnabled === 1 || store.get( 'bHotkeys' ) === 1 ) && input.control && input.shift ) || input.key === 'F12' )
        {
            if ( input.type === 'keyDown' && ( input.key === 'I' || input.key === 'F12' ) )
            {
                winMain.webContents.toggleDevTools();
                winMain.webContents.on( 'devtools-opened', () =>
                {
                    winMain.webContents.devToolsWebContents
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
                            winMain.webContents.toggleDevTools();
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

    tray = new Tray( appIcon );
    tray.setToolTip( `${ appName }` );
    tray.setContextMenu( contextMenu );
    tray.on( 'click', () =>
    {
        if ( bWinHidden )
        {
            bWinHidden = 0;
            winMain.show();
        }
        else
        {
            bWinHidden = 1;
            winMain.hide();
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

    const fetchInterval = ( ( store.get( 'pollrate' ) || _Pollrate ) * 1000 ) + 600;
    timerPollrate = setInterval( GetMessages, fetchInterval );

    /*
        Check stored setting for developer tools and set state when
        app launches
    */

    activeDevTools();

    /*
        Start minimized in tray
    */

    if ( store.get( 'bStartHidden' ) === 1 || bWinHidden === 1 )
        winMain.hide();
}

/*
    App > Ready
*/

app.on( 'ready', ready );
