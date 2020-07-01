import { BrowserWindow } from 'electron'

const clamp = (val: number) => {
    return val > 255 ? 255 : val < 0 ? 0 : val
}

const getFgColor = (bgAsHex: string) => {
    const r = parseInt(bgAsHex.substr(0, 2), 16)
    const g = parseInt(bgAsHex.substr(2, 2), 16)
    const b = parseInt(bgAsHex.substr(4, 2), 16)
    const colorFactor = 128
    return "rgb(" + clamp(r + colorFactor) + "," + clamp(g + colorFactor) + "," + clamp(b + colorFactor) + ")"
}

export const updateColor = (mw: BrowserWindow, bgAsHex: string) => {
    const fg = getFgColor(bgAsHex)

    mw.webContents.executeJavaScript(
        `document.getElementById("GmailDesktopTitlebar").style.backgroundColor = "#${bgAsHex}";`
    )

    mw.webContents.executeJavaScript(
        `document.getElementById('GmailDesktopTitlebar).style.color="${fg}";`
    )

    mw.webContents.executeJavaScript(`
        document.getElementById("GmailDesktopWindowControls").style.stroke="${fg}";
        document.getElementById("GmailDesktopWindowControls").style.fill="${fg}";
        document.getElementById("GmailDesktopOptions").style.fill="${fg}";
    `)
}