exports.__esModule = true;
var electron = require("electron");

var lastUnread = 0;
var unreadSubjects = [];
var unreadSenders = [];

function findUnreads() {
    var unreadElement = document.querySelector(".aio.UKr6le > .bsU");
    var unreadCount;

    // If there aren't any matching elements, assume *0*
    if (unreadElement == null) {
        unreadCount = 0;
    } else {
        unreadCount = parseInt(unreadElement.innerHTML);
    }

    // If the newVal==oldVal then don't bother updating
    if (unreadCount !== lastUnread) {
        electron.ipcRenderer.send("unread", unreadCount);

        // Only send a notification if we get a NEW email
        if (unreadCount > lastUnread) {
            /*********************************************************************************************\ 
             | This part is for the actual getting of the new message contents to send into a notification |
             |                      We only do this if there's an actual new inbox item                    |
             \*********************************************************************************************/
            var unreads = document.getElementsByClassName("zA zE");
            for (var i in unreads) {
                if (unreads[i].childNodes !== undefined) {
                    var sender = unreads[i].childNodes[4].childNodes[1].childNodes[0].childNodes[0].innerHTML;
                    // Sometimes there's an extra child node..
                    var subject = unreads[i].childNodes[5].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML;
                    if (subject === undefined) {
                        subject = unreads[i].childNodes[5].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML;
                    }
                    if (unreadSubjects.includes(subject) && unreadSenders.includes(sender)) {
                        continue;
                    } else {
                        electron.ipcRenderer.send('notification', sender, subject);
                        unreadSenders.push(sender);
                        unreadSubjects.push(subject);
                    }
                }
            }
        }
        // Be sure to update this *after* we've sent the notification, not before
        lastUnread = unreadCount;
    }
}

function bootstrapHeader() {
    const icons = {
        "menu": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/ba4108612c67246507964827ee3462a6d5529835/assets/more-options.png",
        "close": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/82880b645524c08e3c2fefadcad2d8e44fa67a28/assets/close.png",
        "maximize": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/82880b645524c08e3c2fefadcad2d8e44fa67a28/assets/maximize.png",
        "restore": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/82880b645524c08e3c2fefadcad2d8e44fa67a28/assets/restore.png",
        "minimize": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/82880b645524c08e3c2fefadcad2d8e44fa67a28/assets/minimize.png",
        "app": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/82880b645524c08e3c2fefadcad2d8e44fa67a28/assets/icons/png/gmail.png"
    };

    var header = document.createElement("div");
    header.id = "GmailDesktopTitlebar";
    header.innerHTML = "<img src='" + icons.menu + "' id='gmailDesktopOptions'>";
    header.innerHTML += "<b><p id='GoogleDesktopTitlebarText'><img src='" + icons.app + "'  id='GoogleDesktopTitlebarLogo'>Gmail Desktop</p></b>";

    var windowControls = document.createElement("div");
    windowControls.id = "GmailDesktopWindowControls";
    windowControls.innerHTML += "<img src='" + icons.minimize + "' id='gmailDesktopMinimize'>";
    windowControls.innerHTML += "<img src='" + icons.maximize + "' id='gmailDesktopMaximize' ismax=1>";
    windowControls.innerHTML += "<img src='" + icons.close + "' id='gmailDesktopClose'>";

    header.appendChild(windowControls);

    document.getElementsByTagName("body")[0].insertBefore(header, document.getElementsByTagName("body")[0].childNodes[0]);

    document.getElementById('gmailDesktopOptions').addEventListener('click', (event) => {
        electron.ipcRenderer.send("menu", event.clientX, event.clientY);
    });

    document.getElementById('gmailDesktopClose').addEventListener('click', () => {
        electron.ipcRenderer.send("exit");
    });

    document.getElementById('gmailDesktopMaximize').addEventListener('click', () => {
        if (document.getElementById('gmailDesktopMaximize').getAttribute("ismax") == 1) {
            electron.ipcRenderer.send("maximize");
        } else {
            electron.ipcRenderer.send("unmaximize");
        }
    });

    document.getElementById('gmailDesktopMinimize').addEventListener('click', () => {
        electron.ipcRenderer.send("minimize");
    });

    electron.ipcRenderer.send("made_toolbar");
}

window.addEventListener('load', () => {
    // If specifically Windows:
    if (['win32', 'win64', 'Windows', 'WinCE'].includes(navigator.platform.toLowerCase())) {
        bootstrapHeader();
    }
    intvl = setInterval(findUnreads, 1000);

});