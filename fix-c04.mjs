import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:49332');
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const cookies = await page.context().cookies('https://www.udemy.com');
  const csrfToken = cookies.find(c => c.name === 'csrftoken').value;

  if (!page.url().includes('udemy.com')) {
    await page.goto('https://www.udemy.com/instructor/courses/', { waitUntil: 'networkidle', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
  }

  // headlineとdescriptionの両方から .md を排除
  const payload = {
    headline: 'ターミナルAI開発入門。ルールファイル/コマンド/MCPを8時間で習得',
    description: '<p>Claude Codeの基本操作からプロジェクトルールファイル設計、カスタムコマンド、MCP連携まで。ターミナルベースのAI開発を体系的に学ぶ日本語唯一のコースです。</p><p>Read/Edit/Write/Bash/Grepの5大ツールの使い分け、プロジェクトルール設計パターン、スラッシュコマンド作成、MCPサーバー接続と実践的な開発ワークフローを8時間で習得します。</p>',
    welcome_message: 'Claude Code基礎へようこそ!Node.js 18以上のインストールとAnthropicアカウントが必要です。Max planまたはAPI従量課金でご利用ください。',
    completion_message: 'Claude Codeの基本操作からMCP連携まで習得しました。次はClaude Code応用でスキル/フック/エージェント開発に進みましょう。'
  };

  console.log('C04 PATCH中...');
  const result = await page.evaluate(async ({ payload, csrfToken }) => {
    const res = await fetch('/api-2.0/courses/7120885/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
      body: JSON.stringify(payload)
    });
    return { status: res.status, body: await res.text().catch(() => '') };
  }, { payload, csrfToken });

  console.log(`  -> ${result.status}`);
  if (result.status !== 200) console.log(`  -> ${result.body.substring(0, 300)}`);

  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
