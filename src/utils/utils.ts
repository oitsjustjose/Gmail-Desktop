import { App, MenuItemConstructorOptions } from 'electron'
import Store from '../app/store'

let doNotifs = false

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
    return doNotifs
}

const menu = (app: App) => {
    doNotifs = store.get('notifications')

    const tmpl: Array<MenuItemConstructorOptions> = [{
        label: 'File',
        submenu: [
            {
                type: 'separator'
            }, {
                label: 'Show Notifications',
                type: 'checkbox',
                checked: doNotifs,
                click: () => {
                    doNotifs = !doNotifs
                    store.set('notifications', doNotifs)
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
            role: 'pasteandmatchstyle'
        }, {
            role: 'delete'
        }, {
            role: 'selectall'
        }]
    }, {
        label: 'View',
        submenu: [{
            role: 'toggledevtools'
        }, {
            type: 'separator'
        }, {
            role: 'resetzoom'
        }, {
            role: 'zoomin'
        }, {
            role: 'zoomout'
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
            role: 'forcereload'
        }]
    }]

    return tmpl
}

const macOsMenu = (app: App) => {
    doNotifs = store.get('notifications')

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
            checked: doNotifs,
            click: () => {
                doNotifs = !doNotifs
                store.set('notifications', doNotifs)
            }
        }, {
            type: 'separator'
        }, {
            role: 'hide'
        }, {
            role: 'hideothers'
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
            role: 'pasteandmatchstyle'
        }, {
            role: 'delete'
        }, {
            role: 'selectall'
        }]
    }, {
        label: 'View',
        submenu: [{
            role: 'toggledevtools'
        }, {
            type: 'separator'
        }, {
            role: 'resetzoom'
        }, {
            role: 'zoomin'
        }, {
            role: 'zoomout'
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
            role: 'forcereload'
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