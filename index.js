const { app, BrowserWindow, Tray, Menu } = require('electron');
const electronShell = require('electron').shell;
const toasted = require('toasted-notifier');
const process = require('process');
const path = require('path');
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
let winHidden = 0;
let appIconLoc = app.getAppPath() + '/ntfy.png';

/*
    Declare > Store Values
*/

const store = new Store({
    configName: 'prefs',
    defaults: {
        instanceURL: 'https://ntfy.sh/app',
        apiToken: '',
        topics: 'topic1,topic2,topic3'
    }
});

/*
    Req > Prompt

    @docs   : https://araxeus.github.io/custom-electron-prompt/
*/

const prompt = require('custom-electron-prompt');

/*
    Debug > Print args
*/

console.log(process.argv);

/*
    App > Top Menu
*/

Menu.setApplicationMenu(
    Menu.buildFromTemplate([
        {
            label: 'App',
            submenu: [
                {
                    label: 'Toggle Dev Tools',
                    accelerator: process.platform === 'darwin' ? 'ALT+CMD+I' : 'CTRL+SHIFT+I',
                    click: function () {
                        winMain.webContents.toggleDevTools();
                    }
                },
                {
                    type: 'separator'
                },
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
            label: 'Configure',
            submenu: [
                {
                    label: 'Set Server',
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
                                    store.set('instanceURL', response);
                                    winMain.loadURL(response);
                                }
                            })
                            .catch(console.error);
                        /*
                setTimeout(function (){
                    BrowserWindow.getFocusedWindow().webContents.openDevTools();
                }, 5000);
                */
                    }
                },
                {
                    label: 'Set API Token',
                    accelerator: 'CTRL+T',
                    click: function () {
                        prompt(
                            {
                                title: 'Set API Token',
                                label: 'API Token<div class="label-desc">Generate an API token within ntfy.sh and provide it below so that noficiations can be fetched.</div>',
                                useHtmlLabel: true,
                                value: store.get('apiToken'),
                                alwaysOnTop: true,
                                type: 'input',
                                customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                                height: 240,
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
                            .catch(console.error);
                    }
                },
                {
                    label: 'Set Topics',
                    accelerator: 'CTRL+SHIFT+T',
                    click: function () {
                        prompt(
                            {
                                title: 'Set Subscribed Topics',
                                label: 'Subscribed Topics<div class="label-desc">Specify a list of topics you would like to receive push notifications for.</div>',
                                useHtmlLabel: true,
                                value: store.get('topics'),
                                alwaysOnTop: true,
                                type: 'input',
                                customStylesheet: path.join(__dirname, `pages`, `css`, `prompt.css`),
                                height: 240,
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
                            .catch(console.error);
                    }
                }
            ]
        },
        {
            id: 'help',
            label: 'Help',
            submenu: [
                {
                    id: 'about',
                    label: 'About',
                    click() {
                        const aboutTitle = `About ${appName}`;
                        winAbout = new BrowserWindow({
                            width: 480,
                            height: 440,
                            title: `${aboutTitle}`,
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
                        setTitle("${aboutTitle}");
                        setAppInfo("${appName}", "${appVer}", "${appAuthor}");`,
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
        }
    ])
);

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

    winMain.loadURL(store.get('instanceURL'));

    winMain.on('closed', () => {
        winMain = null;
    });

    winMain.webContents.on('new-window', (e, url) => {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });

    /*
        Event > Input
    */

    winMain.webContents.on('before-input-event', (e, input) => {
        /*
            Input > Refresh Page

            Binds   : CTRL + r
        */

        if (input.type === 'keyDown' && input.control && input.key === 'r') {
            winMain.webContents.reload();
        }

        /*
            Input > Zoom In

            Binds   : CTRL + =
        */

        if (input.type === 'keyDown' && input.control && input.key === '=') {
            winMain.webContents.zoomFactor += 0.1;
        }

        /*
            Input > Zoom Out

            Binds   : CTRL + -
        */

        if (input.type === 'keyDown' && input.control && input.key === '-') {
            winMain.webContents.zoomFactor -= 0.1;
        }

        /*
            Input > Zoom Reset

            Binds   : CTRL + 0
        */

        if (input.type === 'keyDown' && input.control && input.key === '0') {
            winMain.webContents.zoomFactor = 1;
        }

        /*
            Input > Quit

            Binds   : CTRL + q
        */

        if (input.type === 'keyDown' && input.control && input.key === 'q') {
            app.isQuiting = true;
            app.quit();
        }

        /*
            Input > Minimize to tray

            Binds   : CTRL + m
        */

        if (input.type === 'keyDown' && input.control && input.key === 'm') {
            winHidden = 1;
            winMain.hide();
        }

        /*
            Input > Dev Tools

            Binds   : CTRL + SHIFT + I
                      F12
        */

        if ((input.control && input.shift) || input.key === 'F12') {
            if (input.type === 'keyDown' && (input.key === 'I' || input.key === 'F12')) {
                winMain.webContents.toggleDevTools();
                winMain.webContents.on('devtools-opened', () => {
                    winMain.webContents.devToolsWebContents
                        .executeJavaScript(
                            `
                            new Promise((resolve)=> {
                                let keysPressed = {};

                                addEventListener("keydown", (e) => {
                                    if (e.key === "F12") {
                                        resolve();
                                    }
                                }, { once: true });

                                addEventListener("keydown", (e) => {
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

    var contextMenu = Menu.buildFromTemplate([
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
        if (winHidden) {
            winHidden = 0;
            winMain.show();
        } else {
            winHidden = 1;
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

    async function GetMessages() {
        const cfgTopics = store.get('topics');
        const cfgInstanceURL = store.get('instanceURL');
        const uri = `${cfgInstanceURL}/${cfgTopics}/json?since=10s&poll=1`;
        const json = await GetMessageData(uri);

        /*
            Loop ntfy api results.
            only items with event = 'message' will be allowed through to display in a notification.
        */

        for (let i = 0; i < json.length; i++) {
            const object = JSON.parse(json[i]);
            const type = object.event;
            const time = object.time;
            const expires = object.expires;
            const message = object.message;
            const topic = object.topic;

            if (type != 'message') {
                continue;
            }

            toasted.notify({
                title: `Topic: ${topic}`,
                message: `${message}`
            });
        }

        return json;
    }

    winMain.on('page-title-updated', (e) => {
        e.preventDefault();
    });

    /*
        Close Button
    */

    winMain.on('close', function (e) {
        if (!app.isQuiting) {
            e.preventDefault();
            winMain.hide();
        }

        return false;
    });

    /*
        Loop args

        --hidden        : automatically hide window
    */

    for (let i = 0; i < process.argv.length; i++) {
        if (process.argv[i] === '--hidden') {
            winHidden = 1;
            winMain.hide();
        }
    }

    /*
        Run timer every X seconds to check for new messages
    */

    const fetchInterval = 10500;
    setInterval(GetMessages, fetchInterval);
}

/*
    App > Ready
*/

app.on('ready', ready);
