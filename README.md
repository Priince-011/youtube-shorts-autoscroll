# YouTube Shorts Auto-Scroll

A lightweight Chrome extension that automatically moves to the next YouTube Short when the current video finishes playing.

No manual scrolling. No timers. Just let Shorts play.

## ✨ Features

* **Automatic progression** — Automatically advances to the next Short when the current video ends.
* **Native video detection** — Uses the browser's `video` `ended` event instead of polling.
* **Dynamic page support** — Detects videos dynamically loaded by YouTube's SPA navigation.
* **Lightweight** — Uses event listeners and `MutationObserver` instead of continuous polling.
* **Persistent settings** — Your auto-scroll preference is saved using Chrome Storage.
* **One-click control** — Enable or disable auto-scroll directly from the extension popup.
* **Visibility-aware** — Pauses monitoring when the tab is hidden and resumes when it becomes visible.

## 🎬 How It Works

YouTube Shorts is a single-page application, so videos are dynamically replaced without a traditional page reload.

The extension handles this by:

1. Detecting video elements on the Shorts page.
2. Attaching a native `ended` event listener to the active video.
3. Detecting newly added video elements using `MutationObserver`.
4. When the video finishes, triggering navigation to the next Short.
5. Removing unnecessary listeners when the tab is hidden.
6. Resuming monitoring when the tab becomes visible again.

```text
YouTube Shorts
      │
      ▼
  Video Element
      │
      │  ended
      ▼
 Content Script
      │
      ▼
 Next Short
```

## 🖥️ Extension UI

The extension uses a minimal dark UI inspired by modern developer tools such as Linear and Raycast.

The popup provides a single control:

```text
┌─────────────────────────────────┐
│  ▶  Shorts Auto-Scroll      v1  │
│                                 │
│  ┌───────────────────────────┐  │
│  │  Auto-scroll          ◉── │  │
│  │  Automatically move to    │  │
│  │  the next Short when...   │  │
│  └───────────────────────────┘  │
│                                 │
│  ● Auto-scroll is active        │
│                                 │
│  YouTube Shorts    Active       │
└─────────────────────────────────┘
```

## 📦 Installation

### Option 1 — Clone the repository

```bash
git clone https://github.com/Priince-011/youtube-shorts-auto-scroll.git
cd youtube-shorts-auto-scroll
```

### Option 2 — Download the repository

Download the repository as a ZIP and extract it locally.

### Load the extension in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the extension directory.
5. Pin the extension to your Chrome toolbar if desired.

## 🚀 Usage

1. Open a YouTube Shorts page:

```text
https://www.youtube.com/shorts/<video-id>
```

2. Click the **Shorts Auto-Scroll** extension icon.
3. Enable **Auto-scroll**.
4. Play a Short.
5. When the video finishes, the extension automatically moves to the next Short.

To disable the functionality, simply toggle **Auto-scroll** off.

## 🧩 Architecture

The extension uses Chrome's Manifest V3 architecture.

```text
┌─────────────────────┐
│     popup.html      │
│                     │
│    Toggle UI        │
└──────────┬──────────┘
           │
           │ Chrome Messaging API
           ▼
┌─────────────────────┐
│      content.js     │
│                     │
│  Video detection    │
│  End event handling │
│  DOM monitoring     │
│  Navigation         │
└──────────┬──────────┘
           │
           ▼
      YouTube Shorts
```

### Components

| File            | Responsibility                          |
| --------------- | --------------------------------------- |
| `manifest.json` | Extension configuration and permissions |
| `content.js`    | Detects videos and handles auto-scroll  |
| `popup.html`    | Extension popup UI                      |
| `popup.js`      | Popup state and user interaction        |
| `background.js` | Service worker / extension lifecycle    |

## 🛠️ Technical Stack

* **Chrome Extension Manifest V3**
* **JavaScript**
* **Chrome Storage API**
* **Chrome Messaging API**
* **MutationObserver**
* **HTML/CSS**

The extension intentionally avoids external libraries and frameworks.

## 💾 Settings

The extension currently stores one setting:

| Setting             | Type    | Description                               |
| ------------------- | ------- | ----------------------------------------- |
| `autoScrollEnabled` | Boolean | Enables or disables automatic progression |

The setting is stored using:

```javascript
chrome.storage.sync
```

This allows the preference to persist across browser sessions and, where Chrome Sync is available, across synced Chrome profiles.

## ⌨️ YouTube Keyboard Controls

The extension does not override YouTube's normal keyboard controls.

While watching Shorts, YouTube's native controls remain available:

| Key           | Action         |
| ------------- | -------------- |
| `Space` / `K` | Play / pause   |
| `J`           | Rewind         |
| `L`           | Forward        |
| `Arrow Down`  | Next Short     |
| `Arrow Up`    | Previous Short |

## 🔧 Troubleshooting

### Auto-scroll isn't working

Make sure:

* You are on a YouTube Shorts page.
* The extension is enabled.
* The page was refreshed after installing the extension.
* Chrome has permission to run the extension on YouTube.

You can inspect the page console using Chrome DevTools:

```text
Right click → Inspect → Console
```

### The extension doesn't detect the video

YouTube frequently changes its internal DOM structure.

Check that:

* A `<video>` element exists on the page.
* The video is playing normally.
* There are no errors in the browser console.

### Settings aren't being saved

Make sure Chrome Sync/storage is functioning correctly.

You can also try:

1. Disable the extension.
2. Reload `chrome://extensions/`.
3. Enable the extension again.
4. Reload YouTube.

## ⚡ Performance

The extension is designed to remain lightweight.

### Event-driven video detection

Rather than repeatedly checking the video playback position, the extension listens for the native:

```javascript
video.addEventListener('ended', ...)
```

event.

### Efficient DOM monitoring

`MutationObserver` is used to detect dynamically inserted video elements instead of continuously polling the DOM.

### Tab visibility handling

Video monitoring is paused when the browser tab is hidden and resumed when the user returns.

## 🗺️ Roadmap

Potential future improvements:

* [ ] Configurable delay before moving to the next Short
* [ ] Pause auto-scroll after manual interaction
* [ ] Optional keyboard shortcut to toggle the extension
* [ ] Watch statistics
* [ ] Channel whitelist / blacklist
* [ ] Configurable behavior after video completion
* [ ] Chrome Web Store release

## ⚠️ Known Limitations

* Currently works only with YouTube Shorts.
* Behavior may change if YouTube changes its video/navigation implementation.
* Auto-scroll relies on the video reaching its natural end.
* The extension is not affiliated with or endorsed by YouTube.

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome.

If you find an issue:

1. Check the existing issues.
2. Open a new issue with reproduction steps.
3. Include relevant console errors where possible.

## 📄 License

MIT License

## ⚠️ Disclaimer

This is an unofficial third-party Chrome extension.

YouTube is a trademark of Google LLC. This project is not affiliated with, sponsored by, or endorsed by YouTube or Google.
