/**
 * Udemy全16コース 残り設定の一括投入スクリプト (v2)
 * React内部のnativeInputValueSetter + changeイベント発火方式
 *
 * basicsページ: レベル、サブカテゴリ、トピック、サムネイル画像
 * pricingページ: 価格帯選択
 * messagesページ: 保存ボタン押下
 */
import { chromium } from 'playwright';
import { existsSync } from 'fs';
import path from 'path';

const CDP_PORT = await getCdpPort();
const THUMB_DIR = '/Users/coelaqanth_006/Desktop/02forAI/15GenAI_Udemy/thumbnails';

const courses = [
  { id: 7120797, num: '01', level: 'all', topic: '生成AI' },
  { id: 7120883, num: '02', level: 'beginner', topic: 'Claude' },
  { id: 7120817, num: '03', level: 'intermediate', topic: 'AI活用' },
  { id: 7120885, num: '04', level: 'intermediate', topic: 'Claude Code' },
  { id: 7120819, num: '05', level: 'intermediate', topic: 'GitHub Copilot' },
  { id: 7120821, num: '06', level: 'intermediate', topic: 'OpenAI Codex' },
  { id: 7120887, num: '07', level: 'expert', topic: 'Claude Code' },
  { id: 7120823, num: '08', level: 'expert', topic: 'OpenAI Codex' },
  { id: 7120827, num: '09', level: 'intermediate', topic: 'Dify' },
  { id: 7120829, num: '10', level: 'beginner', topic: 'アプリ開発' },
  { id: 7120831, num: '11', level: 'intermediate', topic: 'プロンプトエンジニアリング' },
  { id: 7120833, num: '12', level: 'expert', topic: 'LangChain' },
  { id: 7120889, num: '13', level: 'expert', topic: 'MCP' },
  { id: 7120837, num: '14', level: 'intermediate', topic: 'AIセキュリティ' },
  { id: 7120839, num: '15', level: 'intermediate', topic: 'Gemini' },
  { id: 7120841, num: '16', level: 'expert', topic: 'AI駆動開発' },
];

// レベルキー → UdemyのselectのoptionのvalueAttribute
const LEVEL_VALUE = {
  all: '0',
  beginner: '1',
  intermediate: '2',
  expert: '3',
};

// サブカテゴリ「データサイエンス」のvalue
const SUBCAT_DATA_SCIENCE = '558';

// 価格帯 $27.99 のvalue
const PRICE_VALUE = '27.99';

async function getCdpPort() {
  const { execSync } = await import('child_process');
  const result = execSync(
    "ps aux | grep 'remote-debugging-port' | grep -v grep | grep -o 'remote-debugging-port=[0-9]*' | head -1 | cut -d= -f2"
  ).toString().trim();
  if (!result) throw new Error('Chrome CDPポートが見つかりません');
  return parseInt(result, 10);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * ReactのselectをnativeInputValueSetterで操作する
 * これによりReactのonChangeが正しく発火する
 */
async function setSelectViaReact(page, selector, value) {
  return page.evaluate(({ sel, val }) => {
    const select = document.querySelector(sel);
    if (!select) return { ok: false, error: `${sel} not found` };
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLSelectElement.prototype, 'value'
    ).set;
    nativeSetter.call(select, val);
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return { ok: true, value: select.value, text: select.options[select.selectedIndex]?.text };
  }, { sel: selector, val: value });
}

/**
 * 保存ボタンのクリックを試行。有効化されるまで少し待つ
 */
async function trySave(page, label) {
  // 保存ボタンが有効化されるのを少し待つ
  await sleep(500);
  const saved = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b => b.textContent.trim() === '保存');
    if (!saveBtn) return { ok: false, reason: 'ボタンなし' };
    if (saveBtn.disabled) return { ok: false, reason: 'disabled' };
    saveBtn.click();
    return { ok: true };
  });
  if (saved.ok) {
    console.log(`  [${label}] 保存ボタンをクリック`);
    await sleep(2500);
  } else {
    console.log(`  [${label}] 保存できず: ${saved.reason}`);
  }
  return saved.ok;
}

