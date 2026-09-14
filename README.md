# YouTube Shorts Auto-Scroll Chrome Extension

Automatically scroll through YouTube Shorts videos with customizable intervals.

## Features

✨ **Auto-Scroll**: Automatically advance to the next YouTube Short at your desired interval
⚙️ **Customizable Interval**: Set scroll intervals from 2 to 15 seconds
💾 **Persistent Settings**: Your preferences are saved and restored
🎨 **Beautiful UI**: Modern popup interface with gradient design
🚀 **Easy Toggle**: Enable/disable auto-scroll with a single click

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked" and select this extension folder
5. The extension will appear in your Chrome toolbar

## Usage

1. Navigate to any YouTube Shorts page (youtube.com/shorts/[id])
2. Click the extension icon in the Chrome toolbar
3. Toggle the "Enable Auto-Scroll" switch
4. Adjust the scroll interval as desired (2-15 seconds)
5. The extension will automatically scroll to the next Short at your set interval

## How It Works

- The extension injects a content script into YouTube Shorts pages
- It simulates arrow down key presses and smooth scrolling to navigate between shorts
- Settings are stored in Chrome's sync storage and persist across sessions
- Communication between the popup and content script uses Chrome's message passing API

## Technical Stack

- **Manifest V3**: Latest Chrome extension standards
- **Content Scripts**: Injects functionality into YouTube pages
- **Chrome Storage API**: Persistent configuration
- **Chrome Messaging API**: Communication between popup and content scripts

## Files

- `manifest.json` - Extension configuration and permissions
- `content.js` - Main auto-scroll logic (runs on YouTube pages)
- `popup.html` - Extension popup interface
- `popup.js` - Popup interaction logic
- `background.js` - Service worker for extension lifecycle management

## Settings

The extension stores the following settings:
- `autoScrollEnabled` - Boolean to enable/disable auto-scroll
- `scrollInterval` - Interval in seconds between scrolls (2-15)

## Troubleshooting

**Extension not working?**
- Make sure you're on a YouTube Shorts page (youtube.com/shorts/...)
- Try refreshing the page after enabling auto-scroll
- Check that the extension has permission for youtube.com in Chrome settings

**Settings not saving?**
- Ensure sync is enabled in your Chrome profile
- Try disabling and re-enabling the extension

## Future Enhancements

- [ ] Add pause/play on user interaction
- [ ] Add keyboard shortcuts
- [ ] Add statistics (videos watched, time spent)
- [ ] Add theme customization
- [ ] Add notification for auto-scroll status

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
