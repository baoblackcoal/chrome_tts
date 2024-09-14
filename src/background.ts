/// <reference types="chrome"/>

// Default settings0
const defaultTtsSettings = {
  language: '',
  voiceName: '',
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0
};

// Initialize settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ ttsSettings: defaultTtsSettings });
  chrome.contextMenus.create({
    id: "readAloud",
    title: "Read with TTS",
    contexts: ["selection"]
  });
});

function speakText(text: string) {
  chrome.storage.sync.get('ttsSettings', (data: { [key: string]: any }) => {
    const settings = data.ttsSettings || defaultTtsSettings;
    chrome.tts.speak(text, {
      rate: settings.rate === '' ? 1 : Number(settings.rate),
      pitch: settings.pitch === '' ? 1 : Number(settings.pitch),
      volume: settings.volume as number,
      voiceName: settings.voiceName
    });
  });
}

chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (!tab) return; // Handle case when tab is undefined
  if (info.menuItemId === "readAloud") {
    const text = info.selectionText;
    if (text) {
      speakText(text);
    }
  }
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (message.action === 'speak') {
    const text = message.text;
    speakText(text);
  }
});