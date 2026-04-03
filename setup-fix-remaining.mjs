/**
 * basics保存に失敗した3コース (C05, C09, C16) + サブカテゴリ未設定コースの修正スクリプト
 * MCP Playwright経由ではなくCDP直接接続で操作
 */
import { chromium } from 'playwright';
import { existsSync } from 'fs';
import path from 'path';

const CDP_PORT = await getCdpPort();
const THUMB_DIR = '/Users/coelaqanth_006/Desktop/02forAI/15GenAI_Udemy/thumbnails';

// 全16コースの現在の状態を確認して必要な修正を行う
const courses = [
  { id: 7120797, num: '01', level: '0', topic: '生成AI' },
  { id: 7120883, num: '02', level: '1', topic: 'Claude' },
  { id: 7120817, num: '03', level: '2', topic: 'AI活用' },
  { id: 7120885, num: '04', level: '2', topic: 'Claude Code' },
  { id: 7120819, num: '05', level: '2', topic: 'GitHub Copilot' },
  { id: 7120821, num: '06', level: '2', topic: 'OpenAI Codex' },
  { id: 7120887, num: '07', level: '3', topic: 'Claude Code' },
  { id: 7120823, num: '08', level: '3', topic: 'OpenAI Codex' },
  { id: 7120827, num: '09', level: '2', topic: 'Dify' },
  { id: 7120829, num: '10', level: '1', topic: 'アプリ開発' },
  { id: 7120831, num: '11', level: '2', topic: 'プロンプトエンジニアリング' },
  { id: 7120833, num: '12', level: '3', topic: 'LangChain' },
  { id: 7120889, num: '13', level: '3', topic: 'MCP' },
  { id: 7120837, num: '14', level: '2', topic: 'AIセキュリティ' },
  { id: 7120839, num: '15', level: '2', topic: 'Gemini' },
  { id: 7120841, num: '16', level: '3', topic: 'AI駆動開発' },
];

