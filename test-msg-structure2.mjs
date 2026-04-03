// メッセージページの正しいURLを探す
import { chromium } from 'playwright';

const CDP_PORT = 49332;

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  // まずコース管理のトップページでサイドバーのリンクを確認
  const url = 'https://www.udemy.com/instructor/course/7120797/manage/basics/';
  console.log(`遷移先: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // サイドバーのすべてのリンクを取得
  const links = await page.evaluate(() => {
    const anchors = document.querySelectorAll('a');
    return Array.from(anchors)
      .filter(a => a.href.includes('/manage/') || a.href.includes('/instructor/'))
      .map(a => ({
        text: a.textContent.trim().substring(0, 50),
        href: a.href
      }));
  });

  console.log('\n=== 管理ページのリンク一覧 ===');
  links.forEach(l => console.log(`  ${l.text} -> ${l.href}`));

  // コースメッセージに関連するリンクを探す
  const msgLinks = links.filter(l =>
    l.text.includes('メッセージ') || l.text.includes('message') || l.text.includes('Message') ||
    l.href.includes('message') || l.href.includes('communication')
  );
  console.log('\n=== メッセージ関連リンク ===');
  msgLinks.forEach(l => console.log(`  ${l.text} -> ${l.href}`));

  // サイドバーの全テキストを取得
  const sidebarText = await page.evaluate(() => {
    // サイドバーっぽい要素を探す
    const sidebar = document.querySelector('[class*="sidebar"], [class*="side-nav"], nav, [role="navigation"]');
    if (sidebar) return sidebar.innerText;
    // なければ左側の要素
    return '';
  });
  console.log('\n=== サイドバーテキスト ===');
  console.log(sidebarText.substring(0, 500));

  await page.screenshot({ path: '/tmp/udemy-basics-page.png', fullPage: true });
  console.log('\nスクリーンショット: /tmp/udemy-basics-page.png');

  // communicationsやsettingsなど別のパスを試す
  const testUrls = [
    'https://www.udemy.com/instructor/course/7120797/manage/communications/',
    'https://www.udemy.com/instructor/course/7120797/manage/course-messages/',
    'https://www.udemy.com/instructor/course/7120797/manage/settings/',
  ];

  for (const testUrl of testUrls) {
    await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const title = await page.title();
    const has404 = await page.locator('text=見つかりません').count();
    console.log(`\n${testUrl}`);
    console.log(`  タイトル: ${title}, 404: ${has404 > 0}`);
  }

  await browser.close();
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
