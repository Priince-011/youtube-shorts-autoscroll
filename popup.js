document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const intervalSlider = document.getElementById('intervalSlider');
  const intervalValue = document.getElementById('intervalValue');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['autoScrollEnabled', 'scrollInterval'], (result) => {
    toggleSwitch.checked = result.autoScrollEnabled || false;
    const interval = result.scrollInterval || 5;
    intervalSlider.value = interval;
    intervalValue.textContent = interval + 's';
    updateStatus();
  });

  // Toggle handler
  toggleSwitch.addEventListener('change', () => {
    const enabled = toggleSwitch.checked;
    chrome.storage.sync.set({ autoScrollEnabled: enabled });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggle',
          enabled: enabled
        }).catch(() => {
          console.log('Could not communicate with content script');
        });
      }
    });

    updateStatus();
  });

  // Interval slider handler
  intervalSlider.addEventListener('change', () => {
    const interval = parseInt(intervalSlider.value);
    intervalValue.textContent = interval + 's';
    chrome.storage.sync.set({ scrollInterval: interval });

    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'setInterval',
          interval: interval
        }).catch(() => {
          console.log('Could not communicate with content script');
        });
      }
    });
  });

  function updateStatus() {
    if (toggleSwitch.checked) {
      statusDiv.textContent = `Status: Enabled (${intervalSlider.value}s intervals)`;
      statusDiv.className = 'status active';
    } else {
      statusDiv.textContent = 'Status: Disabled';
      statusDiv.className = 'status inactive';
    }
  }
});
