// プレミアム講師申請ページを確認
import { chromium } from 'playwright';

const CDP_PORT = 49332;

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  await page.goto('https://www.udemy.com/instructor/course/7120797/manage/pricing/', {
    waitUntil: 'networkidle', timeout: 30000
  });
  await page.waitForTimeout(2000);

  // 「プレミアム講師の申請を完了する」リンクのhrefを取得
  const linkInfo = await page.evaluate(() => {
    const links = document.querySelectorAll('a');
    const premiumLinks = Array.from(links).filter(a =>
      a.textContent.includes('プレミアム') || a.textContent.includes('Premium') || a.textContent.includes('premium')
    );
    return premiumLinks.map(a => ({
      text: a.textContent.trim(),
      href: a.href
    }));
  });

  console.log('=== プレミアム講師関連リンク ===');
  linkInfo.forEach(l => console.log(`  ${l.text} -> ${l.href}`));

  if (linkInfo.length > 0) {
    // リンク先に遷移
    console.log(`\n遷移: ${linkInfo[0].href}`);
    await page.goto(linkInfo[0].href, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: '/tmp/udemy-premium-apply.png', fullPage: true });
    console.log('スクリーンショット: /tmp/udemy-premium-apply.png');

    const pageText = await page.evaluate(() => {
      const main = document.querySelector('[class*="main-content"], main, [role="main"]') || document.body;
      return main.innerText.substring(0, 2000);
    });
    console.log('\n=== ページテキスト ===');
    console.log(pageText);
  }

  await browser.close();
}

main().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
