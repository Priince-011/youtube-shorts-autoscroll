// YouTube Shorts Auto-Scroll Extension

let isAutoScrollEnabled = false;
let videoEndListener = null;
let videoMonitorInterval = null;
let lastVideoElement = null;
let scrollAttemptCount = 0;

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
  
  const videos = document.querySelectorAll('video');
  console.log(`Found ${videos.length} video element(s)`);
  
  videos.forEach((video, index) => {
    video.removeEventListener('ended', onVideoEnded);
    video.removeEventListener('play', onVideoPlay);
    video.removeEventListener('timeupdate', onTimeUpdate);
    
    video.addEventListener('ended', onVideoEnded);
    video.addEventListener('play', onVideoPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    
    console.log(`Listener attached to video ${index}`);
  });

  if (!videoEndListener) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.tagName === 'VIDEO') {
              console.log('New VIDEO element detected');
              node.removeEventListener('ended', onVideoEnded);
              node.removeEventListener('timeupdate', onTimeUpdate);
              node.addEventListener('ended', onVideoEnded);
              node.addEventListener('timeupdate', onTimeUpdate);
            }
            
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
    scrollAttemptCount = 0;
    console.log('Video started playing');
  }
}

function onTimeUpdate() {
  const video = lastVideoElement || document.querySelector('video');
  if (video && video.duration && !isNaN(video.duration)) {
    const timeRemaining = video.duration - video.currentTime;
    if (timeRemaining < 0.5 && timeRemaining > 0) {
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
  
  if (videoMonitorInterval) {
    clearInterval(videoMonitorInterval);
  }
  
  videoMonitorInterval = setInterval(() => {
    if (!isAutoScrollEnabled) return;
    
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return;
    
    const video = videos[0];
    
    if (video.paused && video.duration && !isNaN(video.duration)) {
      const timeRemaining = video.duration - video.currentTime;
      
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

  scrollAttemptCount++;
  console.log(`⬇️ Scrolling to next short (attempt ${scrollAttemptCount})...`);

  setTimeout(() => {
    let scrolled = false;

    // Method 1: Try to find and click YouTube's navigation button using different selectors
    try {
      console.log('Method 1: Searching for navigation button...');
      
      // Look for buttons with specific ARIA labels or classes
      const selectors = [
        'button[aria-label*="Next"]',
        'button[aria-label*="next"]',
        '[role="button"][aria-label*="Next"]',
        '[role="button"][aria-label*="next"]',
        'button.yt-spec-button-shape-next',
        'button[data-navigation-next]',
        'a[href*="/shorts"]'
      ];

      for (let selector of selectors) {
        const button = document.querySelector(selector);
        if (button) {
          console.log(`Found button with selector: ${selector}`);
          button.click();
          console.log('✅ Navigation button clicked');
          scrolled = true;
          break;
        }
      }
    } catch (e) {
      console.log('Error clicking navigation button:', e);
    }

    // Method 2: Scroll the shorts container
    if (!scrolled) {
      try {
        console.log('Method 2: Scrolling shorts container...');
        
        // Find the shorts container
        const container = document.querySelector('[role="main"]') || 
                         document.querySelector('ytd-reel-video-renderer') ||
                         document.querySelector('.shorts-container') ||
                         document.querySelector('html');
        
        if (container) {
          container.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
          });
          console.log('✅ Container scrolled');
          scrolled = true;
        }
      } catch (e) {
        console.log('Error scrolling container:', e);
      }
    }

    // Method 3: Use Page Down key
    if (!scrolled) {
      try {
        console.log('Method 3: Simulating Page Down key...');
        const event = new KeyboardEvent('keydown', {
          key: 'PageDown',
          code: 'PageDown',
          keyCode: 34,
          which: 34,
          bubbles: true,
          cancelable: true
        });
        
        document.dispatchEvent(event);
        window.dispatchEvent(event);
        document.body.dispatchEvent(event);
        
        console.log('✅ Page Down key simulated');
        scrolled = true;
      } catch (e) {
        console.log('Error with Page Down key:', e);
      }
    }

    // Method 4: Direct window scroll
    if (!scrolled) {
      try {
        console.log('Method 4: Direct window scroll...');
        window.scrollBy(0, window.innerHeight);
        console.log('✅ Window scrolled directly');
        scrolled = true;
      } catch (e) {
        console.log('Error with direct scroll:', e);
      }
    }

    // Method 5: Try clicking in the middle of the page (YouTube Shorts responds to clicks)
    if (!scrolled && scrollAttemptCount < 3) {
      try {
        console.log('Method 5: Simulating click on page...');
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2
        });
        
        document.body.dispatchEvent(clickEvent);
        
        // Then scroll
        setTimeout(() => {
          window.scrollBy(0, window.innerHeight);
        }, 100);
        
        console.log('✅ Click and scroll attempted');
        scrolled = true;
      } catch (e) {
        console.log('Error with click method:', e);
      }
    }

    if (scrolled) {
      console.log('✅ Successfully attempted scroll to next short!');
    } else {
      console.log('❌ All scroll methods exhausted');
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

// Re-attach listeners when page is visible again
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
