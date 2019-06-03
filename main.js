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

const getMenuForOS = require("./menus.js").getMenu;
const shouldNotify = require("./menus.js").shouldNotify;
const updateColor = require('./colors.js').updateColor;

let mainWindow;
let winBadge;


function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Gmail Desktop',
    width: 800,
    height: 600,
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

  mainWindow.on('page-title-updated', (evt) => {
    evt.preventDefault();

  });

  ipc.on('menu', function (evt, x, y) {
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

  if (process.platform == "win32") {
    winBadge = new WinBadge(mainWindow, {});
  }

  ipc.on('unread', (evt, unreadCount) => {
    // Still update the badge regardless
    if (process.platform == "darwin") {
      app.dock.setBadge(unreadCount ? ('' + unreadCount) : '');
    } else if (process.platform == "win32") {
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
        app.focus();
        mainWindow.focus();
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

  app.on('window-all-closed', function () {
    mainWindow.webContents.session.flushStorageData();
    mainWindow = null;
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on('activate', function () {
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


    if (process.platform == "darwin") {
      app.dock.bounce("critical");
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(getMenuForOS(app, process.platform)));
    createWindow();
  });
}

init();