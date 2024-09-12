document.addEventListener('DOMContentLoaded', () => {
  const languageSelect = document.getElementById('language');
  const voiceSelect = document.getElementById('voice');
  const speedInput = document.getElementById('speed');
  const pitchInput = document.getElementById('pitch');
  const volumeInput = document.getElementById('volume');
  const testButton = document.getElementById('test');
  const stopButton = document.getElementById('stop');
  const resetButton = document.getElementById('reset');

  chrome.tts.getVoices((voices) => {
    populateLanguageOptions(voices); // Populate countries initially
    populateVoiceOptions(voices); // Populate voices initially
    languageSelect.addEventListener('change', () => populateVoiceOptions(voices)); 
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

  function loadSavedSettings() {
    chrome.storage.sync.get('ttsSettings', (data) => {
      const settings = data.ttsSettings || {};
      if (settings.language) {
        languageSelect.value = settings.language;
      }
      if (settings.voice) {
        voiceSelect.value = settings.voice;
      }
      speedInput.value = settings.rate || 1;
      pitchInput.value = settings.pitch || 1;
      volumeInput.value = settings.volume || 1;

      chrome.tts.getVoices((voices) => populateVoiceOptions(voices));
    });
  }

  function saveSettings() {
    const settings = {
      language: languageSelect.value,
      voice: voiceSelect.value,
      rate: parseFloat(speedInput.value),
      pitch: parseFloat(pitchInput.value),
      volume: parseFloat(volumeInput.value)
    };
    chrome.storage.sync.set({ ttsSettings: settings });
  }

  [languageSelect, voiceSelect, speedInput, pitchInput, volumeInput].forEach(
    (element) => element.addEventListener('change', saveSettings)
  );

  testButton.addEventListener('click', () => {
    const languageStrings = {
      zh: "美好的一天，世界！愿你的每一刻都充满和平。",
      ar: "يوم سعيد، أيها العالم! أتمنى أن تكون لحظاتك مليئة بالسلام.",
      bg: "Хубав ден, свят! Нека моментите ти бъдат изпълнени с мир.",
      ca: "Bon dia, món! Que els teus moments estiguin plens de pau.",
      cs: "Hezký den, světe! Ať jsou vaše chvíle plné míru.",
      da: "God dag, verden! Må dine øjeblikke være fyldt med fred.",
      de: "Guten Tag, Welt! Mögen deine Momente voller Frieden sein.",
      el: "Καλή μέρα, κόσμε! Είθε οι στιγμές σου να είναι γεμάτες ειρήνη.",
      en: "Good day, world! May your moments be filled with peace.",
      es: "Buen día, mundo! Que tus momentos estén llenos de paz.",
      fi: "Hyvää päivää, maailma! Olkoot hetkesi täynnä rauhaa.",
      fr: "Bonne journée, monde! Que tes moments soient remplis de paix.",
      he: "יום טוב, עולם! מי ייתן ורגעיך יהיו מלאים בשלום.",
      hi: "नमस्ते दुनिया! आपकी हर घड़ी शांति से भरी हो।",
      hr: "Dobar dan, svijete! Neka tvoji trenuci budu ispunjeni mirom.",
      hu: "Jó napot, világ! Legyenek pillanataid békével telve.",
      id: "Selamat hari, dunia! Semoga momen-momenmu dipenuhi dengan kedamaian.",
      it: "Buona giornata, mondo! Che i tuoi momenti siano pieni di pace.",
      ja: "良い一日を、世界！あなたの瞬間が平和で満たされますように。",
      ko: "좋은 하루 되세요, 세상! 당신의 순간이 평화로 가득하길 바랍니다.",
      pt: "Bom dia, mundo! Que seus momentos sejam cheios de paz.",
      ru: "Хорошего дня, мир! Пусть ваши моменты будут наполнены миром.",
      sv: "God dag, världen! Må dina stunder vara fyllda av fred.",
      th: "สวัสดีวันใหม่, โลก! ขอให้ช่วงเวลาของคุณเต็มไปด้วยความสงบสุข.",
      tr: "İyi günler, dünya! Anlarınız huzurla dolsun.",
      uk: "Гарного дня, світе! Нехай ваші моменти будуть наповнені миром.",
      vi: "Chào ngày mới, thế giới! Mong rằng những khoảnh khắc của bạn sẽ tràn ngập hòa bình."
    };

    const selectedLanguage = languageSelect.value;
    const testText = languageStrings[selectedLanguage] || "Good day, world! May your moments be filled with peace.";
    //  encoding to UTF-8
    const encodedTestText = new TextEncoder().encode(testText);
    console.log(testText);
    chrome.tts.speak(encodedTestText, {
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
      language: 'en',
      voice: '',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0
    };
    chrome.storage.sync.set({ ttsSettings: defaultSettings }, () => {
      languageSelect.value = defaultSettings.country;
      voiceSelect.value = ''; // Reset voice selection
      speedInput.value = defaultSettings.rate;
      pitchInput.value = defaultSettings.pitch;
      volumeInput.value = defaultSettings.volume;
      chrome.tts.getVoices((voices) => {
        populateLanguageOptions(voices); // Repopulate countries
        populateVoiceOptions(voices); // Repopulate voices for default country
      });
    });
  });
});