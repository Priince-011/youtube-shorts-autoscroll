// YouTube Shorts Auto-Scroll Extension

let isAutoScrollEnabled = false;
let videoEndListener = null;
const targetSelector = 'yt-formatted-string[role="button"]'; // YouTube's Short navigation button

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
    console.log('Video listener attached');
  });

  // Also observe for new video elements being added to the DOM
  if (!videoEndListener) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if the node is a video element or contains video elements
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'VIDEO') {
              node.removeEventListener('ended', scrollToNextShort);
              node.addEventListener('ended', scrollToNextShort);
              console.log('New video element detected, listener added');
            }
            
            // Also check for videos in children
            const childVideos = node.querySelectorAll('video');
            childVideos.forEach((video) => {
              video.removeEventListener('ended', scrollToNextShort);
              video.addEventListener('ended', scrollToNextShort);
            });
          }
        });
      });
    });

    videoEndListener = observer;
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    console.log('MutationObserver started');
  }
}

function detachVideoEndListener() {
  if (videoEndListener) {
    videoEndListener.disconnect();
    videoEndListener = null;
    console.log('MutationObserver stopped');
  }

  // Remove event listeners from all videos
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    video.removeEventListener('ended', scrollToNextShort);
  });
  console.log('All video listeners removed');
}

function scrollToNextShort() {
  if (!isAutoScrollEnabled) return;

  console.log('Video ended, scrolling to next short...');

  // Small delay to ensure video is fully ended
  setTimeout(() => {
    // Method 1: Dispatch keyboard event
    const arrowDownEvent = new KeyboardEvent('keydown', {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(arrowDownEvent);
    
    // Method 2: Find and click the next button
    setTimeout(() => {
      try {
        const nextButton = document.querySelector('[aria-label="Next"]') || 
                          document.querySelector('[aria-label="next"]') ||
                          document.querySelector('button[aria-label*="next" i]');
        
        if (nextButton) {
          nextButton.click();
          console.log('Clicked next button');
        }
      } catch (e) {
        console.log('Could not find next button:', e);
      }
    }, 100);

    // Method 3: Scroll down
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  }, 200);
}

// Load saved settings on page load
chrome.storage.sync.get(['autoScrollEnabled'], (result) => {
  if (result.autoScrollEnabled) {
    isAutoScrollEnabled = true;
    console.log('Auto-scroll enabled on page load');
    startAutoScroll();
  }
});

// Re-attach listeners when page is visible again (tab switch)
document.addEventListener('visibilitychange', () => {
  console.log('Visibility changed:', document.hidden ? 'hidden' : 'visible');
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

// Also attach listeners when DOM is ready (in case extension loads after video is playing)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (isAutoScrollEnabled) {
      attachVideoEndListener();
    }
  });
} else {
  // DOM is already loaded
  if (isAutoScrollEnabled) {
    attachVideoEndListener();
  }
}
