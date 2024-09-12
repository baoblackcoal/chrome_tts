// Default settings
const defaultSettings = {
  voice: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  highlighting: 'none'
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
        voiceName: settings.voice,
        onEvent: (event) => {
          if (event.type === 'start' && settings.highlighting !== 'none') {
            // Implement text highlighting logic here
            console.log('Text highlighting:', settings.highlighting);
          }
        }
      });
    });
  }
});