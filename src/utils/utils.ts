import { App, BrowserWindow, KeyboardEvent, MenuItem, MenuItemConstructorOptions } from 'electron'
import Store from '../app/store'

const store = new Store({
    configName: 'user-preferences',
    defaults: {
        notifications: true,
        width: 800,
        height: 600,
        x: 0,
        y: 0
    }
})

export const getWindow = () => {
    return store.all()
}

export const setWindow = (x: number, y: number, width: number, height: number) => {
    store.set('x', x)
    store.set('y', y)
    store.set('width', width)
    store.set('height', height)
}

export const shouldNotify = () => {
    return store.get('notifications')
}

const menu = (app: App) => {
    const tmpl: Array<MenuItemConstructorOptions> = [{
        label: 'File',
        submenu: [
            {
                type: 'separator'
            }, {
                label: 'Show Notifications',
                type: 'checkbox',
                checked: store.get('notifications'),
                click: (menuItem: MenuItem, bw: BrowserWindow | undefined, evt: KeyboardEvent) => {
                    const newSetting = !store.get('notifications')
                    store.set('notifications', newSetting)
                    menuItem.checked = newSetting
                }
            }, {
                label: 'Make Default Mail App',
                type: 'checkbox',
                checked: app.isDefaultProtocolClient('mailto'),
                click: () => {
                    if (app.isDefaultProtocolClient('mailto')) {
                        app.removeAsDefaultProtocolClient('mailto')
                    } else {
                        app.setAsDefaultProtocolClient('mailto')
                    }
                }
            },
        ]
    }, {
        label: 'Edit',
        submenu: [{
            role: 'undo'
        }, {
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            role: 'cut'
        }, {
            role: 'copy'
        }, {
            role: 'paste'
        }, {
            role: 'pasteAndMatchStyle'
        }, {
            role: 'delete'
        }, {
            role: 'selectAll'
        }]
    }, {
        label: 'View',
        submenu: [{
            role: 'toggleDevTools'
        }, {
            type: 'separator'
        }, {
            role: 'resetZoom'
        }, {
            role: 'zoomIn'
        }, {
            role: 'zoomOut'
        }, {
            type: 'separator'
        }, {
            role: 'togglefullscreen'
        }]
    }, {
        label: 'Go',
        submenu: [{
            role: 'reload'
        }, {
            role: 'forceReload'
        }]
    }]

    return tmpl
}

const macOsMenu = (app: App) => {
    const tmpl: Array<MenuItemConstructorOptions> = [{
        label: 'Gmail Desktop',
        submenu: [{
            label: 'About Gmail Desktop',
            role: 'about'
        }, {
            type: 'separator'
        }, {
            label: 'Make Default Mail App',
            type: 'checkbox',
            checked: app.isDefaultProtocolClient('mailto'),
            click: () => {
                if (app.isDefaultProtocolClient('mailto')) {
                    app.removeAsDefaultProtocolClient('mailto')
                } else {
                    app.setAsDefaultProtocolClient('mailto')
                }
            }
        }, {
            label: 'Show Notifications',
            type: 'checkbox',
            checked: store.get('notifications'),
            click: (menuItem: MenuItem, bw: BrowserWindow | undefined, evt: KeyboardEvent) => {
                const newSetting = !store.get('notifications')
                store.set('notifications', newSetting)
                menuItem.checked = newSetting
            }
        }, {
            type: 'separator'
        }, {
            role: 'hide'
        }, {
            role: 'hideOthers'
        }, {
            role: 'unhide'
        }, {
            type: 'separator'
        }, {
            role: 'quit'
        }]
    }, {
        label: 'Edit',
        submenu: [{
            role: 'undo'
        }, {
            role: 'redo'
        }, {
            type: 'separator'
        }, {
            role: 'cut'
        }, {
            role: 'copy'
        }, {
            role: 'paste'
        }, {
            role: 'pasteAndMatchStyle'
        }, {
            role: 'delete'
        }, {
            role: 'selectAll'
        }]
    }, {
        label: 'View',
        submenu: [{
            role: 'toggleDevTools'
        }, {
            type: 'separator'
        }, {
            role: 'resetZoom'
        }, {
            role: 'zoomIn'
        }, {
            role: 'zoomOut'
        }, {
            type: 'separator'
        }, {
            role: 'togglefullscreen'
        }]
    }, {
        label: 'Go',
        submenu: [{
            role: 'reload'
        }, {
            role: 'forceReload'
        }]
    }, {
        label: 'Window',
        submenu: [{
            role: 'minimize'
        }, {
            role: 'close'
        }, {
            type: 'separator'
        }]
    }]

    return tmpl
}

export const getMenu = (app: App) => {
    return process.platform === 'darwin' ? macOsMenu(app) : menu(app)
}