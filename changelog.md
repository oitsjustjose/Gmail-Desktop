# Changelog

## 2.0.1

### Fixed

- Titlebar issues on Windows

### Changed

- New Titlebar icons!
- Custom titlebar now works (though the color may not) on Linux


## 2.0.0

### Changed

- Re-wrote app using TypeScript for improved stability and overall improvements
- Moved to Docker for build process (because macOS Catalina killed Wine ☹️)
- Updated to Electron 9
- Windows Title bar should now be faster on click

-----

## 1.5.1

### Added

- **[Windows]** Better, more windows-like window controls with better color adaptation

### Fixed

- CSS, again :|

## 1.5.0

### Added

- Gmail-Desktop will now remember its window size and location between restarts

### Changes

- **[macOS]** Closing the last window of Gmail-Desktop will no longer quit the app
- The frequency at which local caches are flushed has been reduced to only when definitely needed
- Loading custom CSS for webpages is only done once, not twice, when navigating to another Gmail page

### Fixed

- **[macOS]** Clicking on a New Mail notification will properly show the window, whether it's Hidden, Covered, or Minimized
- **[macOS]** *Hopefully* fixed issue with the app not responding to clicks and requiring a force-quit every once in a while. Not sure what the root issue is though...
- Fixed the User Icon for university members again (hopefully soon I'll have a method to grab the CSS from some remote source so I can update it without requiring an app update)

## 1.4.10

### Changes

- App will now `Quit` on macOS when window is closed, as this is now common behavior in native macOS apps (i.e. System Prefs, Messages)

## 1.4.8.1

### Changes

- More aria-label-based CSS injection for the search box

## 1.4.8

### Added

- Revamped titlebar in Windows by doing everything myself from scratch. The color (in windows) is dependent upon the user's accent color and updates as you change it.

### Fixed

- Windows will now proper notifications and notification bubbles in the taskbar
- Prevent window title from changing (fixes bug with double-pinning in Windows)

## 1.4.7

### Added

- Allow the menubar to autohide (and make that a setting)

## 1.4.6

### Fixed

- Fixed Gmail CSS again -- using more attribute selectors now, hopefully fixing the top bar, gmail logo and apps popout on the right.

## 1.4.5

### Fixed

- Fixed Gmail CSS again -- using attribute selectors where possible now, so hopefully it'll stop breaking >_>
- Renamed to Gmail-Electron to prevent any confusion that this is an actual Google product.
  - Unfortunately this means you'll have to log back into the app again

## 1.4.0

### Added

- Right-click menu
- Mail-To protocol; opening an email will open it with the app (the 'from' address will be from the last-focused window)
- Cleaner starting animations
- Ability to move itself to the apps folder automatically on macOS
- Opening a new window will now open the next account available if applicable
- Notification sound (if enabled)

### Changed

- Aesthetic to be more pleasing (hid elements, made top-bar smaller)

### Removed

- Navigation options (Home, Back, Forward)
- Multi-window functionality; this made many things harder

### Fixed
- Notifications (if enabled); these show the email info and everything!
