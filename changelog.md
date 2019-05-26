# Changelog

## 1.4.6: 
- Fixed Gmail CSS again -- using more attribute selectors now, hopefully fixing the top bar, gmail logo and apps popout on the right.

## 1.4.5:

- Fixed Gmail CSS again -- using attribute selectors where possible now, so hopefully it'll stop breaking >_>
- Renamed to Gmail-Electron to prevent any confusion that this is an actual Google product.
  - Unfortunately this means you'll have to log back into the app again

## 1.4.0:

- Added right-click menu
- Added mailto protocol; opening an email will open it with the app (the 'from' address will be from the last-focused window)
- Changed aesthetic to be more pleasing (hid elements, made top-bar smaller)
- Added cleaner starting animations
- Added the ability to move itself to the apps folder automatically on macOS
- Removed navigation options (Home, Back, Forward)
- Added: Opening a new window will now open the next account available if applicable
- Fixed: notifications (if enabled); these show the email info and everything!
- Added: notification sound (if enabled)
- Removed: Multi-window functionality; this made many things harder
