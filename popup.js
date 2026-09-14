document.addEventListener('DOMContentLoaded', () => {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  chrome.storage.sync.get(['autoScrollEnabled'], (result) => {
    toggleSwitch.checked = result.autoScrollEnabled ?? false;
    updateStatus();
  });

  // Toggle handler
  toggleSwitch.addEventListener('change', () => {
    const enabled = toggleSwitch.checked;

    // Persist setting
    chrome.storage.sync.set({
      autoScrollEnabled: enabled
    });

    // Notify the active tab
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true
      },
      (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'toggle',
            enabled: enabled
          }).catch(() => {
            // Content script may not be available on this page.
            console.debug('Could not communicate with content script');
          });
        }
      }
    );

    updateStatus();
  });

  function updateStatus() {
    if (toggleSwitch.checked) {
      statusDiv.className = 'status active';

      statusDiv.innerHTML = `
        <span class="status-dot"></span>
        <span>Auto-scroll is active</span>
      `;
    } else {
      statusDiv.className = 'status inactive';

      statusDiv.innerHTML = `
        <span class="status-dot"></span>
        <span>Auto-scroll is off</span>
      `;
    }
  }
});