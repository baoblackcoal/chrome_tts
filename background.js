// Default settings
const defaultSettings = {
  language: 'Default',
  voiceName: '',
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
        rate: settings.rate === '' ? 1 : settings.rate,
        pitch: settings.pitch === '' ? 1 : settings.pitch,
        volume: settings.volume,
        voiceName: settings.voice
      });
    });
  }
});