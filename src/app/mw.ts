import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import * as CSS from '../app/css'
import * as IPC from '../app/ipc'
import * as Utils from '../utils/utils'


let mw: BrowserWindow | null

export default () => {
    const winProps = Utils.getWindow()

    mw = new BrowserWindow({
        title: 'Gmail Desktop',
        width: winProps.width,
        height: winProps.height,
        x: winProps.x,
        y: winProps.y,
        frame: false,
        titleBarStyle: 'hidden',
        transparent: true,
        icon: path.resolve(`${path.dirname(require.main!.filename)}/../assets/icons/png/gmail.png`),
        show: process.platform != 'darwin',
        webPreferences: {
            nodeIntegration: false,
            nativeWindowOpen: true,
            preload: path.join(__dirname, 'preload')
        }
    })

    mw.loadURL('https://mail.google.com')

    mw.webContents.on('dom-ready', () => {
        if (mw) {
            CSS.inject(mw)
        }
    })

    mw.webContents.on('new-window', (evt, url) => {
        evt.preventDefault()
        if (url.indexOf('mail.google.com') >= 0) {
            mw?.loadURL(url)
        } else {
            shell.openExternal(url)
        }
    })

    mw.on('move', () => {
        const { x, y, width, height } = mw!.getBounds()
        Utils.setWindow(x, y, width, height)
    })

    mw.on('resize', () => {
        const { x, y, width, height } = mw!.getBounds()
        Utils.setWindow(x, y, width, height)
    })

    mw.once('ready-to-show', () => {
        mw?.show()
        mw?.focus()
    })

    IPC.init(app, mw)

    return mw
}
