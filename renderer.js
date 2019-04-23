const { ipcRenderer } = require('electron');

ipcRenderer.on('back', () => {
    window.history.back();
});

ipcRenderer.on('forward', () => {
    window.history.forward();
});

ipcRenderer.on('home', () => {
    document.getElementById("webview").loadURL("https://mail.google.com");
});

ipcRenderer.on('changeURL', (event, url) => {
    document.getElementById("webview").loadURL(url);
});