// basicsページの設定
async function setupBasics(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/basics`;
  console.log(`  [basics] ナビゲート`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // 1. レベル選択 (React native setter方式)
  try {
    const res = await setSelectViaReact(page, 'select[name="instructional_level"]', LEVEL_VALUE[course.level]);
    console.log(`  [basics] レベル: ${res.ok ? res.text : 'FAIL ' + res.error}`);
  } catch (e) {
    console.log(`  [basics] レベル選択失敗: ${e.message}`);
  }

  // 2. カテゴリ → サブカテゴリ選択
  try {
    const subcatResult = await page.evaluate((subcatVal) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      const catSelect = document.querySelector('select[name="category"]');
      // カテゴリが「開発」(288)でなければ先にセット
      if (catSelect && catSelect.value !== '288') {
        nativeSetter.call(catSelect, '288');
        catSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      // サブカテゴリの表示を待つ（同期的にはすぐ反映されないかもしれない）
      const subSelect = document.querySelector('select[name="subcategory"]');
      if (!subSelect) return { ok: false, error: 'サブカテゴリselect不在', catSet: true };
      nativeSetter.call(subSelect, subcatVal);
      subSelect.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, text: subSelect.options[subSelect.selectedIndex]?.text };
    }, SUBCAT_DATA_SCIENCE);

    // カテゴリを変更した場合、サブカテゴリが遅延レンダリングされる可能性
    if (!subcatResult.ok && subcatResult.catSet) {
      await sleep(1500);
      const retry = await page.evaluate((val) => {
        const subSelect = document.querySelector('select[name="subcategory"]');
        if (!subSelect) return { ok: false, error: 'リトライ: サブカテゴリselect不在' };
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
        nativeSetter.call(subSelect, val);
        subSelect.dispatchEvent(new Event('change', { bubbles: true }));
        return { ok: true, text: subSelect.options[subSelect.selectedIndex]?.text };
      }, SUBCAT_DATA_SCIENCE);
      console.log(`  [basics] カテゴリ→開発にセット / サブカテゴリ: ${retry.ok ? retry.text : 'FAIL ' + retry.error}`);
    } else {
      console.log(`  [basics] サブカテゴリ: ${subcatResult.ok ? subcatResult.text : 'FAIL ' + subcatResult.error}`);
    }
  } catch (e) {
    console.log(`  [basics] サブカテゴリ失敗: ${e.message}`);
  }

  // 3. トピック入力
  try {
    const topicInput = page.getByLabel('トピック');
    await topicInput.click();
    await sleep(300);
    await topicInput.fill(course.topic);
    await sleep(1500);
    // サジェストリストから最初の候補を選択
    const suggestion = page.locator('[role="listbox"] [role="option"]').first();
    const hasSuggestion = await suggestion.isVisible({ timeout: 3000 }).catch(() => false);
    if (hasSuggestion) {
      await suggestion.click();
      console.log(`  [basics] トピック: ${course.topic} (サジェスト選択)`);
    } else {
      await topicInput.press('Enter');
      console.log(`  [basics] トピック: ${course.topic} (Enter確定)`);
    }
    await sleep(500);
  } catch (e) {
    console.log(`  [basics] トピック失敗: ${e.message}`);
  }

  // 4. サムネイル画像アップロード
  try {
    const thumbPath = path.join(THUMB_DIR, `c${course.num}-thumb.png`);
    if (existsSync(thumbPath)) {
      const fileInput = page.locator('input[type="file"][accept*=".png"]').first();
      await fileInput.setInputFiles(thumbPath);
      console.log(`  [basics] サムネイル: c${course.num}-thumb.png`);
      await sleep(4000); // アップロード完了待ち
    } else {
      console.log(`  [basics] サムネイルなし: ${thumbPath}`);
    }
  } catch (e) {
    console.log(`  [basics] サムネイル失敗: ${e.message}`);
  }

  // 5. 保存
  return trySave(page, 'basics');
}

// pricingページの設定
async function setupPricing(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/pricing`;
  console.log(`  [pricing] ナビゲート`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // 価格帯selectをReact方式で操作
  // name属性がないためoption数で特定
  try {
    const res = await page.evaluate((priceVal) => {
      const selects = document.querySelectorAll('select');
      // 価格帯selectはオプション数が30前後（通貨selectと区別）
      const priceSelect = Array.from(selects).find(s => {
        const opts = Array.from(s.options);
        return opts.some(o => o.value === '27.99');
      });
      if (!priceSelect) return { ok: false, error: '価格帯selectが見つからない' };
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
      nativeSetter.call(priceSelect, priceVal);
      priceSelect.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, text: priceSelect.options[priceSelect.selectedIndex]?.text };
    }, PRICE_VALUE);
    console.log(`  [pricing] 価格帯: ${res.ok ? res.text : 'FAIL ' + res.error}`);
  } catch (e) {
    console.log(`  [pricing] 価格帯失敗: ${e.message}`);
  }

  return trySave(page, 'pricing');
}

