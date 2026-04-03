import { chromium } from 'playwright';

const browser = await chromium.launch();
const courses = [];
for (let i = 1; i <= 16; i++) {
  courses.push(String(i).padStart(2, '0'));
}

for (const num of courses) {
  const page = await browser.newPage();
  try {
    await page.goto(`http://localhost:9877/courses/c${num}/index.html`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.pdf({
      path: `c${num}-full.pdf`,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });
    console.log(`OK c${num}-full.pdf`);
  } catch(e) {
    console.log(`FAIL c${num}: ${e.message.slice(0,80)}`);
  }
  await page.close();
}

await browser.close();
