# Gmail for Electron

![icon](https://github.com/oitsjustjose/Gmail-Electron/blob/master/icon.png)

Gmail for Electron is an electron-built BrowserWindow-based mail application, allowing users to create multiple windows, print, zoom and navigate through their mail account(s) with ease. **There isn't any official notification support** - you can technically enable Gmail's built-in browser notifications which will send notifications to your OS< but **clicking these *may* cause application instability**.

![screenshot](https://github.com/oitsjustjose/Gmail-Electron/blob/master/screenshot.png)

Releases found [here](https://github.com/oitsjustjose/Gmail-Electron/releases)

## Building (For release):

You'll need electron packager. Get it using:

`npm install electron-packager -g`

Once done, run any or all of the following:

**Windows**: `electron-packager . "Gmail" --overwrite --asar=true --platform=win32 --arch=ia32 --icon=assets/icons/win/gmail.ico --prune=true --out=release-builds --version-string.CompanyName=oitsjustjose --version-string.FileDescription="A simple Gmail electron wrapper" --version-string.ProductName="Gmail"`

**macOS**: `electron-packager . --overwrite --platform=darwin --arch=x64 --icon=./assets/icons/macOS/gmail.icns --prune=true --out=release-builds`

**Linux**: `electron-packager . "Gmail" --overwrite --asar=true --platform=linux --arch=x64 --icon=assets/icons/png/gmail.png --prune=true --out=release-builds`

## TODO:

- Add System-level notifications