import { app, BrowserWindow, Menu } from 'electron'
import contextMenu from 'electron-context-menu'
import MakeWindow from './app/mw'
import * as mailto from './utils/mailto'
import { getMenu } from './utils/utils'

let window: BrowserWindow | null;

const initEvts = () => {
    app.on('window-all-closed', () => {
        window?.webContents.session.flushStorageData()
        window = null

        if (process.platform != 'darwin') {
            app.quit()
        }
    })

    app.on('before-quit', (_) => {
        window?.webContents.session.flushStorageData()
    })

    app.on('activate', () => {
        if (!window) {
            Menu.setApplicationMenu(Menu.buildFromTemplate(getMenu(app)))
            window = MakeWindow()
        }
    })

    app.on('open-url', (evt, url) => {
        evt.preventDefault()

        if (app.isReady() && window) {
            mailto.create(window, url)
        } else {
            app.on('ready', () => {
                if (window) {
                    mailto.create(window, url)
                }
            })
        }
    })

    app.on('ready', () => {
        if (app.isPackaged) {
            contextMenu()
        } else {
            contextMenu({
                showInspectElement: true
            })
        }

        Menu.setApplicationMenu(Menu.buildFromTemplate(getMenu(app)))
        window = MakeWindow()
    })
}

initEvts()