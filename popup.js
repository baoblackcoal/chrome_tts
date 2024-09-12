document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('language');
  const voiceSelect = document.getElementById('voice');
  const speedSelect = document.getElementById('speed');
  const pitchSelect = document.getElementById('pitch');
  const volumeInput = document.getElementById('volume');
  const testButton = document.getElementById('test');
  const stopButton = document.getElementById('stop');
  const resetButton = document.getElementById('reset');

  let settingsTemp = {};
  
  chrome.tts.getVoices((voices) => {
    populateLanguageOptions(voices); // Populate countries initially
    populateVoiceOptions(voices); // Populate voices initially
    languageSelect.addEventListener('change', () => {
        populateVoiceOptions(voices); 
        populateSpeedAndPitchOptions();
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

    // Add Default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Default';
    languageSelect.appendChild(defaultOption);

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

    // Add Default option only if language is Default
    if (selectedLanguage === '') {
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Default';
      voiceSelect.appendChild(defaultOption);
    }

    voices.forEach((voice) => {
      if (voice.lang.startsWith(selectedLanguage)) { 
        const option = document.createElement('option');
        option.value = voice.voiceName;
        option.textContent = `${voice.voiceName} (${voice.lang})`;
        voiceSelect.appendChild(option);
      }
    });

    // Set voice to default if language is Default
    if (selectedLanguage === '') {
      voiceSelect.value = '';
    }
  }

  function populateSpeedAndPitchOptions() {
    const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    const pitchOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    speedSelect.innerHTML = '';
    pitchSelect.innerHTML = '';
    speedOptions.forEach((value) => {
      const speedOption = document.createElement('option');
      speedOption.value = value;
      speedOption.textContent = `${value}X`;
      speedSelect.appendChild(speedOption);
    });
    pitchOptions.forEach((value) => {
      const pitchOption = document.createElement('option');
      pitchOption.value = value;
      pitchOption.textContent = `${value}X`;
      pitchSelect.appendChild(pitchOption);
    });

    // Set speed and pitch to default if language is Default
    if (languageSelect.value === '') {
      speedSelect.value = 1;
      pitchSelect.value = 1;
    } else {
        speedSelect.value = settingsTemp.rate;
        pitchSelect.value = settingsTemp.pitch;
    }
  }

  // Call the function to populate speed and pitch options
  populateSpeedAndPitchOptions();

  function loadSavedSettings() {
    chrome.storage.sync.get('ttsSettings', (data) => {
      const settings = data.ttsSettings || {};
      if (settings.language) {
        languageSelect.value = settings.language;
      } else {
        languageSelect.value = ''; // Set to Default if no language is saved
      }
      if (settings.voice) {
        voiceSelect.value = settings.voice;
      }
      speedSelect.value = settings.rate || 1;
      pitchSelect.value = settings.pitch || 1;
      volumeInput.value = settings.volume || 1;
      settingsTemp = settings;

      chrome.tts.getVoices((voices) => populateVoiceOptions(voices));
    });
  }

  function saveSettings() {
    const settings = {
      language: languageSelect.value,
      voice: languageSelect.value === '' ? '' : voiceSelect.value,
      rate: languageSelect.value === '' ? '' : speedSelect.value,
      pitch: languageSelect.value === '' ? '' : pitchSelect.value,
      volume: parseFloat(volumeInput.value)
    };
    settingsTemp = settings;
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
        
        // Send message to background script to handle TTS
        chrome.runtime.sendMessage({
          action: 'speak',
          text: testText,
        });
      })
      .catch(error => console.error('Error loading language strings:', error));
  });

  stopButton.addEventListener('click', () => {
    chrome.tts.stop();
  });

  resetButton.addEventListener('click', () => {
    const defaultSettings = {
      language: '',
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