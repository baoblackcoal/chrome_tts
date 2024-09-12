document.addEventListener('DOMContentLoaded', () => {
  const countrySelect = document.getElementById('country'); // New country select element
  const voiceSelect = document.getElementById('voice');
  const speedInput = document.getElementById('speed');
  const pitchInput = document.getElementById('pitch');
  const volumeInput = document.getElementById('volume');
  const highlightingSelect = document.getElementById('highlighting');
  const testButton = document.getElementById('test');
  const stopButton = document.getElementById('stop');
  const resetButton = document.getElementById('reset');

  // Populate voice options
  chrome.tts.getVoices((voices) => {
    populateVoiceOptions(voices); // Populate voices initially
    countrySelect.addEventListener('change', () => populateVoiceOptions(voices)); // Update voices when country changes
    loadSavedSettings(); // Load settings after voices are populated
  });

  function populateVoiceOptions(voices) {
    const selectedCountry = countrySelect.value;
    voiceSelect.innerHTML = ''; // Clear previous options
    voices.forEach((voice) => {
      if (voice.lang === selectedCountry) {
        const option = document.createElement('option');
        option.value = voice.voiceName;
        option.textContent = `${voice.voiceName} (${voice.lang})`;
        voiceSelect.appendChild(option);
      }
    });
  }

  function loadSavedSettings() {
    chrome.storage.sync.get('ttsSettings', (data) => {
      const settings = data.ttsSettings || {};
      if (settings.country) {
        countrySelect.value = settings.country;
      }
      if (settings.voice) {
        voiceSelect.value = settings.voice;
      }
      speedInput.value = settings.rate || 1;
      pitchInput.value = settings.pitch || 1;
      volumeInput.value = settings.volume || 1;
      highlightingSelect.value = settings.highlighting || 'none';

      // Populate voices based on saved country
      chrome.tts.getVoices((voices) => populateVoiceOptions(voices));
    });
  }

  function saveSettings() {
    const settings = {
      country: countrySelect.value,
      voice: voiceSelect.value,
      rate: parseFloat(speedInput.value),
      pitch: parseFloat(pitchInput.value),
      volume: parseFloat(volumeInput.value),
      highlighting: highlightingSelect.value
    };
    chrome.storage.sync.set({ ttsSettings: settings });
  }

  [countrySelect, voiceSelect, speedInput, pitchInput, volumeInput, highlightingSelect].forEach(
    (element) => element.addEventListener('change', saveSettings)
  );

  testButton.addEventListener('click', () => {
    const testText = "This is a test of the text-to-speech settings.";
    chrome.tts.speak(testText, {
      rate: parseFloat(speedInput.value),
      pitch: parseFloat(pitchInput.value),
      volume: parseFloat(volumeInput.value),
      voiceName: voiceSelect.value
    });
  });

  stopButton.addEventListener('click', () => {
    chrome.tts.stop();
  });

  resetButton.addEventListener('click', () => {
    const defaultSettings = {
      country: 'en-US',
      voice: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      highlighting: 'none'
    };
    chrome.storage.sync.set({ ttsSettings: defaultSettings }, () => {
      countrySelect.value = defaultSettings.country;
      voiceSelect.value = ''; // Reset voice selection
      speedInput.value = defaultSettings.rate;
      pitchInput.value = defaultSettings.pitch;
      volumeInput.value = defaultSettings.volume;
      highlightingSelect.value = defaultSettings.highlighting;
      chrome.tts.getVoices((voices) => populateVoiceOptions(voices)); // Repopulate voices for default country
    });
  });
});