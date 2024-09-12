// Default settings
const defaultSettings = {
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
};

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ ttsSettings: defaultSettings });
  chrome.contextMenus.create({
    id: "readAloud",
    title: "Read with TTS",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readAloud") {
    chrome.storage.sync.get('ttsSettings', (data) => {
      const settings = data.ttsSettings || defaultSettings;
      chrome.tts.speak(info.selectionText, {
        rate: settings.rate,
        pitch: settings.pitch,
        volume: settings.volume,
        voiceName: settings.voice
      });
    });
  }
});