# Gmail for Electron

This repo includes the sample code for creating a desktop-version of a web application (Gmail, in this case).

(Releases coming to the Releases page *soon*)

## Building (For release):

You'll need electron packager. Get it using:

`npm install electron-packager -g`

Once done, run any or all of the following:

**Windows**: `electron-packager . "Gmail" --overwrite --asar=true --platform=win32 --arch=ia32 --icon=icon.ico --prune=true --out=release-builds --version-string.CompanyName=oitsjustjose --version-string.FileDescription="A simple Gmail electron wrapper" --version-string.ProductName="Gmail"`

**macOS**: `electron-packager . --overwrite --platform=darwin --arch=x64 --icon=./icon.icns --prune=true --out=release-builds`

**Linux**: `electron-packager . "Gmail" --overwrite --asar=true --platform=linux --arch=x64 --icon=./icon.png --prune=true --out=release-builds`

## TODO:

- Add System-level notifications
- Fix minor multi-account issues