/**
    Class > Electron Interface Menus

    this class controls the electron menus:
        - main menu
        - tray right-click menu
*/

import { app, Menu, BrowserWindow } from 'electron';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

/**
    define paths / dirnames
*/

const __filename = fileURLToPath( import.meta.url );
const __dirname = dirname( __filename );

/**
    injected from main index.js
*/

let deps = {};

/**
    dependencies > setter
*/

function setMenuDeps( dependencies )
{
    deps = dependencies;
}

/**
    electron > main menu
*/

function newMenuMain()
{
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
                            accelerator: ( deps.bHotkeysEnabled === 1 || deps.store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+G' : '',
                            click: function ()
                            {
                                deps.prompt(
                                    {
                                        title: 'General Settings',
                                        label: `General Settings<div class="label-desc">Change the overall functionality of the app.</div>`,
                                        useHtmlLabel: true,
                                        alwaysOnTop: true,
                                        type: 'multiInput',
                                        resizable: false,
                                        customStylesheet: path.join( app.getAppPath(), `pages`, `css`, `prompt.css` ),
                                        height: 640,
                                        icon: deps.appIcon,
                                        multiInputOptions:
                                        [
                                            {
                                                label: 'Enable Developer Tools',
                                                description: 'Add developer tools to top menu',
                                                selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                                value: deps.store.get( 'bDevTools' )
                                            },
                                            {
                                                label: 'Enable Hotkeys',
                                                description: 'Enable the ability to use hotkeys to navigate',
                                                selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                                value: deps.store.get( 'bHotkeys' )
                                            },
                                            {
                                                label: 'Quit on Exit',
                                                description: 'Quit app instead of send-to-tray for close button',
                                                selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                                value: deps.store.get( 'bQuitOnClose' )
                                            },
                                            {
                                                label: 'Minimize to Tray',
                                                description: 'Start app minimized in tray',
                                                selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                                value: deps.store.get( 'bStartHidden' )
                                            }
                                        ]
                                    },
                                    deps.guiMain
                                )
                                .then( ( resp ) =>
                                {
                                    if ( resp !== null )
                                    {
                                        // do not update dev tools if value hasn't changed
                                        if ( deps.store.get( 'bDevTools' ) !== resp[ 0 ] )
                                        {
                                            deps.store.set( 'bDevTools', resp[ 0 ] );
                                            deps.activeDevTools();
                                        }

                                        deps.store.set( 'bHotkeys', resp[ 1 ] );
                                        deps.store.set( 'bQuitOnClose', resp[ 2 ] );
                                        deps.store.set( 'bStartHidden', resp[ 3 ] );
                                    }
                                })
                                .catch( ( resp ) =>
                                {
                                    console.error;
                                });
                            }
                        },
                        {
                            label: 'Instance',
                            accelerator: ( deps.bHotkeysEnabled === 1 || deps.store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+I' : '',
                            click: function ()
                            {
                                deps.prompt(
                                    {
                                        title: 'Instance Settings',
                                        label: `Instance Settings<div class="label-desc">This can either be the official ntfy.sh server, or your own self-hosted domain / ip.</div>`,
                                        useHtmlLabel: true,
                                        alwaysOnTop: true,
                                        type: 'multiInput',
                                        height: 440,
                                        icon: deps.appIcon,
                                        multiInputOptions:
                                        [
                                            {
                                                label: 'Instance URL',
                                                description: 'Remove everything to set back to official ntfy.sh server.',
                                                value: deps.store.get( 'instanceURL' ) || deps.defInstanceUrl,
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
                                                value: deps.store.get( 'bLocalhost' )
                                            }
                                        ]
                                    },
                                    deps.guiMain
                                )
                                .then( ( resp ) =>
                                {
                                    const argUrl = resp[ 0 ];
                                    let argLHM = resp[ 1 ];

                                    if ( argUrl !== null )
                                    {
                                        const newUrl = ( argUrl === '' ? deps.defInstanceUrl : argUrl );

                                        if ( !argLHM )
                                            argLHM = 0;

                                        deps.store.set( 'instanceURL', newUrl );
                                        deps.store.set( 'bLocalhost', argLHM );

                                        if ( deps.store.getInt( 'bLocalhost' ) === 1 )
                                        {
                                            deps.store.set( 'newUrl', newUrl );

                                            try
                                            {
                                                deps.guiMain.loadURL( newUrl );
                                            }
                                            catch ( error )
                                            {
                                                console.error( 'Error calling loadURL:', error );
                                            }
                                        }
                                        else
                                        {
                                            deps.IsValidUrl( deps.store.get( 'instanceURL' ), 3, 1000 ).then( ( item ) =>
                                            {
                                                deps.statusBadURL = false;
                                                console.log( `Successfully resolved ` + deps.store.get( 'instanceURL' ) );
                                                console.log( 'Loading URL after validation:', deps.store.get( 'instanceURL' ) );
                                                deps.guiMain.loadURL( deps.store.get( 'instanceURL' ) );
                                            }).catch( ( err ) =>
                                            {
                                                deps.statusBadURL = true;
                                                const msg = `Failed to resolve ` + deps.store.get( 'instanceURL' ) + ` - defaulting to ${ deps.defInstanceUrl }`;
                                                deps.statusStrMsg = `${ msg }`;
                                                console.error( `URL validation failed: ${ err.message }` );
                                                console.error( `${ msg }` );
                                                deps.store.set( 'instanceURL', deps.defInstanceUrl );
                                                deps.guiMain.loadURL( deps.defInstanceUrl );
                                            });
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
                            label: 'API Token',
                            accelerator: ( deps.bHotkeysEnabled === 1 || deps.store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+T' : '',
                            click: function ()
                            {
                                deps.prompt(
                                    {
                                        title: 'Set API Token',
                                        label: `API Token\u003cdiv class="label-desc"\u003eGenerate an API token within ntfy.sh  or your self-hosted instance and provide it below to receive desktop push notifications.\u003c/div\u003e`,
                                        useHtmlLabel: true,
                                        value: deps.store.get( 'apiToken' ),
                                        alwaysOnTop: true,
                                        type: 'input',
                                        customStylesheet: path.join( app.getAppPath(), `pages`, `css`, `prompt.css` ),
                                        height: 290,
                                        icon: deps.appIcon,
                                        inputAttrs: {
                                            type: 'text'
                                        }
                                    },
                                    deps.guiMain
                                )
                                .then( ( resp ) =>
                                {
                                    if ( resp !== null )
                                        deps.store.set( 'apiToken', resp );
                                })
                                .catch( ( resp ) =>
                                {
                                    console.error;
                                });
                            }
                        },
                        {
                            label: 'Topics',
                            accelerator: ( deps.bHotkeysEnabled === 1 || deps.store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+SHIFT+T' : '',
                            click: function ()
                            {
                                deps.prompt(
                                    {
                                        title: 'Set Subscribed Topics',
                                        label: `Subscribed Topics<div class="label-desc">Specify a list of topics you would like to receive push notifications for, separated by commas.<br><br>Ex: ${ deps.defTopics }</div>`,
                                        useHtmlLabel: true,
                                        value: deps.store.getSanitized( 'topics', deps.defTopics ),
                                        alwaysOnTop: true,
                                        type: 'input',
                                        customStylesheet: path.join( app.getAppPath(), `pages`, `css`, `prompt.css` ),
                                        height: 310,
                                        icon: deps.appIcon,
                                        inputAttrs: {
                                            type: 'text'
                                        }
                                    },
                                    deps.guiMain
                                )
                                .then( ( resp ) =>
                                {
                                    if ( resp !== null )
                                    {
                                        /**
                                            don't update topics unless values differ from original, since we need to reload the page
                                        */

                                        if ( deps.store.get( 'topics' ) !== resp )
                                        {
                                            deps.store.set( 'topics', resp );

                                            if ( typeof ( deps.store.get( 'instanceURL' ) ) !== 'string' || deps.store.get( 'instanceURL' ) === '' || deps.store.get( 'instanceURL' ) === null )
                                                deps.store.set( 'instanceURL', deps.defInstanceUrl );

                                            deps.guiMain.loadURL( deps.store.get( 'instanceURL' ) );
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
                    accelerator: ( deps.bHotkeysEnabled === 1 || deps.store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+N' : '',
                    click: function ()
                    {
                        deps.prompt(
                            {
                                title: 'Notifications',
                                label: `Notification Settings<div class="label-desc">Determines how notifications will behave</div>`,
                                useHtmlLabel: true,
                                alwaysOnTop: true,
                                type: 'multiInput',
                                resizable: false,
                                customStylesheet: path.join( app.getAppPath(), `pages`, `css`, `prompt.css` ),
                                height: 550,
                                icon: deps.appIcon,
                                multiInputOptions:
                                [
                                    {
                                        label: 'Sticky Notifications',
                                        description: 'Stay on screen until dismissed',
                                        selectOptions: { 0: 'Disabled', 1: 'Enabled' },
                                        value: deps.store.get( 'bPersistentNoti' )
                                    },
                                    {
                                        label: 'Datetime Format',
                                        description: 'Determines the format for date and timestamps',
                                        value: deps.store.get( 'datetime' ) || deps.defDatetime,
                                        inputAttrs:
                                        {
                                            placeholder: `${ deps.defDatetime }`,
                                            required: true
                                        }
                                    },
                                    {
                                        label: 'Polling Rate',
                                        description: 'The number of seconds between requests to get new notifications.',
                                        value: deps.store.get( 'pollrate' ) || deps.defPollrate,
                                        inputAttrs: {
                                            type: 'number',
                                            required: true,
                                            min: 5,
                                            step: 1
                                        }
                                    }
                                ]
                            },
                            deps.guiMain
                        )
                        .then( ( resp ) =>
                        {
                            if ( resp !== null )
                            {
                                deps.store.set( 'bPersistentNoti', resp[ 0 ] );
                                deps.store.set( 'datetime', resp[ 1 ] );
                                let newPollrate = resp[ 2 ] || deps.defPollrate;
                                newPollrate = Math.max( deps.minPollrate, Math.min( deps.maxPollrate, newPollrate ) );
                                deps.store.set( 'pollrate', newPollrate );

                                /**
                                    restart polling with new interval
                                */

                                const fetchInterval = ( newPollrate * 1000 ) + 600;
                                if ( deps.pollInterval )
                                    clearInterval( deps.pollInterval );

                                deps.pollInterval = setInterval( deps.GetMessages, fetchInterval );

                                deps.Log.info( `core`, deps.chalk.yellow( `[polling]` ), deps.chalk.white( `:  ` ),
                                    deps.chalk.blueBright( `<msg>` ), deps.chalk.gray( `Updated polling interval` ),
                                    deps.chalk.blueBright( `<interval>` ), deps.chalk.gray( `${ fetchInterval }ms` ) );
                            }
                        })
                        .catch( ( resp ) =>
                        {
                            console.error;
                        });
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
            accelerator: ( deps.bHotkeysEnabled === 1 || deps.store.getInt( 'bHotkeys' ) === 1 ) ? 'CTRL+Q' : '',
            click: function ()
            {
                deps.gracefulShutdown();
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
            label: 'Back',
            accelerator: 'CmdOrCtrl+B',
            click: function ( item, focusedWindow )
            {
                const { navigationHistory } = focusedWindow.webContents;
                if ( navigationHistory.canGoBack() )
                    navigationHistory.goBack();
            }
        },
        {
            label: 'Forward',
            accelerator: 'CmdOrCtrl+F',
            click: function ( item, focusedWindow )
            {
                const { navigationHistory } = focusedWindow.webContents;
                if ( navigationHistory.canGoForward() )
                    navigationHistory.goForward();
            }
        },
        {
            type: 'separator'
        },
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
                deps.toasted.notify(
                {
                    title: `${ deps.appTitle } - Test Notification`,
                    subtitle: `${ deps.appVer }`,
                    message: `This is a test notification which determines if NtfyToast and toasted-notifier are working on your system. If you can see this, then everything is good.`,
                    sound: 'Pop',
                    open: deps.store.get( 'instanceURL' ),
                    persistent: true,
                    sticky: true
                });
                deps.UpdateBadge( );
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Check for Updates',
            click()
            {
                deps.shell.openExternal( `${ deps.packageJson.homepage }` );
            }
        },
        {
            label: 'Sponsor',
            click()
            {
                deps.shell.openExternal( `https://buymeacoffee.com/aetherinox` );
            }
        },
        {
            id: 'about',
            label: 'About',
            click()
            {
                const aboutTitle = `About`;
                const guiAbout = new BrowserWindow(
                {
                    width: 480,
                    height: 440,
                    title: `${ aboutTitle }`,
                    icon: deps.appIcon,
                    parent: deps.guiMain,
                    center: true,
                    resizable: false,
                    fullscreenable: false,
                    minimizable: false,
                    maximizable: false,
                    modal: true,
                    backgroundColor: '#212121',
                    webPreferences:
                    {
                        nodeIntegration: false,         // security: disable node integration
                        contextIsolation: true,         // security: enable context isolation
                        enableRemoteModule: false,      // security: disable remote module
                        sandbox: true,                  // security: enable sandbox for about window
                        webSecurity: true               // security: enable web security
                    }
                });

                guiAbout.loadFile( path.join( app.getAppPath(), `pages`, `about.html` ) ).then( () =>
                {
                    guiAbout.webContents
                        .executeJavaScript(
                            `
                    setTitle('${ aboutTitle }');
                    setAppInfo('${ deps.appRepo }', '${ deps.appTitle }', '${ deps.appVer }', '${ deps.appAuthor }', '${ deps.appElectron }');`,
                            true
                        )
                        .then( ( result ) => {})
                        .catch( console.error );
                });

                guiAbout.webContents.on( 'new-window', ( e, url ) =>
                {
                    e.preventDefault();
                    deps.shell.openExternal( url );
                });

                /**
                    remove menubar from about window
                */

                guiAbout.setMenu( null );
            }
        }
    ]
}
];

    return menuMain;
};

/**
    electron > tray context menu
*/

function newMenuContext()
{
    if ( !deps )
        throw new Error( 'Dependencies not set. Call setMenuDeps first' );

    /**
        return menu template
    */

    return Menu.buildFromTemplate( [
        {
            label: 'Show App',
            click: function ()
            {
                deps.store.set( 'indicatorMessages', 0 );
                deps.app.badgeCount = 0;
                deps.guiMain.show();
            }
        },
        {
            label: 'Quit',
            click: function ()
            {
                deps.gracefulShutdown();
            }
        }
    ] );
}

/**
    export class

    @usage          import { newMenuMain, newMenuContext, setMenuDeps } from './Classes/Menu.js';
                    menuMain = newMenuMain();
                    contextMenu = newMenuContext();
                    const menuHeader = Menu.buildFromTemplate( menuMain );
*/

export { newMenuMain, newMenuContext, setMenuDeps };
