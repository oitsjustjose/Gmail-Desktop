const electron = require('electron');
const path = require('path');
const shell = require('electron').shell;
const Store = require('./store.js');
const app = electron.app;
const Menu = electron.Menu;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
const ipc = require('electron').ipcMain;
const contextMenu = require('electron-context-menu');
const Notification = require('electron').Notification;

const store = new Store({
  configName: "user-preferences",
  defaults: {
    "children_have_parent": false
  }
});

let mainWindow;
let focusedWindow;
let children = [];
let children_have_parent;
let accountNumber = 1;
let doNotifications;

function otherMenu() {
  var template = [{
      label: 'File',
      submenu: [{
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow(true);
          }
        }, {
          type: 'separator'
        },
        {
          label: 'Print',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            window.webContents.print({
              "printBackground": true
            });
          }
        }, {
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
          label: 'New Window',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            createWindow(true);
          }
        }, {
          type: 'separator'
        },
        {
          label: 'Print',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            window.webContents.print({
              "printBackground": true
            });
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

  Menu.setApplicationMenu(menu);
}

function createWindow(isChild) {
  win = new BrowserWindow({
    title: 'Gmail',
    width: 800,
    height: 600,
    frame: process.platform != "darwin",
    titleBarStyle: process.platform == "darwin" ? 'hidden' : 'default',
    icon: path.join(__dirname, 'assets', 'icons', 'png', 'gmail.png'),
    show: process.platform != "darwin",
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload')
    },
    transparent: true
  });

  if (isChild) {
    if (children_have_parent) {
      win.setParentWindow(mainWindow);
    }
    win.loadURL("https://mail.google.com/mail/u/" + accountNumber);
    accountNumber++;
  } else {
    win.loadURL("https://mail.google.com/");
  }

  win.webContents.on('dom-ready', () => {
    addCustomCSS(win);
  });

  win.on('closed', function (event) {
    event.preventDefault();
  });

  win.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    if (url.indexOf("mail.google.com") != -1) {
      win.loadURL(url);
      addCustomCSS(win);
      win.webContents.session.flushStorageData();
    } else {
      shell.openExternal(url);
    }
  });

  win.once('ready-to-show', () => {
    win.show();
    win.focus();
  });

  ipc.on('unread-count', (evt, unreadCount) => {
    if (process.platform == "darwin") {
      app.dock.setBadge(unreadCount ? unreadCount.toString() : '');
    }
    if (doNotifications && Notification.isSupported()) {
      // Move the sound if it doesn't exist -- macOS only
      if (process.platform == "darwin") {
        const homedir = require('os').homedir();
        if (!fs.existsSync(homedir + "/Library/Sounds/gmail.caf")) {
          fs.copyFileSync(path.join(__dirname, "assets", "sounds", "mail-sent.caf"), homedir + "/Library/Sounds/gmail.caf");
        }
      }
      // Notify the user that there is new mail
      let notification = new Notification({
        title: "New Mail",
        body: "Click to read full message",
        sound: "gmail",
        icon: path.join(__dirname, 'assets', 'icons', 'png', 'gmail.png'),
      });
      notification.onclick = () => {
        app.focus();
      };
      notification.show();
    }
  });

  focusedWindow = win;
  if (isChild) {
    children.push(win);
  } else {
    mainWindow = win;
  }
}

function createMailto(url) {
  replyToWindow = new BrowserWindow({
    parent: focusedWindow
  });
  userID = focusedWindow.webContents.getURL();
  userID = userID.substring(userID.indexOf("/u/") + 3);
  userID = userID.substring(0, userID.indexOf("/"));
  replyToWindow.loadURL(
    "https://mail.google.com/mail/u/" + userID + "?extsrc=mailto&url=" + url
  );
}

function addCustomCSS(windowElement) {
  platform = process.platform == "darwin" ? "macos" : "";
  windowElement.webContents.insertCSS(
    fs.readFileSync(path.join(__dirname, 'css', 'style.css'), 'utf8')
  );

  const platformCSSFile = path.join(
    __dirname,
    'css',
    `style.${platform}.css`
  );
  if (fs.existsSync(platformCSSFile)) {
    windowElement.webContents.insertCSS(
      fs.readFileSync(platformCSSFile, 'utf8')
    );
  }
}

function init() {
  app.setName("Gmail");

  app.on('window-all-closed', function () {
    focusedWindow.webContents.session.flushStorageData();
    app.quit();
  });

  app.on('browser-window-focus', (event, browserWindow) => {
    focusedWindow = browserWindow;
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (app.isReady()) {
      createMailto(url);
    } else {
      app.on('ready', function () {
        createMailto(url);
      });
    }
  });

  app.on('ready', function () {

    contextMenu({
      shouldShowMenu: true,
      showInspectElement: !app.isPackaged
    });

    children_have_parent = store.get("children_have_parent");
    doNotifications = store.get("notifications");

    if (process.platform == "darwin") {
      app.dock.bounce("critical");
    }
    createWindow(false);

    // Dynamically pick a menu-type
    if (process.platform == "darwin") {
      macOSMenu();
    } else {
      otherMenu();
    }
  });
}

init();