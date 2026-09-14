// YouTube Shorts Auto-Scroll Extension

let isAutoScrollEnabled = false;
let videoEndListener = null;

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
  }
});

function startAutoScroll() {
  console.log('YouTube Shorts Auto-Scroll: Started');
  attachVideoEndListener();
}

function stopAutoScroll() {
  console.log('YouTube Shorts Auto-Scroll: Stopped');
  detachVideoEndListener();
}

function attachVideoEndListener() {
  // Find all video elements on the page
  const videos = document.querySelectorAll('video');
  
  videos.forEach((video) => {
    // Remove existing listener if any
    video.removeEventListener('ended', scrollToNextShort);
    
    // Add new listener for video end event
    video.addEventListener('ended', scrollToNextShort);
  });

  // Also observe for new video elements being added to the DOM
  if (!videoEndListener) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'VIDEO') {
            node.removeEventListener('ended', scrollToNextShort);
            node.addEventListener('ended', scrollToNextShort);
            console.log('New video detected, added end listener');
          }
        });
      });
    });

    videoEndListener = observer;
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

function detachVideoEndListener() {
  if (videoEndListener) {
    videoEndListener.disconnect();
    videoEndListener = null;
  }

  // Remove event listeners from all videos
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    video.removeEventListener('ended', scrollToNextShort);
  });
}

function scrollToNextShort() {
  if (!isAutoScrollEnabled) return;

  console.log('Video ended, scrolling to next short...');

  // Simulate arrow down key press (YouTube Shorts responds to this)
  const arrowDownEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    code: 'ArrowDown',
    keyCode: 40,
    bubbles: true,
    cancelable: true
  });
  document.dispatchEvent(arrowDownEvent);

  // Also scroll down smoothly
  setTimeout(() => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  }, 100);
}

// Load saved settings on page load
chrome.storage.sync.get(['autoScrollEnabled'], (result) => {
  if (result.autoScrollEnabled) {
    isAutoScrollEnabled = true;
    startAutoScroll();
  }
});

// Re-attach listeners when page is visible again (tab switch)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (isAutoScrollEnabled) {
      detachVideoEndListener();
    }
  } else {
    if (isAutoScrollEnabled) {
      attachVideoEndListener();
    }
  }
});
