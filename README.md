# YouTube Shorts Auto-Scroll Chrome Extension

Automatically advance to the next YouTube Shorts video when the current one ends.

## Features

✨ **Smart Auto-Scroll**: Automatically advances to the next YouTube Short when the current video finishes playing

🎬 **Video-End Detection**: Uses YouTube's native video end events for accurate detection

📡 **Dynamic Monitoring**: Detects new videos as they're loaded into the page

⚡ **Lightweight**: Minimal resource usage, detaches listeners when tab is hidden

🎨 **Simple UI**: One-click toggle to enable/disable auto-scroll

💾 **Persistent Settings**: Your preferences are saved and restored

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select this extension folder
5. The extension will appear in your Chrome toolbar

## Usage

1. Navigate to YouTube Shorts (youtube.com/shorts/[id])
2. Click the extension icon in the Chrome toolbar
3. Toggle the "Enable Auto-Scroll" switch
4. Watch a Short - when it finishes, the extension automatically scrolls to the next one!
5. Click the toggle again to disable

## How It Works

The extension:
- Injects a content script into YouTube Shorts pages
- Listens for the `ended` event on video elements
- When a video finishes, it simulates an arrow down key press and smooth scroll
- Automatically detects and monitors newly loaded videos
- Pauses listeners when the tab is hidden to conserve resources
- Resumes when you switch back to the tab

## Technical Stack

- **Manifest V3**: Latest Chrome extension standards
- **Content Scripts**: Injects functionality into YouTube pages
- **Chrome Storage API**: Persistent configuration
- **Chrome Messaging API**: Communication between popup and content scripts
- **MutationObserver**: Detects dynamically loaded video elements

## Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main auto-scroll logic (runs on YouTube pages)
  - Handles video end detection
  - Manages scroll functionality
  - Monitors for new videos
- `popup.html` - Extension popup interface
- `popup.js` - Popup interaction logic
- `background.js` - Service worker for extension lifecycle management

## Settings

The extension stores the following settings:
- `autoScrollEnabled` - Boolean to enable/disable auto-scroll (synced across devices)

## How to Disable

Simply click the extension icon and toggle off the "Enable Auto-Scroll" switch. The extension will stop listening for video end events.

## Keyboard Shortcuts

While auto-scroll is active, you can still:
- Press **Space** or **K** to pause/play the current video
- Press **J** to rewind 10 seconds
- Press **L** to forward 10 seconds
- Press **Arrow Down** manually to skip to next Short
- Press **Arrow Up** to go back to previous Short

## Troubleshooting

**Extension not working?**
- Make sure you're on a YouTube Shorts page (youtube.com/shorts/...)
- Try refreshing the page after enabling auto-scroll
- Check that the extension has permission for youtube.com in Chrome settings
- Open DevTools (F12) and check the console for error messages

**Settings not saving?**
- Ensure sync is enabled in your Chrome profile
- Try disabling and re-enabling the extension
- Clear Chrome's cache and reload the extension

**Video not detected?**
- Make sure the video element is playing correctly
- YouTube Shorts videos should end naturally (not skip to end)
- Check console logs: `Video ended, scrolling to next short...`

## Future Enhancements

- [ ] Add pause/play on user interaction
- [ ] Add keyboard shortcuts (e.g., Ctrl+Shift+S to toggle)
- [ ] Add statistics (videos watched, time spent)
- [ ] Add theme customization (dark/light mode)
- [ ] Add notification for auto-scroll status
- [ ] Add whitelist/blacklist for specific channels
- [ ] Add delay customization before scrolling to next video

## Known Limitations

- Only works on YouTube Shorts pages
- Requires videos to end naturally (not manually skipped to end)
- May not work if YouTube changes their video structure

## Performance

- **Minimal CPU usage**: Only listens for video end events
- **Low memory footprint**: Detaches listeners when not needed
- **Efficient DOM monitoring**: Uses optimized MutationObserver

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

## Disclaimer

This is an unofficial Chrome extension. YouTube is a trademark of Google LLC. Use at your own discretion and in accordance with YouTube's Terms of Service.
