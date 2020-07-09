import { ipcRenderer as ipc, remote } from 'electron'

let lastUnread: number = 0
let unreadSubjects: Array<string> = Array()
let unreadSenders: Array<string> = Array()

const icns = {
    close: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/icons8-close-window-96.png',
    maximize: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/icons8-maximize-window-96.png',
    restore: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/icons8-restore-window-96.png',
    minimize: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/icons8-minimize-window-96.png',
    options: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/icons8-toggle-off-96.png'
}

const searchUnread = () => {
    const unreadEl = document.querySelector('.aio.UKr6le > .bsU')
    let unreadCnt

    if (unreadEl) {
        unreadCnt = parseInt(unreadEl.innerHTML)
    } else {
        unreadCnt = 0
    }

    if (unreadCnt != lastUnread) {
        ipc.send('unread', unreadCnt)
        if (unreadCnt > lastUnread) {
            fetchSubjects()
        }
    }

    lastUnread = unreadCnt
}

const fetchSubjects = () => {
    const unreadEls = document.querySelectorAll('zA zE')

    unreadEls.forEach((el) => {
        if (el.childNodes) {
            let sender = (el
                .childNodes[4]
                .childNodes[1]
                .childNodes[0]
                .childNodes[0] as Element
            ).innerHTML

            let subject = (el
                .childNodes[5]
                .childNodes[0]
                .childNodes[0]
                .childNodes[0]
                .childNodes[0]
                .childNodes[0]
                .childNodes[0] as Element
            ).innerHTML

            if (!subject) {
                subject = (el
                    .childNodes[5]
                    .childNodes[0]
                    .childNodes[0]
                    .childNodes[0]
                    .childNodes[0]
                    .childNodes[0] as Element
                ).innerHTML
            }

            if (!(unreadSubjects.includes(subject) && unreadSenders.includes(sender))) {
                ipc.send('notification', sender, subject)
                unreadSenders.push(sender)
                unreadSubjects.push(subject)
            }
        }
    })
}

const injectHeader = () => {
    const header = document.createElement('div')
    header.id = 'GmailDesktopTitlebar'

    const options = document.createElement('img')
    options.src = icns.options
    options.className = 'winButton options'
    options.addEventListener('click', (evt) => {
        remote.Menu.getApplicationMenu()!.popup({
            x: evt.clientX,
            y: evt.clientY
        })
    })

    const windowCtrlWrapper = document.createElement('div')
    windowCtrlWrapper.id = 'GmailDesktopWindowControlsWrapper'

    const windowCtrls = document.createElement('div')
    windowCtrls.id = "GmailDesktopWindowControls"

    const minimize = document.createElement('img')
    minimize.className = 'winButton'
    minimize.src = icns.minimize
    minimize.addEventListener('click', (_) => {
        if (remote.getCurrentWindow().minimizable) {
            remote.getCurrentWindow().minimize()
        }
    })

    const maximize = document.createElement('img')
    maximize.className = 'winButton'
    maximize.setAttribute('ismax', '1')
    maximize.src = icns.maximize
    maximize.addEventListener('click', (_) => {
        const currentAttr = maximize.getAttribute('ismax')
        if (currentAttr == '1') {
            remote.getCurrentWindow().maximize()
            maximize.src = icns.restore
        } else {
            remote.getCurrentWindow().unmaximize()
            maximize.src = icns.maximize
        }
        maximize.setAttribute('ismax', currentAttr == '1' ? '0' : '1')
    })

    const close = document.createElement('img')
    close.className = 'winButton close'
    close.src = icns.close
    close.addEventListener('click', (_) => {
        if (remote.getCurrentWindow().closable) {
            remote.getCurrentWindow().close()
        }
    })

    windowCtrls.appendChild(minimize)
    windowCtrls.appendChild(maximize)
    windowCtrls.appendChild(close)
    windowCtrlWrapper.appendChild(windowCtrls)
    header.appendChild(options)
    header.appendChild(windowCtrlWrapper)

    document.body.insertBefore(header, document.body.childNodes[0])

    ipc.send('made_toolbar')
}

window.addEventListener('load', () => {
    if (remote.process.platform != 'darwin') {
        injectHeader()
    }

    setInterval(searchUnread, 500)
})
