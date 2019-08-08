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
        "app": "https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/icons/png/gmail.png"
    };

    var header = document.createElement("div");
    header.id = "GmailDesktopTitlebar";
    header.innerHTML = `<svg id="gmailDesktopOptions" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="50%" height="50%" viewBox="0, 0, 400,400"><g id="svgg"><path id="path0" d="M34.862 156.291 C 6.716 161.010,-8.696 193.965,4.567 221.070 C 21.791 256.275,77.279 249.925,86.280 211.719 C 94.089 178.578,68.225 150.698,34.862 156.291 M187.500 156.629 C 182.335 157.660,175.000 160.738,175.000 161.874 C 175.000 162.218,174.465 162.500,173.812 162.500 C 171.610 162.500,160.488 174.328,157.969 179.348 C 149.136 196.953,152.523 217.673,166.485 231.445 C 169.861 234.775,173.158 237.500,173.812 237.500 C 174.465 237.500,175.000 237.806,175.000 238.179 C 175.000 239.547,184.556 242.950,191.024 243.885 C 200.688 245.283,215.843 242.584,219.727 238.774 C 220.264 238.247,222.285 236.724,224.219 235.389 C 230.054 231.360,233.503 227.261,236.903 220.313 C 237.429 219.238,238.168 218.139,238.545 217.871 C 242.709 214.904,242.709 185.096,238.545 182.129 C 238.168 181.861,237.429 180.762,236.903 179.688 C 233.498 172.728,230.037 168.619,224.219 164.625 C 222.285 163.298,220.515 161.939,220.285 161.605 C 217.271 157.228,198.658 154.402,187.500 156.629 M346.342 156.643 C 341.477 157.700,335.284 160.109,333.425 161.667 C 332.873 162.129,330.401 164.040,327.931 165.912 C 307.163 181.658,307.163 218.302,327.931 234.099 C 330.401 235.978,333.112 238.042,333.956 238.685 C 351.257 251.892,385.098 242.195,395.433 221.070 C 412.461 186.268,383.700 148.522,346.342 156.643 " stroke="none" fill-rule="evenodd"></path></g></svg>`;

    var windowControlsWrapper = document.createElement("div");
    windowControlsWrapper.id = "GmailDesktopWindowControlsWrapper";
    var windowControls = document.createElement("div");
    windowControls.id = "GmailDesktopWindowControls";
    windowControls.innerHTML += `<div id="gmailDesktopMinimize" class="winButton"><svg name="TitleBarMinimize" aria-hidden="false" width="50%" height="50%" viewBox="0 0 12 12"><rect  width="10" height="1" x="1" y="6"> </rect></svg></div>`;
    windowControls.innerHTML += `<div id="gmailDesktopMaximize" ismax=1 class="winButton" style="fill: none !important;"> <svg name="TitleBarMaximize" aria-hidden="false" width="50%" height="50%" viewBox="0 0 12 12"><rect width="9" height="9" x="1.5" y="1.5"></rect></svg></div>`;
    windowControls.innerHTML += `<div id="gmailDesktopClose" class="winButton close"><svg name="TitleBarClose" aria-hidden="false" width="50%" height="50%" viewBox="0 0 12 12"><polygon  points="11 1.576 6.583 6 11 10.424 10.424 11 6 6.583 1.576 11 1 10.424 5.417 6 1 1.576 1.576 1 6 5.417 10.424 1"></polygon></svg></div>`;
    windowControlsWrapper.appendChild(windowControls);
    header.appendChild(windowControlsWrapper);

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