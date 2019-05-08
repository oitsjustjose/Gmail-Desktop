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
    "notifications": true
  }
});

let mainWindow;
let doNotifications;

function otherMenu() {
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

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
}

function macOSMenu() {
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

  var menu = Menu.buildFromTemplate(template);

  Menu.setApplicationMenu(menu);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Gmail Desktop',
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
    transparent: process.platform == "darwin"
  });

  mainWindow.loadURL("https://mail.google.com/");

  mainWindow.webContents.on('dom-ready', () => {
    addCustomCSS(mainWindow);
  });

  mainWindow.on('closed', function (event) {
    event.preventDefault();
  });

  mainWindow.webContents.on('new-window', function (e, url) {
    e.preventDefault();
    if (url.indexOf("mail.google.com") != -1) {
      mainWindow.loadURL(url);
      addCustomCSS(mainWindow);
      mainWindow.webContents.session.flushStorageData();
    } else {
      shell.openExternal(url);
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  ipc.on('unread', (evt, unreadCount) => {
    // Still update the badge regardless
    if (process.platform == "darwin") {
      app.dock.setBadge(unreadCount ? ('' + unreadCount) : '');
    }
  });

  ipc.on('notification', (evt, sender, subject) => {
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
        subtitle: "From: " + sender,
        body: subject,
        sound: "gmail"
      });
      notification.onclick = () => {
        app.focus();
      };
      notification.show();
    }
  });

  ipc.on('print', () => {
    alert("IPC Renderer got function `print`");
    mainWindow.webContents.print({
      printBackground: true
    });
  });
}

function createMailto(url) {
  replyToWindow = new BrowserWindow({
    parent: mainWindow
  });
  userID = mainWindow.webContents.getURL();
  userID = userID.substring(userID.indexOf("/u/") + 3);
  userID = userID.substring(0, userID.indexOf("/"));
  replyToWindow.loadURL(
    "https://mail.google.com/mail/u/" + userID + "?extsrc=mailto&url=" + url
  );
}

function addCustomCSS(windowElement) {
  platform = process.platform == "darwin" ? "macos" : "";
  windowElement.webContents.insertCSS(
    fs.readFileSync(path.join(__dirname, 'assets', 'css', 'style.css'), 'utf8')
  );

  const platformCSSFile = path.join(
    __dirname,
    'assets',
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
  app.setName("Gmail Desktop");

  app.on('window-all-closed', function () {
    mainWindow.webContents.session.flushStorageData();
    mainWindow = null;
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on('activate', function () {
    if (mainWindow === null) {
      createWindow();
      // Dynamically pick a menu-type
      if (process.platform == "darwin") {
        macOSMenu();
      } else {
        otherMenu();
      }
    }
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
    if (app.isPackaged) {
      contextMenu({
        shouldShowMenu: true
      });
    } else {
      contextMenu({
        shouldShowMenu: true,
        showInspectElement: true
      });
    }

    doNotifications = store.get("notifications");

    if (process.platform == "darwin") {
      app.dock.bounce("critical");
    }
    createWindow();

    // Dynamically pick a menu-type
    if (process.platform == "darwin") {
      macOSMenu();
    } else {
      otherMenu();
    }
  });
}

init();