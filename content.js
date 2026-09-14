// YouTube Shorts Auto-Scroll Extension

let isAutoScrollEnabled = false;
let videoEndListener = null;

console.log('Content script loaded');

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request);
  if (request.action === 'toggle') {
    isAutoScrollEnabled = request.enabled;
    console.log('Auto-scroll toggled:', isAutoScrollEnabled);
    if (isAutoScrollEnabled) {
      startAutoScroll();
    } else {
      stopAutoScroll();
    }
    sendResponse({ status: isAutoScrollEnabled ? 'enabled' : 'disabled' });
  }
});

function startAutoScroll() {
  console.log('Starting auto-scroll...');
  attachVideoEndListener();
}

function stopAutoScroll() {
  console.log('Stopping auto-scroll...');
  detachVideoEndListener();
}

function attachVideoEndListener() {
  console.log('Attaching video end listeners...');
  
  // Find all video elements on the page
  const videos = document.querySelectorAll('video');
  console.log(`Found ${videos.length} video element(s)`);
  
  videos.forEach((video, index) => {
    // Remove existing listener if any
    video.removeEventListener('ended', scrollToNextShort);
    video.removeEventListener('play', onVideoPlay);
    
    // Add new listeners for video end event
    video.addEventListener('ended', scrollToNextShort);
    video.addEventListener('play', onVideoPlay);
    console.log(`Listener attached to video ${index}`);
  });

  // Also observe for new video elements being added to the DOM
  if (!videoEndListener) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          // Check if the node is a video element or contains video elements
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'VIDEO') {
              console.log('New VIDEO element detected');
              node.removeEventListener('ended', scrollToNextShort);
              node.addEventListener('ended', scrollToNextShort);
            }
            
            // Also check for videos in children
            const childVideos = node.querySelectorAll?.('video') || [];
            if (childVideos.length > 0) {
              console.log(`Found ${childVideos.length} video(s) in new node`);
              childVideos.forEach((video) => {
                video.removeEventListener('ended', scrollToNextShort);
                video.addEventListener('ended', scrollToNextShort);
              });
            }
          }
        });
      });
    });

    videoEndListener = observer;
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    console.log('MutationObserver started');
  }
}

function detachVideoEndListener() {
  console.log('Detaching video end listeners...');
  if (videoEndListener) {
    videoEndListener.disconnect();
    videoEndListener = null;
  }

  // Remove event listeners from all videos
  const videos = document.querySelectorAll('video');
  videos.forEach((video) => {
    video.removeEventListener('ended', scrollToNextShort);
    video.removeEventListener('play', onVideoPlay);
  });
  console.log('All video listeners removed');
}

function onVideoPlay() {
  if (isAutoScrollEnabled) {
    console.log('Video started playing, re-attaching end listener');
  }
}

function scrollToNextShort() {
  if (!isAutoScrollEnabled) {
    console.log('Auto-scroll is disabled, ignoring ended event');
    return;
  }

  console.log('🎬 Video ended! Scrolling to next short...');

  // Small delay to ensure video is fully ended
  setTimeout(() => {
    // Method 1: Find and click the next button (most reliable)
    try {
      // YouTube Shorts uses different button structures
      const nextButtons = document.querySelectorAll(
        'button[aria-label*="next" i], ' +
        'button[aria-label*="Next" i], ' +
        '[role="button"][aria-label*="next" i], ' +
        '[role="button"][aria-label*="Next" i]'
      );
      
      if (nextButtons.length > 0) {
        console.log(`Found ${nextButtons.length} next button(s), clicking...`);
        nextButtons[0].click();
        return;
      }
    } catch (e) {
      console.log('Error finding next button:', e);
    }

    // Method 2: Dispatch keyboard event (ArrowDown)
    try {
      console.log('Trying keyboard method...');
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true
      });
      
      // Try multiple targets
      document.dispatchEvent(event);
      window.dispatchEvent(event);
      
      const activeElement = document.activeElement;
      if (activeElement) {
        activeElement.dispatchEvent(event);
      }
      console.log('Keyboard event dispatched');
    } catch (e) {
      console.log('Error dispatching keyboard event:', e);
    }

    // Method 3: Scroll down the page
    try {
      console.log('Scrolling down...');
      window.scrollBy({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    } catch (e) {
      console.log('Error scrolling:', e);
    }
  }, 300);
}

// Load saved settings on page load
console.log('Loading saved settings...');
chrome.storage.sync.get(['autoScrollEnabled'], (result) => {
  console.log('Saved settings:', result);
  if (result.autoScrollEnabled) {
    isAutoScrollEnabled = true;
    console.log('Auto-scroll enabled from storage');
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

// Attach listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    if (isAutoScrollEnabled) {
      attachVideoEndListener();
    }
  });
} else {
  console.log('DOM already loaded');
  if (isAutoScrollEnabled) {
    attachVideoEndListener();
  }
}

// Also try to attach listeners periodically in case videos load late
let attachmentAttempts = 0;
const attachmentInterval = setInterval(() => {
  if (attachmentAttempts < 5 && isAutoScrollEnabled) {
    const videos = document.querySelectorAll('video');
    if (videos.length > 0 && !videos[0].hasAttribute('data-shorts-autoscroll')) {
      console.log(`Periodic attachment attempt ${attachmentAttempts + 1}: found ${videos.length} video(s)`);
      videos.forEach((video) => {
        if (!video.hasAttribute('data-shorts-autoscroll')) {
          video.setAttribute('data-shorts-autoscroll', 'true');
          video.removeEventListener('ended', scrollToNextShort);
          video.addEventListener('ended', scrollToNextShort);
        }
      });
    }
    attachmentAttempts++;
  } else if (attachmentAttempts >= 5) {
    clearInterval(attachmentInterval);
  }
}, 2000);
