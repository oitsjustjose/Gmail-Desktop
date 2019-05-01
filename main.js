const electron = require('electron');
const path = require('path');
const url = require('url');
const shell = require('electron').shell;
const Store = require('./store.js');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;

const store = new Store({
  configName: "user-preferences",
  defaults: {
    "children_have_parent": false
  }
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let focusedWindow;
let children = [];
let children_have_parent;

function otherMenu() {
  var template = [{
    label: 'File',
    submenu: [{
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        createChildWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Print',
      accelerator: 'CmdOrCtrl+P',
      click: () => {
        focusedWindow.webContents.send('print');
      }
    }
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
      label: 'Back',
      accelerator: 'CmdOrCtrl+Left',
      click: () => {
        focusedWindow.webContents.send('back');
      }
    }, {
      label: 'Forward',
      accelerator: 'CmdOrCtrl+Right',
      click: () => {
        focusedWindow.webContents.send('forward');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Home',
      click: () => {
        focusedWindow.webContents.send('home');
      }
    }, {
      type: 'separator'
    }, {
      role: 'reload'
    }, {
      role: 'forcereload'
    }]
  }
  ];

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu); // Must be called within app.on('ready', function(){ ... });
}

function macOSMenu() {
  var template = [{
    label: 'Gmail',
    submenu: [{
      label: 'About Gmail',
      role: 'about'
    },
    {
      type: 'separator'
    },
    {
      role: 'services',
      submenu: []
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
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click: () => {
        createChildWindow();
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Print',
      accelerator: 'CmdOrCtrl+P',
      click: () => {
        focusedWindow.webContents.send('print');
      }
    }
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
      label: 'Back',
      accelerator: 'CmdOrCtrl+Left',
      click: () => {
        focusedWindow.webContents.send('back');
      }
    }, {
      label: 'Forward',
      accelerator: 'CmdOrCtrl+Right',
      click: () => {
        focusedWindow.webContents.send('forward');
      }
    }, {
      type: 'separator'
    }, {
      label: 'Home',
      click: () => {
        focusedWindow.webContents.send('home');
      }
    }, {
      type: 'separator'
    }, {
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
    },
    {
      label: 'Group Windows Together',
      sublabel: 'Selecting this uses the main window as a parent, grouping windows together but may cause some odd (but not broken) behavior',
      type: 'checkbox',
      checked: children_have_parent,
      click: () => {
        children_have_parent = !children_have_parent;
        store.set("children_have_parent", children_have_parent);
        for (var i in children) {
          children[i].setParentWindow(children_have_parent ? mainWindow : null);
        }
      }
    }
    ]
  }
  ];

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu); // Must be called within app.on('ready', function(){ ... });
}


function createChildWindow() {
  // Create the browser window.
  child = new BrowserWindow({
    title: 'Gmail',
    width: 800,
    height: 600,
    frame: process.platform != "darwin",
    titleBarStyle: process.platform == "darwin" ? 'hidden' : 'default',
    icon: __dirname + './assets/icons/png/gmail.png',
    show: process.platform != "darwin",
    nodeIntegration: true,
    parent: children_have_parent ? mainWindow : null
  });


  child.setAlwaysOnTop(false);

  child.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  child.on('closed', function (event) {
    event.preventDefault();
  });

  child.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    if (url.indexOf("mail.google.com") != -1) {
      child.webContents.send('changeURL', url);
      child.webContents.session.flushStorageData();
    } else {
      shell.openExternal(url);
    }
  });

  child.once('ready-to-show', () => {
    child.show();
  });

  children.push(child);
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Gmail',
    width: 800,
    height: 600,
    frame: process.platform != "darwin",
    titleBarStyle: process.platform == "darwin" ? 'hidden' : 'default',
    icon: __dirname + './assets/icons/png/gmail.png',
    show: process.platform != "darwin",
    nodeIntegration: true
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.on('closed', function (event) {
    event.preventDefault();
  });

  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    if (url.indexOf("mail.google.com") != -1) {
      mainWindow.webContents.send('changeURL', url);
      mainWindow.webContents.session.flushStorageData();
    } else {
      shell.openExternal(url);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  focusedWindow = mainWindow;
}

function init() {
  app.setName("Gmail");

  app.on('web-contents-created', (e, contents) => {
    if (contents.getType() == 'webview') {
      contents.on('new-window', (e, url) => {
        e.preventDefault();
        if (url.indexOf("mail.google.com") != -1) {
          focusedWindow.webContents.send('changeURL', url);
          focusedWindow.webContents.session.flushStorageData();
        } else {
          shell.openExternal(url);
        }
      });
      contents.on('will-navigate', (e, url) => {
        e.preventDefault();
        if (url.indexOf("mail.google.com") != -1) {
          focusedWindow.webContents.send('changeURL', url);
          focusedWindow.webContents.session.flushStorageData();
        } else {
          shell.openExternal(url);
        }
      });
    }
  });

  app.on('browser-window-focus', (event, window) => {
    focusedWindow = window;
    focusedWindow.webContents.on('new-window', function (e, url) {
      e.preventDefault();
      if (url.indexOf("mail.google.com") != -1) {
        focusedWindow.webContents.send('changeURL', url);
        focusedWindow.webContents.session.flushStorageData();
      } else {
        shell.openExternal(url);
      }
    });
  });

  app.on('window-all-closed', function () {
    focusedWindow.webContents.session.flushStorageData();
    app.quit();
  });

  app.on('ready', function () {
    children_have_parent = store.get("children_have_parent");
    createWindow();
    // Dynamically pick a menu-type
    if (process.platform == "darwin") { macOSMenu() } else { otherMenu() }
  });
}

init();