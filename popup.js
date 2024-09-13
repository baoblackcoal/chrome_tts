const URL_PARAMS = new URLSearchParams(window.location.search);

async function getActiveTab() {
    // Open popup.html?tab=5 to use tab ID 5, etc.
    if (URL_PARAMS.has("tab")) {
        return parseInt(URL_PARAMS.get("tab"));
    }

    const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    return tabs[0].id; // Return the tab ID
}

document.addEventListener('DOMContentLoaded', () => {
    initializeTTSSettings();
});