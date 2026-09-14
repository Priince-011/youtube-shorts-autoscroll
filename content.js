// YouTube Shorts Auto-Scroll Extension

let isAutoScrollEnabled = false;
let videoEndListener = null;
let videoMonitorInterval = null;
let lastVideoElement = null;

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
  startVideoMonitoring();
}

function stopAutoScroll() {
  console.log('Stopping auto-scroll...');
  stopVideoMonitoring();
  detachVideoEndListener();
}

function attachVideoEndListener() {
  console.log('Attaching video end listeners...');
  
  // Find all video elements on the page
  const videos = document.querySelectorAll('video');
  console.log(`Found ${videos.length} video element(s)`);
  
  videos.forEach((video, index) => {
    // Remove existing listeners
    video.removeEventListener('ended', onVideoEnded);
    video.removeEventListener('play', onVideoPlay);
    video.removeEventListener('timeupdate', onTimeUpdate);
    
    // Add new listeners
    video.addEventListener('ended', onVideoEnded);
    video.addEventListener('play', onVideoPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    
    console.log(`Listener attached to video ${index}`);
  });

  // Also observe for new video elements being added to the DOM
  if (!videoEndListener) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'VIDEO') {
              console.log('New VIDEO element detected');
              node.removeEventListener('ended', onVideoEnded);
              node.removeEventListener('timeupdate', onTimeUpdate);
              node.addEventListener('ended', onVideoEnded);
              node.addEventListener('timeupdate', onTimeUpdate);
            }
            
            // Also check for videos in children
            const childVideos = node.querySelectorAll?.('video') || [];
            if (childVideos.length > 0) {
              console.log(`Found ${childVideos.length} video(s) in new node`);
              childVideos.forEach((video) => {
                video.removeEventListener('ended', onVideoEnded);
                video.removeEventListener('timeupdate', onTimeUpdate);
                video.addEventListener('ended', onVideoEnded);
                video.addEventListener('timeupdate', onTimeUpdate);
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
    video.removeEventListener('ended', onVideoEnded);
    video.removeEventListener('play', onVideoPlay);
    video.removeEventListener('timeupdate', onTimeUpdate);
  });
  console.log('All video listeners removed');
}

function onVideoPlay() {
  if (isAutoScrollEnabled) {
    const videos = document.querySelectorAll('video');
    lastVideoElement = videos[0];
    console.log('Video started playing');
  }
}

function onTimeUpdate() {
  // This helps us monitor video progress
  const video = lastVideoElement || document.querySelector('video');
  if (video && video.duration && !isNaN(video.duration)) {
    const timeRemaining = video.duration - video.currentTime;
    if (timeRemaining < 0.5 && timeRemaining > 0) {
      // Video is almost done (within 0.5 seconds)
      console.log('Video almost ended, time remaining:', timeRemaining);
    }
  }
}

function onVideoEnded() {
  console.log('🎬 Video ended event fired!');
  scrollToNextShort();
}

function startVideoMonitoring() {
  console.log('Starting video monitoring...');
  
  // Monitor videos periodically to detect manual playback end or ended event not firing
  if (videoMonitorInterval) {
    clearInterval(videoMonitorInterval);
  }
  
  videoMonitorInterval = setInterval(() => {
    if (!isAutoScrollEnabled) return;
    
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return;
    
    const video = videos[0];
    
    // Check if video is paused and time is at or near the end
    if (video.paused && video.duration && !isNaN(video.duration)) {
      const timeRemaining = video.duration - video.currentTime;
      
      // If less than 0.1 seconds remaining and video is paused, it likely ended
      if (timeRemaining < 0.1 && timeRemaining >= 0) {
        console.log('📊 Video detected as ended via time monitoring:', video.currentTime, '/', video.duration);
        scrollToNextShort();
      }
    }
  }, 500);
}

function stopVideoMonitoring() {
  console.log('Stopping video monitoring...');
  if (videoMonitorInterval) {
    clearInterval(videoMonitorInterval);
    videoMonitorInterval = null;
  }
}

function scrollToNextShort() {
  if (!isAutoScrollEnabled) {
    console.log('Auto-scroll is disabled, ignoring ended event');
    return;
  }

  console.log('⬇️ Scrolling to next short...');

  // Small delay to ensure video is fully ended
  setTimeout(() => {
    let scrolled = false;

    // Method 1: Find and click the next button (most reliable)
    try {
      console.log('Attempting Method 1: Next button click');
      const nextButtons = document.querySelectorAll(
        'button[aria-label*="next" i], ' +
        'button[aria-label*="Next" i], ' +
        '[role="button"][aria-label*="next" i], ' +
        '[role="button"][aria-label*="Next" i]'
      );
      
      console.log(`Found ${nextButtons.length} potential next button(s)`);
      
      if (nextButtons.length > 0) {
        for (let btn of nextButtons) {
          try {
            btn.click();
            console.log('✅ Next button clicked successfully');
            scrolled = true;
            break;
          } catch (e) {
            console.log('Button click failed:', e);
          }
        }
      }
    } catch (e) {
      console.log('Error finding next button:', e);
    }

    if (!scrolled) {
      // Method 2: Dispatch keyboard event (ArrowDown)
      try {
        console.log('Attempting Method 2: ArrowDown keyboard event');
        const event = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          code: 'ArrowDown',
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(event);
        window.dispatchEvent(event);
        
        const activeElement = document.activeElement;
        if (activeElement) {
          activeElement.dispatchEvent(event);
        }
        console.log('✅ Keyboard event dispatched');
        scrolled = true;
      } catch (e) {
        console.log('Error dispatching keyboard event:', e);
      }
    }

    if (!scrolled) {
      // Method 3: Scroll down the page
      try {
        console.log('Attempting Method 3: Page scroll');
        window.scrollBy({
          top: window.innerHeight,
          behavior: 'smooth'
        });
        console.log('✅ Page scrolled');
        scrolled = true;
      } catch (e) {
        console.log('Error scrolling:', e);
      }
    }

    if (scrolled) {
      console.log('✅ Successfully scrolled to next short!');
    } else {
      console.log('❌ All scroll methods failed');
    }
  }, 500);
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
      stopVideoMonitoring();
      detachVideoEndListener();
    }
  } else {
    if (isAutoScrollEnabled) {
      attachVideoEndListener();
      startVideoMonitoring();
    }
  }
});

// Attach listeners when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    if (isAutoScrollEnabled) {
      attachVideoEndListener();
      startVideoMonitoring();
    }
  });
} else {
  console.log('DOM already loaded');
  if (isAutoScrollEnabled) {
    attachVideoEndListener();
    startVideoMonitoring();
  }
}
