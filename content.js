// YouTube Shorts Auto-Scroll Extension

let isAutoScrollEnabled = false;
let scrollInterval = 5000; // 5 seconds between scrolls
let scrollTimer = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggle') {
    isAutoScrollEnabled = request.enabled;
    if (isAutoScrollEnabled) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    sendResponse({ status: isAutoScrollEnabled ? 'enabled' : 'disabled' });
  } else if (request.action === 'setInterval') {
    scrollInterval = request.interval * 1000;
    if (isAutoScrollEnabled) {
      stopAutoScroll();
      startAutoScroll();
    }
    sendResponse({ status: 'interval updated' });
  }
});

function startAutoScroll() {
  if (scrollTimer !== null) return; // Already running

  scrollTimer = setInterval(() => {
    scrollToNextShort();
  }, scrollInterval);

  console.log('YouTube Shorts Auto-Scroll: Started');
}

function stopAutoScroll() {
  if (scrollTimer !== null) {
    clearInterval(scrollTimer);
    scrollTimer = null;
  }
  console.log('YouTube Shorts Auto-Scroll: Stopped');
}

function scrollToNextShort() {
  // Method 1: Simulate arrow down key press
  const arrowDownEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(arrowDownEvent);

  // Method 2: Scroll down the page
  window.scrollBy({
    top: window.innerHeight,
    behavior: 'smooth'
  });

  console.log('Scrolling to next short...');
}

// Load saved settings on page load
chrome.storage.sync.get(['autoScrollEnabled', 'scrollInterval'], (result) => {
  if (result.autoScrollEnabled) {
    isAutoScrollEnabled = true;
    scrollInterval = (result.scrollInterval || 5) * 1000;
    startAutoScroll();
  }
});
