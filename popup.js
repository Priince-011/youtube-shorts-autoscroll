document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['autoScrollEnabled'], (result) => {
    toggleSwitch.checked = result.autoScrollEnabled || false;
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

  function updateStatus() {
    if (toggleSwitch.checked) {
      statusDiv.textContent = 'Status: Enabled';
      statusDiv.className = 'status active';
    } else {
      statusDiv.textContent = 'Status: Disabled';
      statusDiv.className = 'status inactive';
    }
  }
});
