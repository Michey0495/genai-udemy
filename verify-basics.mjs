/**
 * 全16コースのbasics設定状態を一括確認
 */
import { chromium } from 'playwright';

const CDP_PORT = await (async () => {
  const { execSync } = await import('child_process');
  return parseInt(execSync("ps aux | grep 'remote-debugging-port' | grep -v grep | grep -o 'remote-debugging-port=[0-9]*' | head -1 | cut -d= -f2").toString().trim(), 10);
})();

const courses = [
  { id: 7120797, num: '01' }, { id: 7120883, num: '02' }, { id: 7120817, num: '03' },
  { id: 7120885, num: '04' }, { id: 7120819, num: '05' }, { id: 7120821, num: '06' },
  { id: 7120887, num: '07' }, { id: 7120823, num: '08' }, { id: 7120827, num: '09' },
  { id: 7120829, num: '10' }, { id: 7120831, num: '11' }, { id: 7120833, num: '12' },
  { id: 7120889, num: '13' }, { id: 7120837, num: '14' }, { id: 7120839, num: '15' },
  { id: 7120841, num: '16' },
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
  const page = await browser.contexts()[0].newPage();
  page.on('dialog', async d => { try { await d.accept(); } catch {} });

  console.log('コース | レベル | カテゴリ | サブカテゴリ | トピック | 画像');
  console.log('------|--------|----------|------------|--------|------');

  for (const c of courses) {
    await page.goto(`https://www.udemy.com/instructor/course/${c.id}/manage/basics`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(1500);

    const state = await page.evaluate(() => {
      const level = document.querySelector('select[name="instructional_level"]');
      const cat = document.querySelector('select[name="category"]');
      const subcat = document.querySelector('select[name="subcategory"]');
      const allText = document.body.innerText;
      const topicIdx = allText.indexOf('主な内容は何ですか');
      const topicSection = topicIdx > -1 ? allText.substring(topicIdx, topicIdx + 80) : '';
      const topicMatch = topicSection.match(/トピック\n(.+)\n/);
      const topic = topicMatch ? topicMatch[1] : '未設定';
      const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('udemycdn') && i.src.includes('course'));
      const hasImage = imgs.some(i => !i.src.includes('placeholder'));
      return {
        level: level?.options[level.selectedIndex]?.text || '?',
        cat: cat?.options[cat.selectedIndex]?.text || '?',
        subcat: subcat?.options[subcat.selectedIndex]?.text || '?',
        topic,
        hasImage
      };
    });

    const ok = state.level !== '-- レベルを選択 --' && state.cat === '開発' && state.subcat === 'データサイエンス' && state.topic !== '未設定' && state.hasImage;
    console.log(`C${c.num} | ${state.level} | ${state.cat} | ${state.subcat} | ${state.topic} | ${state.hasImage ? 'OK' : 'NG'} ${ok ? '' : ' *** FIX NEEDED ***'}`);
  }

  await page.close();
  console.log('\n確認完了');
}

main().catch(e => { console.error(e); process.exit(1); });
