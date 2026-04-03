// メッセージページのUI構造を調査するテストスクリプト
import { chromium } from 'playwright';

const CDP_PORT = 49332;

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // メッセージページに遷移
  const url = 'https://www.udemy.com/instructor/course/7120797/manage/messages/';
  console.log(`遷移先: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // スクリーンショット
  await page.screenshot({ path: '/tmp/udemy-msg-structure.png', fullPage: true });
  console.log('スクリーンショット: /tmp/udemy-msg-structure.png');

  // ページ構造を調査
  const structure = await page.evaluate(() => {
    const result = {};

    // contenteditable
    const ce = document.querySelectorAll('[contenteditable="true"]');
    result.contenteditable = Array.from(ce).map(el => ({
      tag: el.tagName,
      className: el.className.substring(0, 100),
      text: el.textContent.substring(0, 50),
      parent: el.parentElement?.className?.substring(0, 80) || ''
    }));

    // textareas
    const ta = document.querySelectorAll('textarea');
    result.textareas = Array.from(ta).map(el => ({
      name: el.name,
      id: el.id,
      placeholder: el.placeholder?.substring(0, 50),
      value: el.value?.substring(0, 50)
    }));

    // role=textbox
    const tb = document.querySelectorAll('[role="textbox"]');
    result.textboxes = Array.from(tb).map(el => ({
      tag: el.tagName,
      className: el.className.substring(0, 100),
      text: el.textContent.substring(0, 50)
    }));

    // DraftJS data-contents
    const dc = document.querySelectorAll('[data-contents="true"]');
    result.dataContents = Array.from(dc).map(el => ({
      tag: el.tagName,
      className: el.className.substring(0, 100),
      text: el.textContent.substring(0, 50)
    }));

    // ラベル/見出し要素
    const headings = document.querySelectorAll('h2, h3, h4, label');
    result.headings = Array.from(headings)
      .filter(el => el.textContent.includes('メッセージ') || el.textContent.includes('message') || el.textContent.includes('Message') || el.textContent.includes('Welcome') || el.textContent.includes('Congrat') || el.textContent.includes('ウェルカム') || el.textContent.includes('修了'))
      .map(el => ({
        tag: el.tagName,
        text: el.textContent.substring(0, 80)
      }));

    // 保存ボタン
    const buttons = document.querySelectorAll('button');
    result.buttons = Array.from(buttons)
      .filter(el => el.textContent.includes('Save') || el.textContent.includes('保存'))
      .map(el => ({
        text: el.textContent.trim().substring(0, 50),
        disabled: el.disabled,
        className: el.className.substring(0, 80)
      }));

    // フォーム全体の構造
    const forms = document.querySelectorAll('form');
    result.formCount = forms.length;

    return result;
  });

  console.log('\n=== ページ構造 ===');
  console.log(JSON.stringify(structure, null, 2));

  // 価格ページも確認
  const priceUrl = 'https://www.udemy.com/instructor/course/7120797/manage/pricing/';
  console.log(`\n\n遷移先: ${priceUrl}`);
  await page.goto(priceUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: '/tmp/udemy-pricing-structure.png', fullPage: true });
  console.log('スクリーンショット: /tmp/udemy-pricing-structure.png');

  const priceStructure = await page.evaluate(() => {
    const result = {};

    // ラジオボタン
    const radios = document.querySelectorAll('input[type="radio"]');
    result.radios = Array.from(radios).map(el => ({
      name: el.name,
      value: el.value,
      checked: el.checked,
      id: el.id,
      label: el.labels?.[0]?.textContent?.substring(0, 50) || ''
    }));

    // セレクト要素
    const selects = document.querySelectorAll('select');
    result.selects = Array.from(selects).map(el => ({
      name: el.name,
      id: el.id,
      options: Array.from(el.options).slice(0, 10).map(o => ({ value: o.value, text: o.text.substring(0, 50) }))
    }));

    // ボタン
    const buttons = document.querySelectorAll('button');
    result.buttons = Array.from(buttons)
      .filter(el => el.textContent.includes('Save') || el.textContent.includes('保存'))
      .map(el => ({
        text: el.textContent.trim().substring(0, 50),
        disabled: el.disabled
      }));

    // 価格関連テキスト
    const allText = document.body.innerText;
    const pricingLines = allText.split('\n').filter(l =>
      l.includes('Free') || l.includes('Paid') || l.includes('無料') || l.includes('有料') || l.includes('Price') || l.includes('価格') || l.includes('Premium')
    );
    result.pricingText = pricingLines.slice(0, 10);

    return result;
  });

  console.log('\n=== 価格ページ構造 ===');
  console.log(JSON.stringify(priceStructure, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
