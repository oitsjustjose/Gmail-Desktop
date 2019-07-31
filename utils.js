const Store = require('./store.js');

var doNotifications;
let store = new Store({
    configName: "user-preferences",
    defaults: {
        "notifications": true,
        "width": 800,
        "height": 600,
        "x": 0,
        "y": 0
    }
});

function getWindowData() {
    return {
        "width": store.get("width"),
        "height": store.get("height"),
        "x": store.get("x"),
        "y": store.get("y")
    };
}

function updateWindowCoords(x, y) {
    store.set("x", x);
    store.set("y", y);
}

function updateWindowDims(width, height) {
    store.set("width", width);
    store.set("height", height);
}


function shouldNotify() {
    return doNotifications;
}

function nonMacOSMenu(app) {
    doNotifications = store.get("notifications");

    var template = [{
        label: 'File',
        submenu: [{
            label: 'Print',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
                mainWindow.webContents.print({
                    "printBackground": true
                });
            }
        },
        {
            type: "separator"
        },
        {
            label: "Show Notifications",
            type: 'checkbox',
            checked: doNotifications,
            click: () => {
                doNotifications = !doNotifications;
                store.set("notifications", doNotifications);
            }
        },
        {
            label: 'Make Default Mail App',
            type: 'checkbox',
            checked: app.isDefaultProtocolClient('mailto'),
            click() {
                if (app.isDefaultProtocolClient('mailto')) {
                    app.removeAsDefaultProtocolClient('mailto');
                } else {
                    app.setAsDefaultProtocolClient('mailto');
                }
            }
        },
        ]
    },
    {
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            selector: 'undo:'
        },
        {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            selector: 'redo:'
        },
        {
            type: 'separator'
        },
        {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
        },
        {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
        },
        {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
        },
        {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:'
        }
        ]
    },
    {
        label: 'View',
        submenu: [{
            role: 'toggledevtools'
        },
        {
            type: 'separator'
        },
        {
            role: 'resetzoom'
        },
        {
            role: 'zoomin'
        },
        {
            role: 'zoomout'
        },
        {
            type: 'separator'
        },
        {
            role: 'togglefullscreen'
        }
        ]
    },
    {
        label: 'Go',
        submenu: [{
            role: 'reload'
        }, {
            role: 'forcereload'
        }]
    }
    ];

    return template;
}

function macOSMenu(app) {
    doNotifications = store.get("notifications");

    var template = [{
        label: 'Gmail Desktop',
        submenu: [{
            label: 'About Gmail Desktop',
            role: 'about'
        },
        {
            type: 'separator'
        },
        {
            label: 'Make Default Mail App',
            type: 'checkbox',
            checked: app.isDefaultProtocolClient('mailto'),
            click() {
                if (app.isDefaultProtocolClient('mailto')) {
                    app.removeAsDefaultProtocolClient('mailto');
                } else {
                    app.setAsDefaultProtocolClient('mailto');
                }
            }
        },
        {
            label: "Show Notifications",
            type: 'checkbox',
            checked: doNotifications,
            click: () => {
                doNotifications = !doNotifications;
                store.set("notifications", doNotifications);
            }
        },
        {
            type: 'separator'
        },
        {
            role: 'hide'
        },
        {
            role: 'hideothers'
        },
        {
            role: 'unhide'
        },
        {
            type: 'separator'
        },
        {
            role: 'quit'
        }
        ]
    },
    {
        label: 'File',
        submenu: [{
            label: 'Print',
            accelerator: 'CmdOrCtrl+P',
            click: () => {
                mainWindow.webContents.print({
                    "printBackground": true
                });
            }
        }]
    },
    {
        label: 'Edit',
        submenu: [{
            label: 'Undo',
            accelerator: 'CmdOrCtrl+Z',
            selector: 'undo:'
        },
        {
            label: 'Redo',
            accelerator: 'Shift+CmdOrCtrl+Z',
            selector: 'redo:'
        },
        {
            type: 'separator'
        },
        {
            label: 'Cut',
            accelerator: 'CmdOrCtrl+X',
            selector: 'cut:'
        },
        {
            label: 'Copy',
            accelerator: 'CmdOrCtrl+C',
            selector: 'copy:'
        },
        {
            label: 'Paste',
            accelerator: 'CmdOrCtrl+V',
            selector: 'paste:'
        },
        {
            label: 'Select All',
            accelerator: 'CmdOrCtrl+A',
            selector: 'selectAll:'
        }
        ]
    },
    {
        label: 'View',
        submenu: [{
            role: 'toggledevtools'
        },
        {
            type: 'separator'
        },
        {
            role: 'resetzoom'
        },
        {
            role: 'zoomin'
        },
        {
            role: 'zoomout'
        },
        {
            type: 'separator'
        },
        {
            role: 'togglefullscreen'
        }
        ]
    },
    {
        label: 'Go',
        submenu: [{
            role: 'reload'
        }, {
            role: 'forcereload'
        }]
    },
    {
        label: 'Window',
        submenu: [{
            label: 'Minimize',
            accelerator: 'CmdOrCtrl+M',
            selector: 'performMiniaturize:'
        },
        {
            label: 'Close',
            accelerator: 'CmdOrCtrl+W',
            selector: 'performClose:'
        },
        {
            type: 'separator'
        },
        {
            label: 'Bring All to Front',
            selector: 'arrangeInFront:'
        }
        ]
    }
    ];

    return template;
}

function getMenu(app, type) {
    if (type == 'darwin') {
        return macOSMenu(app);
    } else {
        return nonMacOSMenu(app);
    }
}

module.exports = {
    "getMenu": getMenu,
    "shouldNotify": shouldNotify,
    "getWindowData": getWindowData,
    "updateWindowCoords": updateWindowCoords,
    "updateWindowDims": updateWindowDims
};