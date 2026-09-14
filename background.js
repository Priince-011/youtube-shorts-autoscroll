// Background service worker

// Initialize storage on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    autoScrollEnabled: false,
    scrollInterval: 5
  });
});
