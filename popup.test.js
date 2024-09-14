const puppeteer = require('puppeteer');
const path = require('path');

describe('Popup Test', () => {
    let browser;
    let popupPage;
    let extensionId;
    let backgroundPage;
    let pageExample;
    const testTabId = 0; 

    beforeAll(async () => {
        //set timeoout to 30 seconds
        // jest.setTimeout(30000);
        
        // const extensionPath = './dist';
        const extensionPath = './';
        browser = await puppeteer.launch({
            headless: false, // Set to true if you don't need to see the browser
            // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            args: [
                // '--enable-speech-dispatcher',//  not available in the test environment!
                `--disable-extensions-except=${path.resolve(__dirname, extensionPath)}`,
                `--load-extension=${path.resolve(__dirname, extensionPath)}`,
            ]
        });

        // Open a new page and navigate to the test URL
        pageExample = await browser.newPage();
        await pageExample.goto('https://www.example.com');

        // Find the extension's background page
        const targets = await browser.targets();
        const extensionTarget = targets.find((target) => target.type() === 'service_worker');

        if (extensionTarget) {
            backgroundPage = await extensionTarget.worker();
            // Extract the extension ID from the service worker's URL
            const extensionUrl = extensionTarget.url();
            extensionId = extensionUrl.split('/')[2]; // Get the extension ID part from the URL
        } else {
            throw new Error('Unable to find background page for the extension.');
        }

        // Open the extension's popup page with a test tab ID
        popupPage = await browser.newPage();
        await popupPage.goto(`chrome-extension://${extensionId}/popup.html?tab=${testTabId}`);
    });

    afterAll(async () => {
        await browser.close();
    }); 


    it('should log ok', async () => {
        console.log('ok');
    });

    it('should display the correct title', async () => {
        const title = await popupPage.title();
        expect(title).toBe('TTS Settings');
    });

    async function changeVolume(value) {
        // const newValue = await popupPage.$eval('#volume', el => el.value = 0.2); // can not trrigger change event

        await popupPage.evaluate((newValue) => {
            const pitchInput = document.querySelector('#volume');
            if (pitchInput) {
                pitchInput.value = newValue;

                // Create and dispatch the 'change' event
                const changeEvent = new Event('change', { bubbles: true });
                pitchInput.dispatchEvent(changeEvent);

            } else {
                throw new Error("#volume element not found");
            }
        }, value);
    }


    it('should save settings when changed', async () => {
        // tts voices can not be tested because they are not available in the test environment
        // await popupPage.select('#language', 'en');
        // await popupPage.select('#voice', 'Google US English');

        const volume = 0.8
        const pitch = '1.25'
        const speed = '1.5'
        const language = ''
        const voice = ''

        await popupPage.select('#language', language);
        await popupPage.select('#voice', voice);
        await popupPage.select('#speed', speed);
        await popupPage.select('#pitch', pitch);
        await changeVolume(volume);

        await popupPage.click('#test');
        // assert that the TTS is speaking
        const isSpeaking = await popupPage.evaluate(() => {
            return new Promise(resolve => {
                chrome.tts.isSpeaking(data => resolve(data));
            });
        });
        expect(isSpeaking).toBe(true);

        // Wait for the TTS to finish speaking
        await new Promise(resolve => setTimeout(resolve, 2000));
        await popupPage.click('#stop');

        const settings = await popupPage.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.sync.get('ttsSettings', data => resolve(data.ttsSettings));
            });
        });

        // expect(settings.language).toBe('en');
        // expect(settings.voice).toBe('Google US English');
        expect(settings.language).toBe(language);
        expect(settings.voice).toBe(voice);
        expect(settings.rate).toBe(speed);
        expect(settings.pitch).toBe(pitch);
        expect(settings.volume).toBe(volume);
    }, 30000); // Increase timeout to 30 seconds

    it('should reset settings to default', async () => {
        await popupPage.click('#reset');

        const settings = await popupPage.evaluate(() => {
            return new Promise(resolve => {
                chrome.storage.sync.get('ttsSettings', data => resolve(data.ttsSettings));
            });
        });

        expect(settings.language).toBe('');
        expect(settings.voice).toBe('');
        expect(settings.rate).toBe(1.0);
        expect(settings.pitch).toBe(1.0);
        expect(settings.volume).toBe(1.0);
    });

    // Add more tests as needed
});