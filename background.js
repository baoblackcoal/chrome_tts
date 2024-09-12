// Default settings
const defaultSettings = {
  language: '',
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

function speakText(text) {
  chrome.storage.sync.get('ttsSettings', (data) => {
    const settings = data.ttsSettings || defaultSettings;
    chrome.tts.speak(text, {
      rate: Number(settings.rate === '' ? 1 : settings.rate),
      pitch: Number(settings.pitch === '' ? 1 : settings.pitch),
      volume: Number(settings.volume),
      voiceName: settings.voice
    });
  });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "readAloud") {
    const text = info.selectionText;
    speakText(text);
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'speak') {
    const text = message.text;
    speakText(text);
  }
});