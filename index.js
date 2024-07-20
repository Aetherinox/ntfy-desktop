const { app, BrowserWindow, Tray, Menu, MenuItem } = require('electron');
const electronShell = require('electron').shell;
const toasted = require('toasted-notifier');
const process = require('process');
const path = require('path');
const moment = require('moment');
const Store = require('./store.js');

/*
    Declare > Package
*/

const packageJson = require('./package.json');
const appVer = packageJson.version;
const appName = packageJson.name;
const appAuthor = packageJson.author;

/*
    Declare > Window
*/

let winMain, winAbout, tray;
let appIconLoc = app.getAppPath() + '/ntfy.png';

/*
    Declare > CLI State

    bWinHidden      --hidden    app closes to tray on start
    bDevTools       --dev       dev tools added to menu
    bQuitOnClose    --quit      when pressing top-right close button, app exits instead of going to tray
*/

let bWinHidden = 0;
let bDevTools = 0;
let bHotkeysEnabled = 0;
let bQuitOnClose = 0;

/*
    Declare > Fallback

    fallback values in case a user does something unforseen to cause an index error
*/

const _Instance = 'https://ntfy.sh/app';
const _Interval = 5;

/*
    Declare > Store Values
*/

const store = new Store({
    configName: 'prefs',
    defaults: {
        instanceURL: 'https://ntfy.sh/app',
        apiToken: '',
        topics: 'topic1,topic2,topic3',
        bHotkeys: 0,
        bDevTools: 0,
        bQuitOnClose: 0,
        bPersistentNoti: 0
    }
});

/*
    Declare > Prompt

    @docs   : https://araxeus.github.io/custom-electron-prompt/
*/

const prompt = require('custom-electron-prompt');

/*
    Debug > Print args
*/

console.log(process.argv);

/*
    Menu > Main

    Entries for the top interface menu

    App | Configure | Help
*/

