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

window.addEventListener('load', () => {
    intvl = setInterval(findUnreads, 1000);
});