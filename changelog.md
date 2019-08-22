# Changelog

## 1.5.1

Added:

- **[Windows]** Better, more windows-like window controls with better color adaptation

Fixed: 

- CSS, again :|

## 1.5.0

Added:

- Gmail-Desktop will now remember its window size and location between restarts

Changes:

- **[macOS]** Closing the last window of Gmail-Desktop will no longer quit the app
- The frequency at which local caches are flushed has been reduced to only when definitely needed
- Loading custom CSS for webpages is only done once, not twice, when navigating to another Gmail page

Fixes:

- **[macOS]** Clicking on a New Mail notification will properly show the window, whether it's Hidden, Covered, or Minimized
- **[macOS]** *Hopefully* fixed issue with the app not responding to clicks and requiring a force-quit every once in a while. Not sure what the root issue is though...
- Fixed the User Icon for university members again (hopefully soon I'll have a method to grab the CSS from some remote source so I can update it without requiring an app update)

## 1.4.10

- App will now `Quit` on macOS when window is closed, as this is now common behavior in native macOS apps (i.e. System Prefs, Messages)

## 1.4.8.1

- More aria-label-based CSS injection for the search box

## 1.4.8

- Windows will now proper notifications and notification bubbles in the taskbar
- Prevent window title from changing (fixes bug with double-pinning in Windows)
- Revamped titlebar in Windows by doing everything myself from scratch. The color (in windows) is dependent upon the user's accent color and updates as you change it.

## 1.4.7

- Allow the menubar to autohide (and make that a setting)

## 1.4.6

- Fixed Gmail CSS again -- using more attribute selectors now, hopefully fixing the top bar, gmail logo and apps popout on the right.

## 1.4.5

- Fixed Gmail CSS again -- using attribute selectors where possible now, so hopefully it'll stop breaking >_>
- Renamed to Gmail-Electron to prevent any confusion that this is an actual Google product.
  - Unfortunately this means you'll have to log back into the app again

## 1.4.0

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
