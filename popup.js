document.addEventListener('DOMContentLoaded', () => {
  const voiceSelect = document.getElementById('voice');
  const speedInput = document.getElementById('speed');
  const pitchInput = document.getElementById('pitch');
  const volumeInput = document.getElementById('volume');
  const highlightingSelect = document.getElementById('highlighting');
  const testButton = document.getElementById('test');
  const resetButton = document.getElementById('reset');

  // Populate voice options
  chrome.tts.getVoices((voices) => {
    voices.forEach((voice) => {
      const option = document.createElement('option');
      option.value = voice.voiceName;
      option.textContent = `${voice.voiceName} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
  
    // Load saved settings after populating voices
    loadSavedSettings();
  });

  // Load saved settings
  function loadSavedSettings() {
    chrome.storage.sync.get('ttsSettings', (data) => {
      const settings = data.ttsSettings || {};
      if (settings.voice) {
        voiceSelect.value = settings.voice;
      }
      speedInput.value = settings.rate || 1;
      pitchInput.value = settings.pitch || 1;
      volumeInput.value = settings.volume || 1;
      highlightingSelect.value = settings.highlighting || 'none';
    });
  }

  // Save settings
  function saveSettings() {
    const settings = {
      voice: voiceSelect.value,
      rate: parseFloat(speedInput.value),
      pitch: parseFloat(pitchInput.value),
      volume: parseFloat(volumeInput.value),
      highlighting: highlightingSelect.value
    };
    chrome.storage.sync.set({ ttsSettings: settings });
  }

  // Event listeners for input changes
  [voiceSelect, speedInput, pitchInput, volumeInput, highlightingSelect].forEach(
    (element) => element.addEventListener('change', saveSettings)
  );

  // Test button
  testButton.addEventListener('click', () => {
    const testText = "This is a test of the text-to-speech settings.";
    chrome.tts.speak(testText, {
      rate: parseFloat(speedInput.value),
      pitch: parseFloat(pitchInput.value),
      volume: parseFloat(volumeInput.value),
      voiceName: voiceSelect.value
    });
  });

  // Reset button
  resetButton.addEventListener('click', () => {
    const defaultSettings = {
      voice: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      highlighting: 'none'
    };
    chrome.storage.sync.set({ ttsSettings: defaultSettings }, () => {
      voiceSelect.value = defaultSettings.voice;
      speedInput.value = defaultSettings.rate;
      pitchInput.value = defaultSettings.pitch;
      volumeInput.value = defaultSettings.volume;
      highlightingSelect.value = defaultSettings.highlighting;
    });
  });
});