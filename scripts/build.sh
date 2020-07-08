echo "Cleaning"

rm -rf ./dist

echo "Compiling TypeScript"

tsc

echo "Building for Windows"

electron-builder . --win

echo "Building for macOS"

electron-builder .

echo "Building for Linux"

electron-builder . --linux

electron-builder . --linux snap

# snapcraft push --release=stable dist/Gmail-Desktop_*.snap

echo "Done!"