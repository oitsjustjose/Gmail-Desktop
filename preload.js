exports.__esModule = true;
var electron = require("electron");

var lastUnread;

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

            //  TODO: pick first *unread* not just first el of table
            var table = document.querySelector(".F.cf.zt");
            var row = table.lastChild;

            var sender = row.firstChild.childNodes[4];
            sender = sender.childNodes[1];
            sender = sender.childNodes[0];
            sender = sender.childNodes[0].innerHTML;

            var subject = row.firstChild.childNodes[5];
            subject = subject.childNodes[0];
            subject = subject.childNodes[0];
            subject = subject.childNodes[0];
            subject = subject.childNodes[0];
            subject = subject.childNodes[0].innerHTML;

            electron.ipcRenderer.send('notification', sender, subject);
        }
        // Be sure to update this *after* we've sent the notification, not before
        lastUnread = unreadCount;
    }
}

window.addEventListener('load', () => {
    intvl = setInterval(findUnreads, 1000);
});