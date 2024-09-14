import puppeteer, { Browser, Page } from 'puppeteer';
import path from 'path';
import { exec } from 'child_process';

describe('Popup Test', () => {
  let browser: Browser;
  let popupPage: Page;
  let extensionId: string;
  let pageExample: Page;
  const testTabId = 0;

  beforeAll(async () => {
    jest.setTimeout(30000);

    await new Promise<void>((resolve, reject) => {
      exec('npm run build', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return reject(error);
        }
        resolve();
      });
    });

    const extensionPath = '../../dist';
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${path.resolve(__dirname, extensionPath)}`,
        `--load-extension=${path.resolve(__dirname, extensionPath)}`,
      ]
    });

    pageExample = await browser.newPage();
    await pageExample.goto('https://www.example.com');

    const targets = await browser.targets();
    const extensionTarget = targets.find((target) => target.type() === 'service_worker');

    if (extensionTarget) {
      const backgroundPage = await extensionTarget.worker();
      const extensionUrl = extensionTarget.url();
      extensionId = extensionUrl.split('/')[2];
    } else {
      throw new Error('Unable to find background page for the extension.');
    }

    popupPage = await browser.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html?tab=${testTabId}`);
  }, 30000);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  it('should log ok', async () => {
    console.log('ok');
  });

  it('should display the correct title', async () => {
    const title = await popupPage.title();
    expect(title).toBe('TTS Settings');
  });

  async function changeVolume(value: number) {
    await popupPage.evaluate((newValue) => {
      const pitchInput = document.querySelector<HTMLInputElement>('#volume');
      if (pitchInput) {
        pitchInput.value = newValue.toString();
        const changeEvent = new Event('change', { bubbles: true });
        pitchInput.dispatchEvent(changeEvent);
      } else {
        throw new Error("#volume element not found");
      }
    }, value);
  }

  it('should save settings when changed', async () => {
    const volume = 0.8;
    const pitch = '1.25';
    const speed = '1.5';
    const language = '';
    const voiceName = '';

    await popupPage.select('#language', language);
    await popupPage.select('#voiceName', voiceName);
    await popupPage.select('#speed', speed);
    await popupPage.select('#pitch', pitch);
    await changeVolume(volume);

    await popupPage.click('#test');
    await new Promise(resolve => setTimeout(resolve, 500));
    const isSpeaking = await popupPage.evaluate(() => {
      return new Promise<boolean>(resolve => {
        chrome.tts.isSpeaking((data) => resolve(data));
      });
    });
    expect(isSpeaking).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await popupPage.click('#stop');

    const settings = await popupPage.evaluate(() => {
      return new Promise<any>(resolve => {
        chrome.storage.sync.get('ttsSettings', (data: { [key: string]: any }) => resolve(data.ttsSettings));
      });
    });

    expect(settings.language).toBe(language);
    expect(settings.voiceName).toBe(voiceName);
    expect(settings.rate).toBe(speed);
    expect(settings.pitch).toBe(pitch);
    expect(settings.volume).toBe(volume);
  }, 30000);

  it('should reset settings to default', async () => {
    await popupPage.click('#reset');

    const settings = await popupPage.evaluate(() => {
      return new Promise<any>(resolve => {
        chrome.storage.sync.get('ttsSettings', (data: { [key: string]: any }) => resolve(data.ttsSettings));
      });
    });

    expect(settings.language).toBe('');
    expect(settings.voiceName).toBe('');
    expect(settings.rate).toBe(1.0);
    expect(settings.pitch).toBe(1.0);
    expect(settings.volume).toBe(1.0);
  });
});