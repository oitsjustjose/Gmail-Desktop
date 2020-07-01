import { App, BrowserWindow, ipcMain, Menu, Notification, systemPreferences } from 'electron'
import WinBadge from 'electron-windows-badge'
import fs from 'fs'
import { homedir } from 'os'
import path from 'path'
import { updateColor } from '../utils/colors'
import { shouldNotify } from '../utils/utils'

let badge: any | null = null

export const init = (app: App, mw: BrowserWindow) => {
    ipcMain.on('menu', (_: any, x: number, y: number) => {
        Menu.getApplicationMenu()!.popup({
            x: Math.ceil(x),
            y: Math.ceil(y)
        })
    })

    ipcMain.on('exit', () => {
        mw.close()
    })

    ipcMain.on('unmaximize', () => {
        mw.unmaximize()
    })

    ipcMain.on('maximize', () => {
        mw.maximize()
    })

    ipcMain.on('minimize', () => {
        mw.minimize()
    })

    ipcMain.on('unread', (_: any, cnt: number) => {
        if (process.platform == 'darwin' && mw) {
            app.dock.setBadge(cnt ? `${cnt}` : ``)
        } else if (process.platform == 'win32' && mw) {
            if (!badge) {
                badge = new WinBadge(mw)
            }
            badge.update(cnt)
        }
    })

    ipcMain.on('made_toolbar', () => {
        if (process.platform == 'win32') {
            updateColor(mw, systemPreferences.getAccentColor())
        }
    })

    ipcMain.on('notification', (_: any, sender: string, subject: string) => {
        soundCheck()

        const notif = new Notification({
            title: process.platform == 'win32' ? `From: ${sender}` : 'New Mail',
            subtitle: process.platform == 'win32' ? subject : `From: ${sender}`,
            body: subject,
            sound: 'gmail'
        })

        notif.addListener('click', () => {
            if (mw.isMinimized()) {
                mw.restore()
            }
            if (!mw.isVisible()) {
                mw.show()
            }
            mw.focus()
        })

        notif.show()
    })
}

const soundCheck = () => {
    if (shouldNotify() && Notification.isSupported()) {
        if (process.platform == 'darwin') {
            if (!fs.existsSync(`${homedir()}/Library/Sounds/gmail.caf`)) {
                fs.copyFileSync(path.join(__dirname, 'assets', 'sounds', 'mail-sent.caf'), `${homedir()}/Library/Sounds/gmail.caf`)
            }
        }
    }
}