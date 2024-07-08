const { app, BrowserWindow, Tray, Menu, MenuItem } = require('electron');
const process = require('process');
const path = require('path');
const Store = require('./store.js');

let win, tray;
let winHidden = 0;
let appIconLoc = app.getAppPath() + "/ntfy.png";

const store = new Store({
    configName: 'prefs',
    defaults: {
      instanceURL: "https://ntfy.sh/app"
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
             label: "Quit",
             click: function() {
                app.isQuiting = true;
                app.quit();
             }
          },
       ]
    },
    {
       label: 'Options',
       submenu: [
          {
             label: "Set Server",
             click: function() {
                 prompt({
                     title: "Set Server Instance",
                     label: 'URL:',
                     value: store.get("instanceURL"),
                     alwaysOnTop: true,
                     inputAttrs: {
                         type: 'url'
                     },
                     type: 'input'
                 }, win)
                 .then((response) => {
                     if((response !== null)) {
                         store.set("instanceURL", response);
                         win.loadURL(response);
                     }
                 })
                 .catch(console.error);
             }
          },
       ]
    }
]));

/*
    App > Ready
*/

function ready() {

    /*
        New Window
    */

    win = new BrowserWindow({
        title: "ntfy electron",
        width: 1280,
        height: 720,
        icon: appIconLoc,
    });
    
    win.loadURL(store.get("instanceURL"));
    
    win.on('closed', () => {
        win = null;
    });
    
    win.webContents.on('new-window', (event, url) => {
        event.preventDefault();
        win.loadURL(url);
    });
    
    /*
        Tray > Context Menu
    */

    var contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click:  function(){
            win.show();
        } },
        { label: 'Quit', click:  function(){
            app.isQuiting = true;
            app.quit();
        } }
    ]);

    /*
        Tray
    */

    tray = new Tray(appIconLoc);
    tray.setToolTip("ntfy electron");
    tray.setContextMenu(contextMenu);
    tray.on("click", function() {
        if(winHidden) {
            winHidden = 0;
            win.show();
        } else {
            winHidden = 1;
            win.hide();
        }
    });
    
    win.on("page-title-updated", (event) => {
        event.preventDefault();
    });
    
    /*
        Close Button
    */

    win.on('close', function (event) {
        if(!app.isQuiting){
            event.preventDefault();
            win.hide();
        }

        return false;
    });

    /*
        Loop args

        --hidden        : automatically hide window
    */

    for(i = 0; i < process.argv.length; i++) {
        if(process.argv[i] == "--hidden") {
            winHidden = 1;
            win.hide();
        }
    }
}

/*
    App > Ready
*/

app.on('ready', ready);