const menu_Main = [
    {
        label: '&App',
        id: 'app',
        submenu: [
            {
                label: 'Quit',
                accelerator: 'CTRL+Q',
                click: function () {
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
                accelerator: 'CTRL+G',
                click: function () {
                    prompt(
                        {
                            title: 'General Settings',
                            label: 'General Settings<div class="label-desc">Change the overall functionality of the app.</div>',
                            useHtmlLabel: true,
                            alwaysOnTop: true,
                            type: 'multiInput',
                            resizable: false,
                            customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                            height: 400,
                            icon: app.getAppPath() + '/ntfy.png',
                            multiInputOptions:
                                [
                                    {
                                        label: 'Developer tools in app menu',
                                        selectOptions: { 0: 'Disabled', 1: 'Enabled' },
					                    value: store.get('bDevTools'),
                                    },
                                    {
                                        label: 'Allow usage of hotkeys to navigate',
                                        selectOptions: { 0: 'Disabled', 1: 'Enabled' },
					                    value: store.get('bHotkeys'),
                                    },
                                    {
                                        label: 'Quit app instead of send-to-tray for close button',
                                        selectOptions: { 0: 'Disabled', 1: 'Enabled' },
					                    value: store.get('bQuitOnClose'),
                                    },
                                ],
                        },
                        winMain
                    )
                    .then((response) => {
                        if (response !== null) {
                            // do not update dev tools if value hasn't changed
                            if ( store.get('bDevTools') !== response[0])
                            {
                                store.set('bDevTools', response[0])
                                activeDevTools()
                            }

                            store.set('bHotkeys', response[1])
                            store.set('bQuitOnClose', response[2])
                        }
                    })
                    .catch((response) => {
                        console.error
                    })

                    /*
                    setTimeout(function (){
                        BrowserWindow.getFocusedWindow().webContents.openDevTools();
                    }, 3000);
                    */
                }
            },
            {
                label: 'Self-hosting',
                accelerator: 'CTRL+S',
                click: function () {
                    prompt(
                        {
                            title: 'Set Server Instance',
                            label: 'Server URL<div class="label-desc">This can either be the URL to the official ntfy.sh server, or your own self-hosted domain / ip.</div>',
                            useHtmlLabel: true,
                            value: store.get('instanceURL'),
                            alwaysOnTop: true,
                            type: 'input',
                            customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                            height: 240,
                            icon: app.getAppPath() + '/ntfy.png',
                            inputAttrs: {
                                type: 'url'
                            }
                        },
                        winMain
                    )
                    .then((response) => {
                        if (response !== null) {
                            store.set('instanceURL', response)
                            winMain.loadURL(response)
                        }
                    })
                    .catch((response) => {
                        console.error
                    })

                    /*
                    setTimeout(function (){
                        BrowserWindow.getFocusedWindow().webContents.openDevTools();
                    }, 3000);
                    */
                }
            },
            {
                label: 'API Token',
                accelerator: 'CTRL+T',
                click: function () {
                    prompt(
                        {
                            title: 'Set API Token',
                            label: 'API Token<div class="label-desc">Generate an API token within ntfy.sh  or your self-hosted instance and provide it below so that noficiations can be fetched.</div>',
                            useHtmlLabel: true,
                            value: store.get('apiToken'),
                            alwaysOnTop: true,
                            type: 'input',
                            customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                            height: 260,
                            icon: app.getAppPath() + '/ntfy.png',
                            inputAttrs: {
                                type: 'text'
                            }
                        },
                        winMain
                    )
                    .then((response) => {
                        if (response !== null) {
                            store.set('apiToken', response);
                        }
                    })
                    .catch((response) => {
                        console.error
                    })
                }
            },
            {
                label: 'Topics',
                accelerator: 'CTRL+SHIFT+T',
                click: function () {
                    prompt(
                        {
                            title: 'Set Subscribed Topics',
                            label: 'Subscribed Topics<div class="label-desc">Specify a list of topics you would like to receive push notifications for, separated by commas.<br><br>Ex: Meetings,Personal,Urgent</div>',
                            useHtmlLabel: true,
                            value: store.get('topics'),
                            alwaysOnTop: true,
                            type: 'input',
                            customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                            height: 290,
                            icon: app.getAppPath() + '/ntfy.png',
                            inputAttrs: {
                                type: 'text'
                            }
                        },
                        winMain
                    )
                    .then((response) => {
                        if (response !== null) {
                            store.set('topics', response);
                        }
                    })
                    .catch((response) => {
                        console.error
                    })
                }
            },
            {
                label: 'Notifications',
                accelerator: 'CTRL+SHIFT+N',
                click: function () {
                    prompt(
                        {
                            title: 'Notifications',
                            label: '<div class="label-desc">Determines how notifications will behave</div>',
                            useHtmlLabel: true,
                            alwaysOnTop: true,
                            type: 'multiInput',
                            resizable: false,
                            customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                            height: 230,
                            icon: app.getAppPath() + '/ntfy.png',
                            multiInputOptions:
                                [
                                    {
                                        label: 'Stay on screen until dismissed',
                                        selectOptions: { 0: 'Disabled', 1: 'Enabled' },
					                    value: store.get('bPersistentNoti'),
                                    }
                                ]
                        },
                        winMain
                    )
                    .then((response) => {
                        if (response !== null) {
                            store.set('bPersistentNoti', response[0])
                        }
                    })
                    .catch((response) => {
                        console.error
                    })

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
                click() {
                    const aboutTitle = `About`;
                    winAbout = new BrowserWindow({
                        width: 480,
                        height: 440,
                        title: `${aboutTitle}`,
                        icon: app.getAppPath() + '/ntfy.png',
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

                    winAbout.loadFile(path.join(__dirname, `pages`, `about.html`)).then(() => {
                        winAbout.webContents
                            .executeJavaScript(
                                `
                    setTitle('${aboutTitle}');
                    setAppInfo('${appName}', '${appVer}', '${appAuthor}');`,
                                true
                            )
                            .then((result) => {})
                            .catch(console.error);
                    });

                    winAbout.webContents.on('new-window', function (e, url) {
                        e.preventDefault();
                        require('electron').shell.openExternal(url);
                    });

                    // Remove menubar from about window
                    winAbout.setMenu(null);
                }
            },
            {
                label: 'View New Releases',
                click() {
                    electronShell.openExternal(`${packageJson.homepage}`);
                }
            }
        ]
    }];

/*
    Main Menu > Build
*/

const header_menu = Menu.buildFromTemplate(menu_Main);

/*
    Main Menu > Developer Tools
    slides in top position of 'App' menu

    when user disables dev console, must re-build menu, otherwise dev tools will stick

    App | Configure | Help
*/

function activeDevTools() {
    const header_menu = Menu.buildFromTemplate(menu_Main);
    Menu.setApplicationMenu(header_menu);

    if (bDevTools == 1 || store.get('bDevTools') == 1) {
        let menuItem = header_menu.getMenuItemById('app')

        menuItem.submenu.insert(0, new MenuItem(
        {
            label: 'Toggle Dev Tools',
            accelerator: process.platform === 'darwin' ? 'ALT+CMD+I' : 'CTRL+SHIFT+I',
            click: () => {
                winMain.webContents.toggleDevTools();
            }
        },
        {
            type: 'separator'
        },
        ))
    }
}

/*
    Main Menu > Set
*/

Menu.setApplicationMenu(header_menu);

/*
    App > Ready
*/

function ready() {

    /*
        New Window
    */

    winMain = new BrowserWindow({
        title: 'ntfy Desktop',
        width: 1280,
        height: 720,
        icon: appIconLoc,
        backgroundColor: '#212121'
    });

    /*
        Load default url to main window

        since the user has settings they can modify; add check instanceUrl to ensure it is a valid string.
        otherwise app will return invalid index and stop loading.
    */

    if (typeof (store.get('instanceURL')) !== 'string') {
        store.set('instanceURL', _Instance);
    }

    winMain.loadURL(store.get('instanceURL'))

    /*
        Event > Page Title Update
    */

    winMain.on('page-title-updated', (e) => {
        e.preventDefault();
    });

    /*
        Event > Close

        if --quit cli argument specified, app will completely quit when close pressed.
        otherwise; app will hide
    */

    winMain.on('close', function (e) {
        if (!app.isQuiting) {
            e.preventDefault();
            if (bQuitOnClose == 1 || store.get('bQuitOnClose') == 1) {
                app.isQuiting = true;
                app.quit();
            } else {
                winMain.hide();
            }
        }

        return false;
    });

    /*
        Event > Closed
    */

    winMain.on('closed', () => {
        winMain = null;
    });

    /*
        Event > New Window

        buttons leading to external websites should open in user browser
    */

    winMain.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });

    /*
        Event > Input
    */

    winMain.webContents.on('before-input-event', (e, input) => {

        /*
            Input > Refresh Page (CTRL + r)
        */

        if ((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.type === 'keyDown' && input.control && input.key === 'r') {
            winMain.webContents.reload();
        }

        /*
            Input > Zoom In (CTRL + =)
        */

        if ((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.type === 'keyDown' && input.control && input.key === '=') {
            winMain.webContents.zoomFactor += 0.1;
        }

        /*
            Input > Zoom Out (CTRL + -)
        */

        if ((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.type === 'keyDown' && input.control && input.key === '-') {
            winMain.webContents.zoomFactor -= 0.1;
        }

        /*
            Input > Zoom Reset (CTRL + 0)
        */

        if ((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.type === 'keyDown' && input.control && input.key === '0') {
            winMain.webContents.zoomFactor = 1;
        }

        /*
            Input > Quit (CTRL + q)
        */

        if ((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.type === 'keyDown' && input.control && input.key === 'q') {
            app.isQuiting = true;
            app.quit();
        }

        /*
            Input > Minimize to tray (CTRL + m)
        */

        if ((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.type === 'keyDown' && input.control && input.key === 'm') {
            bWinHidden = 1;
            winMain.hide();
        }

        /*
            Input > Dev Tools (CTRL + SHIFT + I || F12)
        */

        if (((bHotkeysEnabled == 1 || store.get('bHotkeys') == 1) && input.control && input.shift) || input.key === 'F12') {
            if (input.type === 'keyDown' && (input.key === 'I' || input.key === 'F12')) {
                winMain.webContents.toggleDevTools();
                winMain.webContents.on('devtools-opened', () => {
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
                        .then(() => {
                            winMain.webContents.toggleDevTools();
                        });
                });
            }
        }
    });

    /*
        Tray > Context Menu
    */

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show App',
            click: function () {
                winMain.show();
            }
        },
        {
            label: 'Quit',
            click: function () {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    /*
        Tray

        Windows         : left-click opens app, right-click opens context menu
        Linux           : left and right click have same functionality
    */

    tray = new Tray(appIconLoc);
    tray.setToolTip('ntfy Desktop');
    tray.setContextMenu(contextMenu);
    tray.on('click', function () {
        if (bWinHidden) {
            bWinHidden = 0;
            winMain.show();
        } else {
            bWinHidden = 1;
            winMain.hide();
        }
    });

    /*
        Get Message Data

        Even though ntfy's permissions are open by default, provide authorization bearer for users who
        have their permissions set to 'deny'.

        API Token can be specified in app.
    */

    async function GetMessageData(uri) {
        const cfgApiToken = store.get('apiToken');
        let req = await fetch(uri, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                Authorization: `Bearer ${cfgApiToken}`
            }
        });

        /*
            ntfy has the option to output message results as json, however the structure of that json
            is not properly formatted json and adds a newline to the end of each message.

            bring the json results in as a string, split them at newline and then push them to a new
            array.
        */

        const json = await req.text();
        let jsonArr = [];
        const entries = json.split('\n');
        for (let i = 0; i < entries.length; i++) {
            jsonArr.push(entries[i]);
        }

        /*
            Filter out empty entry in array which was caused by the last newline
        */

        const jsonResult = jsonArr.filter(function (el) {
            return el != null && el != '';
        });

        return jsonResult;
    }

    /*
        Get Messages

        ntfy url requires '&poll=1' otherwise the requests will freeze.
        @ref        : https://docs.ntfy.sh/subscribe/api/#poll-for-messages
    */

    const msgHistory = [];

    async function GetMessages() {

        console.log(`CHECKING FOR NEW MESSAGES`);

        const cfgTopics = store.get('topics');
        const cfgInstanceURL = store.get('instanceURL');
        const uri = `${cfgInstanceURL}/${cfgTopics}/json?since=${_Interval}s&poll=1`;
        const json = await GetMessageData(uri);

        /*
            Loop ntfy api results.
            only items with event = 'message' will be allowed through to display in a notification.
        */

        console.log(`---------------------------------------------------------`);
        console.log(`History ............... ${msgHistory}`);
        console.log(`Messages .............. ${JSON.stringify(json)}`);
        console.log(`---------------------------------------------------------\n`);

        for (let i = 0; i < json.length; i++) {
            const object = JSON.parse(json[i]);
            const id = object.id;
            const type = object.event;
            const time = object.time;
            const expires = object.expires;
            const message = object.message;
            const topic = object.topic;

            console.log(`Messages .............. ${type}:${id} found`);

            if (type != 'message') {
                continue;
            }

            /*
                convert unix timestamp into human readable
            */

            const dateHuman = moment.unix(time).format('YYYY-MM-DD hh:mm a');

            /*
                @ref    : https://github.com/Aetherinox/toasted-notifier
            */

            const msgStatus = msgHistory.includes(id) === true ? 'already sent, skipping' : 'pending send';
            console.log(`Messages .............. ${type}:${id} ${msgStatus}`);

            if (!msgHistory.includes(id)) {
                toasted.notify({
                    title: `${topic} - ${dateHuman}`,
                    message: `${message}`,
                    actions: ['Acknowledge'],
                    persistent: (store.get('bPersistentNoti') === 0 ? false : true),
                    sticky: (store.get('bPersistentNoti') === 0 ? false : true)
                });

                msgHistory.push(id);
            }

            console.log(`Messages .............. ${type}:${id} sent`);
        }

        console.log(`\n\n`);

        return json;
    }

    /*
        Loop args

        --hidden        : automatically hide window
        --dev           : enable developer tools
        --quit          : quit app when close button pressed
    */

    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--hidden') {
            bWinHidden = 1;
            winMain.hide();
        } else if (process.argv[i] === '--dev') {
            bDevTools = 1;
            activeDevTools()
        } else if (process.argv[i] === '--quit') {
            bQuitOnClose = 1;
        } else if (process.argv[i] === '--hotkeys') {
            bHotkeysEnabled = 1;
        }
    }

    /*
        Run timer every X seconds to check for new messages
    */

    const fetchInterval = (_Interval * 1000) + 600;
    setInterval(GetMessages, fetchInterval);

    activeDevTools()
}

/*
    App > Ready
*/

app.on('ready', ready);
