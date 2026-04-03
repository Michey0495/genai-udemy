import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 750, height: 422 } });
await page.goto('http://localhost:9876/generate.html');

const thumbs = await page.locator('.thumb').all();
for (let i = 0; i < thumbs.length; i++) {
  const num = String(i + 1).padStart(2, '0');
  await thumbs[i].screenshot({ path: `c${num}-thumb.png`, type: 'png' });
  console.log(`Captured c${num}-thumb.png`);
}

await browser.close();