async function getCdpPort() {
  const { execSync } = await import('child_process');
  const result = execSync(
    "ps aux | grep 'remote-debugging-port' | grep -v grep | grep -o 'remote-debugging-port=[0-9]*' | head -1 | cut -d= -f2"
  ).toString().trim();
  if (!result) throw new Error('Chrome CDPポートが見つかりません');
  return parseInt(result, 10);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function checkAndFixBasics(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/basics`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // 現在の状態を確認
  const state = await page.evaluate(() => {
    const level = document.querySelector('select[name="instructional_level"]');
    const cat = document.querySelector('select[name="category"]');
    const subcat = document.querySelector('select[name="subcategory"]');
    const allText = document.body.innerText;
    const topicIdx = allText.indexOf('主な内容は何ですか');
    const topicSection = topicIdx > -1 ? allText.substring(topicIdx, topicIdx + 80) : '';
    // トピックが設定済みかどうか。設定済みなら「トピック\n<トピック名>\n別のトピック」のパターン
    const hasTopicSet = /トピック\n.+\n別のトピック/.test(topicSection);
    const imgs = Array.from(document.querySelectorAll('img')).filter(i => i.src.includes('udemycdn') && i.src.includes('course'));
    const hasImage = imgs.some(i => !i.src.includes('placeholder'));
    return {
      level: level?.value,
      category: cat?.value,
      subcategory: subcat?.value,
      hasTopicSet,
      topicSection,
      hasImage,
    };
  });

  console.log(`  状態: level=${state.level} cat=${state.category} subcat=${state.subcategory} topic=${state.hasTopicSet} img=${state.hasImage}`);

  let needsSave = false;

  // レベルが未設定(-1)なら設定
  if (state.level === '-1') {
    await page.evaluate((val) => {
      const sel = document.querySelector('select[name="instructional_level"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      setter.call(sel, val);
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    }, course.level);
    console.log(`  レベル設定: ${course.level}`);
    needsSave = true;
    await sleep(500);
  }

  // カテゴリが未設定or開発でないなら「開発」(288)に
  if (state.category !== '288') {
    await page.evaluate(() => {
      const sel = document.querySelector('select[name="category"]');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      setter.call(sel, '288');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
    });
    console.log('  カテゴリ→開発 に設定');
    needsSave = true;
    await sleep(2000); // サブカテゴリの再レンダリングを待つ
  }

  // サブカテゴリが未設定(-1)ならデータサイエンス(558)に
  const currentSubcat = await page.evaluate(() => document.querySelector('select[name="subcategory"]')?.value);
  if (currentSubcat === '-1' || currentSubcat === undefined) {
    await sleep(1000);
    const subcatResult = await page.evaluate(() => {
      const sel = document.querySelector('select[name="subcategory"]');
      if (!sel) return 'no element';
      const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      setter.call(sel, '558');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      return sel.options[sel.selectedIndex]?.text;
    });
    console.log(`  サブカテゴリ→${subcatResult}`);
    needsSave = true;
    await sleep(500);
  }

  // トピックが未設定なら入力
  if (!state.hasTopicSet) {
    try {
      const topicInput = page.getByLabel('トピック');
      const isVisible = await topicInput.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        await topicInput.click();
        await sleep(300);
        await topicInput.fill(course.topic);
        await sleep(2000);
        const suggestion = page.locator('[role="listbox"] [role="option"]').first();
        const hasSuggestion = await suggestion.isVisible({ timeout: 3000 }).catch(() => false);
        if (hasSuggestion) {
          await suggestion.click();
          console.log(`  トピック: ${course.topic} (サジェスト選択)`);
        } else {
          await topicInput.press('Enter');
          console.log(`  トピック: ${course.topic} (Enter確定)`);
        }
        needsSave = true;
        await sleep(500);
      } else {
        console.log(`  トピック: 入力フィールドが見えない（設定済みの可能性）`);
      }
    } catch (e) {
      console.log(`  トピック失敗: ${e.message.substring(0, 80)}`);
    }
  } else {
    console.log(`  トピック: 設定済みスキップ`);
  }

  // 画像がplaceholderなら再アップロード
  if (!state.hasImage) {
    const thumbPath = path.join(THUMB_DIR, `c${course.num}-thumb.png`);
    if (existsSync(thumbPath)) {
      const fileInput = page.locator('input[type="file"][accept*=".png"]').first();
      await fileInput.setInputFiles(thumbPath);
      console.log(`  サムネイル: c${course.num}-thumb.png`);
      needsSave = true;
      // アップロード完了を確実に待つ
      await sleep(5000);
    }
  } else {
    console.log(`  サムネイル: 設定済みスキップ`);
  }

  // 保存
  if (needsSave) {
    // 保存ボタンが有効化されるまで少し待つ
    await sleep(1000);
    const saveResult = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent.trim() === '保存');
      if (!saveBtn) return 'ボタンなし';
      if (saveBtn.disabled) return 'disabled';
      saveBtn.click();
      return 'clicked';
    });
    console.log(`  保存: ${saveResult}`);
    if (saveResult === 'clicked') {
      await sleep(3000);
    }
    return saveResult === 'clicked';
  }
  console.log('  変更なし');
  return true;
}

async function main() {
  console.log(`CDP接続: http://127.0.0.1:${CDP_PORT}`);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = await context.newPage();
  page.on('dialog', async d => { try { await d.accept(); } catch {} });

  for (const course of courses) {
    console.log(`\nC${course.num} (ID: ${course.id})`);
    try {
      const saved = await checkAndFixBasics(page, course);
      console.log(`  結果: ${saved ? 'OK' : 'NG'}`);
    } catch (e) {
      console.log(`  エラー: ${e.message.substring(0, 100)}`);
    }
  }

  await page.close();
  console.log('\n完了');
}

main().catch(e => { console.error('致命的エラー:', e); process.exit(1); });
