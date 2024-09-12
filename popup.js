document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('language');
  const voiceSelect = document.getElementById('voice');
  const speedSelect = document.getElementById('speed');
  const pitchSelect = document.getElementById('pitch');
  const volumeInput = document.getElementById('volume');
  const testButton = document.getElementById('test');
  const stopButton = document.getElementById('stop');
  const resetButton = document.getElementById('reset');

  chrome.tts.getVoices((voices) => {
    populateLanguageOptions(voices); // Populate countries initially
    populateVoiceOptions(voices); // Populate voices initially
    languageSelect.addEventListener('change', () => {
        populateVoiceOptions(voices); 
        saveSettings();
    }); 
    loadSavedSettings(); // Load settings after voices are populated
  });

  function populateLanguageOptions(voices) {
    const languages = new Set();
    voices.forEach((voice) => {
      const languageCode = voice.lang.split('-')[0];
      languages.add(languageCode);
    });
    languageSelect.innerHTML = ''; // Clear previous options
    languages.forEach((language) => {
      const option = document.createElement('option');
      option.value = language;
      option.textContent = language;
      languageSelect.appendChild(option);
    });
  }

  function populateVoiceOptions(voices) {
    const selectedLanguage = languageSelect.value;
    voiceSelect.innerHTML = ''; // Clear previous options
    voices.forEach((voice) => {
      if (voice.lang.startsWith(selectedLanguage)) { 
        const option = document.createElement('option');
        option.value = voice.voiceName;
        option.textContent = `${voice.voiceName} (${voice.lang})`;
        voiceSelect.appendChild(option);
      }
    });
  }

  function populateSpeedAndPitchOptions() {
    const speedOptions = ['', 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const pitchOptions = ['', 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    speedSelect.innerHTML = '';
    pitchSelect.innerHTML = '';
    speedOptions.forEach((value) => {
      const speedOption = document.createElement('option');
      speedOption.value = value;
      speedOption.textContent = value === '' ? 'Default' : `${value}X`;
      speedSelect.appendChild(speedOption);
    });
    pitchOptions.forEach((value) => {
      const pitchOption = document.createElement('option');
      pitchOption.value = value;
      pitchOption.textContent = value === '' ? 'Default' : `${value}X`;
      pitchSelect.appendChild(pitchOption);
    });
  }

  // Call the function to populate speed and pitch options
  populateSpeedAndPitchOptions();

  function loadSavedSettings() {
    chrome.storage.sync.get('ttsSettings', (data) => {
      const settings = data.ttsSettings || {};
      if (settings.language) {
        languageSelect.value = settings.language;
      }
      if (settings.voice) {
        voiceSelect.value = settings.voice;
      }
      speedSelect.value = settings.rate || 1;
      pitchSelect.value = settings.pitch || 1;
      volumeInput.value = settings.volume || 1;

      chrome.tts.getVoices((voices) => populateVoiceOptions(voices));
    });
  }

  function saveSettings() {
    const settings = {
      language: languageSelect.value,
      voice: voiceSelect.value,
      rate: speedSelect.value,
      pitch: pitchSelect.value,
      volume: parseFloat(volumeInput.value)
    };
    chrome.storage.sync.set({ ttsSettings: settings });
  }

  [languageSelect, voiceSelect, speedSelect, pitchSelect, volumeInput].forEach(
    (element) => element.addEventListener('change', saveSettings)
  );

  testButton.addEventListener('click', () => {
    fetch('languageStrings.json')
      .then(response => response.json())
      .then(languageStrings => {
        const selectedLanguage = languageSelect.value;
        const testText = languageStrings[selectedLanguage] || "Good day, world! May your moments be filled with peace.";
        console.log(testText);
        chrome.tts.speak(testText, {
          rate: Number(speedSelect.value),
          pitch: Number(pitchSelect.value),
          volume: parseFloat(volumeInput.value),
          voiceName: voiceSelect.value,
        });
      })
      .catch(error => console.error('Error loading language strings:', error));
  });

  stopButton.addEventListener('click', () => {
    chrome.tts.stop();
  });

  resetButton.addEventListener('click', () => {
    const defaultSettings = {
      language: 'en',
      voice: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    };
    chrome.storage.sync.set({ ttsSettings: defaultSettings }, () => {
      languageSelect.value = defaultSettings.country;
      voiceSelect.value = ''; // Reset voice selection
      speedSelect.value = defaultSettings.rate;
      pitchSelect.value = defaultSettings.pitch;
      volumeInput.value = defaultSettings.volume;
      chrome.tts.getVoices((voices) => {
        populateLanguageOptions(voices); // Repopulate countries
        populateVoiceOptions(voices); // Repopulate voices for default country
      });
    });
  });
});