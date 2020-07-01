import { BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

export const inject = (mw: BrowserWindow) => {
    const platform = process.platform == 'darwin' ? 'macos' : null
    mw.webContents.insertCSS(
        fs.readFileSync(
            path.join(__dirname, '..', 'assets', 'css', 'style.css'), 'utf8'
        )
    )

    if (platform) {
        mw.webContents.insertCSS(
            fs.readFileSync(
                path.join(__dirname, '..', 'assets', 'css', `style.${platform}.css`), 'utf8'
            )
        )
    }
}