function getContrastYIQ(hexcolor) {
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '000000' : 'FFFFFF';
}

function updateColor(mainWindow, color) {
    mainWindow.webContents.executeJavaScript(
        "document.getElementById('GmailDesktopTitlebar').style.backgroundColor='#" + color + "';"
    );


    mainWindow.webContents.executeJavaScript(
        "document.getElementById('GmailDesktopTitlebar').style.color='#" + getContrastYIQ(color) + "';"
    );

    var brightness = getContrastYIQ(color) == '000000' ? 0.0 : 1.0;

    mainWindow.webContents.executeJavaScript(
        "document.getElementById('GmailDesktopWindowControls').style.webkitFilter='invert(" + (brightness * 100) + "%)';" +
        "document.getElementById('GmailDesktopWindowControls').style.filter='invert(" + (brightness * 100) + "%)';" +
        "document.getElementById('gmailDesktopOptions').style.webkitFilter='invert(" + (brightness * 100) + "%)';" +
        "document.getElementById('gmailDesktopOptions').style.filter='invert(" + (brightness * 100) + "%)';"
    );

}


module.exports = {
    "updateColor": updateColor
};