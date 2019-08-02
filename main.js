const electron = require('electron');
const path = require('path');
const shell = require('electron').shell;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const fs = require('fs');
const ipc = require('electron').ipcMain;
const contextMenu = require('electron-context-menu');
const Notification = require('electron').Notification;
const WinBadge = require('electron-windows-badge');
const Menu = electron.Menu;

const getMenuForOS = require("./utils.js").getMenu;
const shouldNotify = require("./utils.js").shouldNotify;
const updateWindowCoords = require("./utils.js").updateWindowCoords;
const updateWindowDims = require("./utils.js").updateWindowDims;
const getWindowData = require("./utils.js").getWindowData;
const updateColor = require('./colors.js').updateColor;

let mainWindow;
let winBadge;


function createWindow() {
  var windowMeta = getWindowData();

  mainWindow = new BrowserWindow({
    title: 'Gmail Desktop',
    width: windowMeta.width,
    height: windowMeta.height,
    x: windowMeta.x,
    y: windowMeta.y,
    frame: process.platform != "darwin" && process.platform != "win32",
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'assets', 'icons', 'png', 'gmail.png'),
    show: process.platform != "darwin",
    webPreferences: {
      nodeIntegration: false,
      nativeWindowOpen: true,
      preload: path.join(__dirname, 'preload')
    },
    transparent: process.platform == "darwin",
  });

  mainWindow.loadURL("https://mail.google.com/");

  mainWindow.webContents.on('dom-ready', () => {
    addCustomCSS(mainWindow);
  });

  mainWindow.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    if (url.indexOf("mail.google.com") != -1) {
      mainWindow.loadURL(url);
    } else {
      shell.openExternal(url);
    }
  });

  mainWindow.on("move", (event) => {
    var bounds = mainWindow.getBounds();
    updateWindowCoords(bounds.x, bounds.y);
  });

  mainWindow.on("resize", (event) => {
    var bounds = mainWindow.getBounds();
    updateWindowDims(bounds.width, bounds.height);
  });

  // Stuff for the custom titlebar in Windows
  ipc.on('menu', (evt, x, y) => {
    Menu.getApplicationMenu().popup({
      x: Math.ceil(x),
      y: Math.ceil(y)
    });
  });

  ipc.on('exit', () => {
    mainWindow.close();
  });

  ipc.on('unmaximize', () => {
    mainWindow.unmaximize();
  });

  ipc.on('maximize', () => {
    mainWindow.maximize();
  });

  ipc.on('minimize', () => {
    mainWindow.minimize();
  });

  mainWindow.on('maximize', () => {
    mainWindow.webContents.executeJavaScript(
      `document.getElementById('gmailDesktopMaximize').setAttribute("ismax", 0);
      document.getElementById('gmailDesktopMaximize').setAttribute("src", "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/restore.png");`
    );
  });

  mainWindow.on("unmaximize", () => {
    mainWindow.webContents.executeJavaScript(
      `document.getElementById('gmailDesktopMaximize').setAttribute("ismax",1);
      document.getElementById('gmailDesktopMaximize').setAttribute("src", "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/maximize.png");`
    );
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  if (process.platform == "win32" && mainWindow !== null) {
    winBadge = new WinBadge(mainWindow, {});
  }

  ipc.on('unread', (evt, unreadCount) => {
    // Still update the badge regardless
    if (process.platform == "darwin" && mainWindow !== null) {
      app.dock.setBadge(unreadCount ? ('' + unreadCount) : '');
    } else if (process.platform == "win32" && mainWindow !== null) {
      winBadge.update(unreadCount);
    }
  });

  ipc.on('notification', (evt, sender, subject) => {
    if (shouldNotify() && Notification.isSupported()) {
      // Move the sound if it doesn't exist -- macOS only
      if (process.platform == "darwin") {
        const homedir = require('os').homedir();
        if (!fs.existsSync(homedir + "/Library/Sounds/gmail.caf")) {
          fs.copyFileSync(path.join(__dirname, "assets", "sounds", "mail-sent.caf"), homedir + "/Library/Sounds/gmail.caf");
        }
      }
      // Notify the user that there is new mail
      let notification = new Notification({
        title: process.platform == "win32" ? ("From: " + sender) : "New Mail",
        subtitle: process.platform == "win32" ? subject : "From: " + sender,
        body: subject,
        sound: "gmail"
      });
      notification.onclick = () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        if (!mainWindow.isVisible()) {
          mainWindow.show();
        }
        mainWindow.focus();
      };
      notification.show();
    }
  });

  ipc.on('print', () => {
    mainWindow.webContents.print({
      printBackground: true
    });
  });

  ipc.on("made_toolbar", () => {
    // Color logic for Windows
    if (process.platform == "win32") {
      updateColor(mainWindow, electron.systemPreferences.getAccentColor());

      electron.systemPreferences.on("accent-color-changed", (event, newColor) => {
        updateColor(mainWindow, newColor);
      });
    }
  });
}



function createMailto(url) {
  app.focus();
  mainWindow.focus();
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

  app.on('window-all-closed', () => {
    mainWindow.webContents.session.flushStorageData();
    mainWindow = null;
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on('before-quit', (event) => {
    mainWindow.webContents.session.flushStorageData();
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuForOS(app, process.platform)));
      createWindow();
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    if (app.isReady()) {
      createMailto(url);
    } else {
      app.on('ready', () => {
        createMailto(url);
      });
    }
  });

  app.on('ready', () => {
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

    Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuForOS(app, process.platform)));
    createWindow();
  });
}

init();