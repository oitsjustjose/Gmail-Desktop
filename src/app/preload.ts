import { ipcRenderer as ipc, remote } from 'electron'

interface Message {
    sender: string,
    subject: string,
}

let lastUnread = 0
let previouslyRead: Array<Message> = Array()

const icns = {
    close: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/close.png',
    maximize: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/maximize.png',
    restore: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/restore.png',
    minimize: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/minimize.png',
    options: 'https://raw.githubusercontent.com/oitsjustjose/Gmail-Desktop/master/assets/menu/menu.png'
}

const searchUnread = () => {
    const unreadEl = document.querySelector('.aio.UKr6le .bsU')
    const unreadCnt = unreadEl ? parseInt((unreadEl as HTMLDivElement).innerText) : 0

    if (unreadCnt != lastUnread) {
        ipc.send('unread', unreadCnt)
        if (unreadCnt > lastUnread) {
            sendNotification()
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

const sendNotification = () => {
    const unreadEls = document.querySelectorAll("[draggable=true]") as NodeList

    unreadEls.forEach((el) => {
        if (el.childNodes) {
            const sender = (el as HTMLElement).querySelector('[email]')?.getAttribute('email')
            const subject = (el as HTMLElement).querySelector('[data-thread-id]')?.innerHTML

            if (sender && subject) {
                const msg: Message = {
                    subject: subject,
                    sender: sender
                }

                if (!previouslyRead.includes(msg)) {
                    ipc.send('notification', sender, subject)
                    previouslyRead.push(msg)
                }
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
