const
{
    app,
    BrowserWindow,
    Tray,
    Menu,
    MenuItem
} = require('electron');
const notifier = require('node-notifier');
const process = require('process');
const path = require('path');
const Store = require('./store.js');

let win, tray;
let winHidden = 0;
let appIconLoc = app.getAppPath() + "/ntfy.png";

const store = new Store(
{
    configName: 'prefs',
    defaults:
    {
        instanceURL: "https://ntfy.sh/app",
        apiToken: ""
    }
});

/*
    Req > Prompt

    @docs   : https://araxeus.github.io/custom-electron-prompt/
*/

const prompt = require("custom-electron-prompt");

/*
    Debug > Print args
*/

console.log(process.argv);

/*
    App > Top Menu
*/

Menu.setApplicationMenu(Menu.buildFromTemplate([
{
    label: 'App',
    submenu: [
    {
        label: "Toggle Dev Tools",
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'F12',
        click: function()
        {
            win.webContents.toggleDevTools();
        }
    },
    {
        type: 'separator'
    },
    {
        label: "Quit",
        click: function()
        {
            app.isQuiting = true;
            app.quit();
        }
    }, ]
},
{
    label: 'Configure',
    submenu: [
    {
        label: "Set Server",
        click: function()
        {
            prompt(
                {
                    title: "Set Server Instance",
                    label: 'URL:',
                    value: store.get("instanceURL"),
                    alwaysOnTop: true,
                    inputAttrs:
                    {
                        type: 'url'
                    },
                    type: 'input'
                }, win)
                .then((response) =>
                {
                    if ((response !== null))
                    {
                        store.set("instanceURL", response);
                        win.loadURL(response);
                    }
                })
                .catch(console.error);
        }
    },
    {
        label: "Set API Token",
        click: function()
        {
            prompt(
                {
                    title: "Set API Token",
                    label: 'API Token:',
                    value: store.get("apiToken"),
                    alwaysOnTop: true,
                    inputAttrs:
                    {
                        type: 'text'
                    },
                    type: 'input'
                }, win)
                .then((response) =>
                {
                    if ((response !== null))
                    {
                        store.set("apiToken", response);
                        win.loadURL(response);
                    }
                })
                .catch(console.error);
        }
    }]
}]));

/*
    App > Ready
*/

function ready()
{

    /*
        New Window
    */

    win = new BrowserWindow(
    {
        title: "ntfy electron",
        width: 1280,
        height: 720,
        icon: appIconLoc,
    });

    win.loadURL(store.get("instanceURL"));

    win.on('closed', () =>
    {
        win = null;
    });

    win.webContents.on('new-window', (event, url) =>
    {
        event.preventDefault();
        win.loadURL(url);
    });

    /*
        Event > Input
    */

    win.webContents.on("before-input-event", (e, input) =>
    {

        /*
            Input > Refresh Page
        */

        if (input.type === "keyDown" && input.control && input.key === "r") {
            win.webContents.reload();
        }

        /*
            Input > Zoom In
        */

        if (input.type === "keyDown" && input.control && input.key === "=") {
            mainWindow.webContents.zoomFactor += 0.1;
        }

        /*
            Input > Zoom Out
        */

        if (input.type === "keyDown" && input.control && input.key === "-") {
            mainWindow.webContents.zoomFactor -= 0.1;
        }

        /*
            Input > Zoom Reset
        */

        if (input.type === "keyDown" && input.control && input.key === "0") {
            mainWindow.webContents.zoomFactor = 1;
        }

        /*
            Input > Quit
        */

        if (input.type === "keyDown" && input.control && input.key === "q") {
            app.isQuiting = true;
            app.quit();
        }

        /*
            Input > Minimize to tray
        */

        if (input.type === "keyDown" && input.control && input.key === "m") {
            winHidden = 1;
            win.hide();
        }

        /*
            Input > Dev Tools

            Binds   : CTRL + SHIFT + I
                      F12
        */

        if ( ( input.control && input.shift ) || input.key === "F12" )
        {
            if (input.type === "keyDown" && (input.key === "I" || input.key === "F12")) {
                win.webContents.toggleDevTools();
                win.webContents.on('devtools-opened', () =>
                {
                    win.webContents.devToolsWebContents.executeJavaScript(`
                            new Promise((resolve)=> {
                                let keysPressed = {};

                                addEventListener("keydown", (event) => {
                                    if (event.key === "F12") {
                                        resolve();
                                    }
                                }, { once: true });

                                addEventListener("keydown", (event) => {
                                    keysPressed[event.key] = true;
                                    if (keysPressed['Control'] && keysPressed['Shift'] && event.key == 'I') {
                                        resolve();
                                    }
                                });

                                addEventListener('keyup', (event) => {
                                    delete keysPressed[event.key];
                                });
                            })
                        `)
                        .then(() =>
                        {
                            win.webContents.toggleDevTools();
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
        click: function()
        {
            win.show();
        }
    },
    {
        label: 'Quit',
        click: function()
        {
            app.isQuiting = true;
            app.quit();
        }
    }]);

    /*
        Tray
    */

    tray = new Tray(appIconLoc);
    tray.setToolTip("ntfy electron");
    tray.setContextMenu(contextMenu);
    tray.on("click", function()
    {
        if (winHidden)
        {
            winHidden = 0;
            win.show();
        }
        else
        {
            winHidden = 1;
            win.hide();
        }
    });

    win.on("page-title-updated", (event) =>
    {
        event.preventDefault();
    });

    /*
        Close Button
    */

    win.on('close', function(event)
    {
        if (!app.isQuiting)
        {
            event.preventDefault();
            win.hide();
        }

        return false;
    });

    /*
        Loop args

        --hidden        : automatically hide window
    */

    for (i = 0; i < process.argv.length; i++)
    {
        if (process.argv[i] == "--hidden")
        {
            winHidden = 1;
            win.hide();
        }
    }
}

/*
    App > Ready
*/

app.on('ready', ready);