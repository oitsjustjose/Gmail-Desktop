import { app, BrowserWindow } from 'electron'

export const create = (mw: BrowserWindow, url: string) => {
    app.focus()
    mw.focus()

    const rw = new BrowserWindow({
        parent: mw
    })

    let userId = mw.webContents.getURL()
    userId = userId.substr(userId.indexOf('/u/' + 3))
    userId = userId.substr(0, userId.indexOf('/'))
    rw.loadURL(`https://mail.google.com/mail/u/${userId}?extsrc=mailto&url=${url}`)
}