echo "Buildling Gmail for Windows"

electron-packager . "Gmail" --overwrite --asar=true --platform=win32 --arch=ia32 --icon=icon.ico --prune=true --out=release-builds --version-string.CompanyName=oitsjustjose --version-string.FileDescription="A simple Gmail electron wrapper" --version-string.ProductName="Gmail"

echo "Building Gmail for macOS"

electron-packager . --overwrite --platform=darwin --arch=x64 --icon=./icon.icns --prune=true --out=release-builds

echo "Building Gmail for Linux"

electron-packager . "Gmail" --overwrite --asar=true --platform=linux --arch=x64 --icon=./icon.png --prune=true --out=release-builds