// messagesページ
async function setupMessages(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/communications/messages`;
  console.log(`  [messages] ナビゲート`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // メッセージの入力状態を確認
  const msgStatus = await page.evaluate(() => {
    const textboxes = document.querySelectorAll('[contenteditable="true"]');
    return Array.from(textboxes).map((tb, i) => ({
      index: i,
      text: tb.textContent?.substring(0, 50) || '',
      empty: !tb.textContent?.trim()
    }));
  });
  const welcomeEmpty = msgStatus[0]?.empty ?? true;
  const congratsEmpty = msgStatus[1]?.empty ?? true;
  console.log(`  [messages] 歓迎: ${welcomeEmpty ? '空' : '入力済み'} / お祝い: ${congratsEmpty ? '空' : '入力済み'}`);

  return trySave(page, 'messages');
}

// メイン処理
async function main() {
  console.log(`CDP接続: http://127.0.0.1:${CDP_PORT}`);
  const browser = await chromium.connectOverCDP(`http://127.0.0.1:${CDP_PORT}`);
  const contexts = browser.contexts();
  if (contexts.length === 0) throw new Error('ブラウザコンテキストが見つかりません');

  const context = contexts[0];
  const page = await context.newPage();

  // beforeunloadダイアログを自動承認（1回だけ登録）
  page.on('dialog', async dialog => {
    try { await dialog.accept(); } catch { /* 既にhandled */ }
  });

  const results = [];

  for (const course of courses) {
    console.log(`\n== C${course.num} (ID: ${course.id}) ==`);
    const result = {
      num: course.num,
      id: course.id,
      basicsSaved: false,
      pricingSaved: false,
      messagesSaved: false,
    };

    try { result.basicsSaved = await setupBasics(page, course); } catch (e) { console.log(`  [basics] エラー: ${e.message}`); }
    try { result.pricingSaved = await setupPricing(page, course); } catch (e) { console.log(`  [pricing] エラー: ${e.message}`); }
    try { result.messagesSaved = await setupMessages(page, course); } catch (e) { console.log(`  [messages] エラー: ${e.message}`); }

    results.push(result);
    await sleep(500);
  }

  // 結果サマリ
  console.log('\n========================================');
  console.log('結果サマリ');
  console.log('========================================');
  for (const r of results) {
    const b = r.basicsSaved ? 'SAVED' : 'NOT_SAVED';
    const p = r.pricingSaved ? 'SAVED' : 'NOT_SAVED';
    const m = r.messagesSaved ? 'SAVED' : 'NOT_SAVED';
    console.log(`C${r.num} (${r.id}): basics=${b} pricing=${p} messages=${m}`);
  }

  await page.close();
  console.log('\n処理完了');
}

main().catch(e => {
  console.error('致命的エラー:', e);
  process.exit(1);
});
