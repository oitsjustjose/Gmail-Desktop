function clamp(val) {
    return val > 255 ? 255 : val < 0 ? 0 : val;
}

function getAccessoryColor(hexcolor) {
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    // var colorFactor = (yiq >= 128) ? -128 : 128;
    var colorFactor = 128;
    return "rgb(" + clamp(r + colorFactor) + "," + clamp(g + colorFactor) + "," + clamp(b + colorFactor) + ")";
}

function updateColor(mainWindow, color) {
    var accessoryColor = getAccessoryColor(color);

    mainWindow.webContents.executeJavaScript(
        "document.getElementById('GmailDesktopTitlebar').style.backgroundColor='#" + color + "';"
    );


    mainWindow.webContents.executeJavaScript(
        "document.getElementById('GmailDesktopTitlebar').style.color='" + accessoryColor + "';"
    );


    mainWindow.webContents.executeJavaScript(
        "document.getElementById('GmailDesktopWindowControls').style.stroke='" + accessoryColor + "';" +
        "document.getElementById('GmailDesktopWindowControls').style.fill='" + accessoryColor + "';" +
        "document.getElementById('gmailDesktopOptions').style.fill='" + accessoryColor + "';"
    );

}


module.exports = {
    "updateColor": updateColor
};