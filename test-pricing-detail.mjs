// 価格ページの保存ボタンが有効にならない原因を調査
import { chromium } from 'playwright';

const CDP_PORT = 49332;

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  await page.goto('https://www.udemy.com/instructor/course/7120797/manage/pricing/', {
    waitUntil: 'networkidle', timeout: 30000
  });
  await page.waitForTimeout(3000);

  // ページ全体のテキストを確認
  const bodyText = await page.evaluate(() => {
    const main = document.querySelector('[class*="main-content"], main, [role="main"]') || document.body;
    return main.innerText.substring(0, 1500);
  });
  console.log('=== ページテキスト ===');
  console.log(bodyText);

  // 警告/通知メッセージがあるか
  const alerts = await page.evaluate(() => {
    const alertEls = document.querySelectorAll('[class*="alert"], [class*="warning"], [class*="banner"], [class*="notice"], [role="alert"]');
    return Array.from(alertEls).map(el => el.textContent.trim().substring(0, 200));
  });
  console.log('\n=== アラート/警告 ===');
  alerts.forEach(a => console.log(`  ${a}`));

  // 保存ボタンの状態を詳しく調べる
  const btnInfo = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const saveBtn = btns.find(b => b.textContent.includes('保存'));
    if (!saveBtn) return { found: false };
    return {
      found: true,
      disabled: saveBtn.disabled,
      className: saveBtn.className,
      parentClassName: saveBtn.parentElement?.className,
      ariaDisabled: saveBtn.getAttribute('aria-disabled'),
      style: saveBtn.style.cssText
    };
  });
  console.log('\n=== 保存ボタン詳細 ===');
  console.log(JSON.stringify(btnInfo, null, 2));

  // select要素のイベントを手動で発火させてみる
  console.log('\n=== select変更+イベント発火テスト ===');

  // まず価格帯selectを特定
  const selectInfo = await page.evaluate(() => {
    const selects = document.querySelectorAll('select');
    return Array.from(selects).map((s, i) => ({
      index: i,
      id: s.id,
      value: s.value,
      optionCount: s.options.length,
      firstOptions: Array.from(s.options).slice(0, 5).map(o => `${o.value}:${o.text}`)
    }));
  });
  console.log(JSON.stringify(selectInfo, null, 2));

  // Reactのイベントシステムに対応した変更方法を試す
  await page.evaluate(() => {
    const selects = document.querySelectorAll('select');
    const priceSelect = selects[1]; // 2つ目が価格帯
    if (!priceSelect) return;

    // React用のnativeInputValueSetter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
    nativeInputValueSetter.call(priceSelect, '19.99');

    // 各種イベントを発火
    priceSelect.dispatchEvent(new Event('input', { bubbles: true }));
    priceSelect.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForTimeout(1000);

  // 保存ボタンの状態を再確認
  const btnInfo2 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const saveBtn = btns.find(b => b.textContent.includes('保存'));
    return saveBtn ? { disabled: saveBtn.disabled } : { found: false };
  });
  console.log(`\nReactイベント後の保存ボタン: disabled=${btnInfo2.disabled}`);

  // スクリーンショット
  await page.screenshot({ path: '/tmp/udemy-pricing-detail.png', fullPage: true });

  await browser.close();
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
