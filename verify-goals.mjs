import { chromium } from 'playwright';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:49332');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // C14(prereqs 2項目, audience 3項目)を検証
  const checkIds = [7120837, 7120885, 7120841];
  for (const id of checkIds) {
    await page.goto(`https://www.udemy.com/instructor/course/${id}/manage/goals/`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);

    const data = await page.evaluate(() => {
      const getValues = (prefix) => {
        const inputs = document.querySelectorAll(`input[data-purpose^="${prefix}"]`);
        return Array.from(inputs).map(i => i.value);
      };
      return {
        goals: getValues('learn-goal-input'),
        prereqs: getValues('requirements-input'),
        audience: getValues('target-student-input')
      };
    });

    console.log(`\nコースID: ${id}`);
    console.log('goals:', JSON.stringify(data.goals));
    console.log('prereqs:', JSON.stringify(data.prereqs));
    console.log('audience:', JSON.stringify(data.audience));
  }

  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
