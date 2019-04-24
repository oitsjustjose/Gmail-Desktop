const electron = require('electron');
const path = require('path');
const url = require('url');
const shell = require('electron').shell;
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createMenu() {
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
            createWindow();
            createMenu();
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Print',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('print')
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
          role: 'toggledevtools',
          accelerator: "F11"
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
          mainWindow.webContents.send('back');
        }
      }, {
        label: 'Forward',
        accelerator: 'CmdOrCtrl+Right',
        click: () => {
          mainWindow.webContents.send('forward');
        }
      }, {
        type: 'separator'
      }, {
        label: 'Home',
        click: () => {
          mainWindow.webContents.send('home');
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
      ]
    }
  ];

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu); // Must be called within app.on('ready', function(){ ... });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Gmail',
    width: 800,
    height: 600,
    frame: false,
    titleBarStyle: 'hidden',
    icon: __dirname + './assets/icons/mac/gmail.icns',
    show: false,
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

  mainWindow.setMenu(null);
}

function init() {
  app.on('web-contents-created', (e, contents) => {
    if (contents.getType() == 'webview') {
      contents.on('new-window', (e, url) => {
        e.preventDefault();
        if (url.indexOf("mail.google.com") != -1) {
          mainWindow.webContents.send('changeURL', url);
          mainWindow.webContents.session.flushStorageData();
        } else {
          shell.openExternal(url);
        }
      });
      contents.on('will-navigate', (e, url) => {
        e.preventDefault();
        if (url.indexOf("mail.google.com") != -1) {
          mainWindow.webContents.send('changeURL', url);
          mainWindow.webContents.session.flushStorageData();
        } else {
          shell.openExternal(url);
        }
      });
    }
  });

  app.on('window-all-closed', function () {
    mainWindow.webContents.session.flushStorageData();
    app.quit();
  });

  app.on('ready', function () {
    createWindow();
    createMenu();
  });
}

init();