// メッセージページの正しいURL構造を調査
import { chromium } from 'playwright';

const CDP_PORT = 49332;

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const url = 'https://www.udemy.com/instructor/course/7120797/manage/communications/messages';
  console.log(`遷移先: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  await page.screenshot({ path: '/tmp/udemy-msg-correct.png', fullPage: true });
  console.log('スクリーンショット: /tmp/udemy-msg-correct.png');

  // ページ構造を調査
  const structure = await page.evaluate(() => {
    const result = {};

    // contenteditable
    const ce = document.querySelectorAll('[contenteditable="true"]');
    result.contenteditable = Array.from(ce).map(el => ({
      tag: el.tagName,
      className: el.className.substring(0, 120),
      text: el.textContent.substring(0, 80),
      parentClass: el.parentElement?.className?.substring(0, 100) || '',
      dataAttrs: Object.keys(el.dataset).join(', ')
    }));

    // textarea
    const ta = document.querySelectorAll('textarea');
    result.textareas = Array.from(ta).map(el => ({
      name: el.name,
      id: el.id,
      placeholder: el.placeholder?.substring(0, 80),
      value: el.value?.substring(0, 80),
      className: el.className.substring(0, 80)
    }));

    // textbox
    const tb = document.querySelectorAll('[role="textbox"]');
    result.textboxes = Array.from(tb).map(el => ({
      tag: el.tagName,
      className: el.className.substring(0, 120),
      text: el.textContent.substring(0, 80),
      dataAttrs: Object.keys(el.dataset).join(', ')
    }));

    // DraftJS
    const dc = document.querySelectorAll('[data-contents="true"]');
    result.dataContents = dc.length;

    // エディタっぽい要素を広く探す
    const editors = document.querySelectorAll('[class*="editor"], [class*="Editor"], [class*="rich-text"], [class*="RichText"], [class*="DraftEditor"], [class*="ql-editor"]');
    result.editorElements = Array.from(editors).map(el => ({
      tag: el.tagName,
      className: el.className.substring(0, 150),
      childCount: el.children.length,
      text: el.textContent.substring(0, 80)
    }));

    // ラベル
    const labels = document.querySelectorAll('label, h2, h3, h4, [class*="label"], [class*="heading"]');
    result.labels = Array.from(labels)
      .filter(el => el.textContent.length > 0 && el.textContent.length < 100)
      .map(el => ({
        tag: el.tagName,
        text: el.textContent.trim().substring(0, 80),
        forAttr: el.getAttribute('for') || ''
      }))
      .slice(0, 20);

    // 保存ボタン
    const buttons = document.querySelectorAll('button');
    result.saveButtons = Array.from(buttons)
      .filter(el => el.textContent.includes('Save') || el.textContent.includes('保存'))
      .map(el => ({
        text: el.textContent.trim().substring(0, 50),
        disabled: el.disabled,
        type: el.type
      }));

    // ページ内のテキスト（メッセージ関連）
    const bodyText = document.body.innerText;
    const relevantLines = bodyText.split('\n')
      .filter(l => l.includes('ウェルカム') || l.includes('修了') || l.includes('Welcome') || l.includes('Congrat') || l.includes('メッセージ') || l.includes('message'))
      .slice(0, 10);
    result.relevantText = relevantLines;

    return result;
  });

  console.log('\n=== ページ構造 ===');
  console.log(JSON.stringify(structure, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
