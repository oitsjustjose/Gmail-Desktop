import { ipcRenderer as ipc, remote, BrowserWindowProxy } from 'electron'

let lastUnread: number = 0
let unreadSubjects: Array<string> = Array()
let unreadSenders: Array<string> = Array()

const icns = {
    close: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/close.png',
    maximize: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/maximize.png',
    restore: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/restore.png',
    minimize: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/minimize.png',
    options: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/menu.png'
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

const initMaximizeHandlers = () => {
    remote.getCurrentWindow().on('maximize', () => {
        const maximize = document.querySelector('.maximize.winButton') as HTMLImageElement
        if (!maximize) {
            return
        }
        maximize.src = icns.restore
    })

    remote.getCurrentWindow().on('unmaximize', () => {
        const maximize = document.querySelector('.maximize.winButton') as HTMLImageElement
        if (!maximize) {
            return
        }
        maximize.src = icns.maximize
    })
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
    const header = document.createElement('header')
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
    maximize.className = 'maximize winButton'
    maximize.src = icns.maximize
    maximize.addEventListener('click', (_) => {
        if (remote.getCurrentWindow().isMaximized()) {
            remote.getCurrentWindow().unmaximize()
        } else {
            remote.getCurrentWindow().maximize()
        }
    })

    const close = document.createElement('img')
    close.className = 'winButton close'
    close.src = icns.close
    close.addEventListener('click', (_) => {
        if (remote.getCurrentWindow().isClosable()) {
            remote.getCurrentWindow().close()
        }
    })

    windowCtrls.appendChild(minimize)
    windowCtrls.appendChild(maximize)
    windowCtrls.appendChild(close)
    windowCtrlWrapper.appendChild(windowCtrls)
    header.appendChild(options)
    header.appendChild(windowCtrlWrapper)

    /* As weird as it is, the menubar works best *adjacent* to the <body> tag... */
    document.body.insertAdjacentElement("beforebegin", header)
    document.body.classList.add('withWinTitlebar')

    ipc.send('made_toolbar')
}


window.addEventListener('load', () => {
    if (remote.process.platform != 'darwin') {
        injectHeader()
        initMaximizeHandlers()
    }

    setInterval(searchUnread, 500)
})
