/**
 * C04, C06, C08 の description を修正してPATCH再送
 * - .md がURLリンクと誤認される問題を回避
 * - C08は100文字以上に拡充
 */
import { chromium } from 'playwright';

const CDP_PORT = 49332;

const fixes = [
  {
    id: 7120885, code: 'C04', title: 'Claude Code基礎',
    headline: 'ターミナルAI開発入門。CLAUDE.md/コマンド/MCPを8時間で習得',
    description: '<p>Claude Codeの基本操作からプロジェクトルールファイル設計、カスタムコマンド、MCP連携まで。ターミナルベースのAI開発を体系的に学ぶ日本語唯一のコースです。</p><p>Read/Edit/Write/Bash/Grepの5大ツールの使い分け、プロジェクトルール設計パターン、スラッシュコマンド作成、MCPサーバー接続と実践的な開発ワークフローを8時間で習得します。</p>',
    welcome: 'Claude Code基礎へようこそ!Node.js 18以上のインストールとAnthropicアカウントが必要です。Max planまたはAPI従量課金でご利用ください。',
    congrats: 'Claude Codeの基本操作からMCP連携まで習得しました。次はClaude Code応用でスキル/フック/エージェント開発に進みましょう。'
  },
  {
    id: 7120821, code: 'C06', title: 'Codex基礎',
    headline: 'CLIエージェント入門。自律実行/サンドボックスを8時間で習得',
    description: '<p>OpenAI Codex CLIの基本操作と自律実行モード(suggest/auto-edit/full-auto)を学ぶコースです。サンドボックスによる安全な実行環境が特徴です。</p><p>エージェント設定ファイルの設計、Copilot/Claude Codeとの使い分け、実践的なコード生成ワークフローも扱います。</p>',
    welcome: 'Codex基礎へようこそ!Node.js 22以上とOpenAI APIキーが必要です。',
    congrats: 'Codex CLIの基本からfull-autoモードまで習得しました。次はCodex応用で大規模リファクタリングに進みましょう。'
  },
  {
    id: 7120823, code: 'C08', title: 'Codex応用',
    headline: 'full-auto運用/リファクタリング/テスト自動化を10時間で習得',
    description: '<p>Codexの自律実行機能を本格活用するコースです。full-autoの安全運用、大規模リファクタリング、テスト自動生成、ツール横断ワークフロー、CI/CD統合まで幅広く扱います。</p><p>承認フローとロールバック戦略を組み込んだ安全な自律実行パターン、既存コードベースの段階的リファクタリング手法、テストカバレッジ自動向上、Copilot/Claude Codeとの3ツール併用ワークフローを10時間で実践的に習得します。</p>',
    welcome: 'Codex応用へようこそ!C06 Codex基礎の修了が前提です。リファクタリング対象のプロジェクトをご準備ください。',
    congrats: 'full-autoの安全運用からCI/CD統合まで習得しました。AI駆動開発マスターで全技術を統合したプロジェクトに挑戦しましょう。'
  }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  const cookies = await page.context().cookies('https://www.udemy.com');
  const csrfToken = cookies.find(c => c.name === 'csrftoken').value;
  console.log('CSRFトークン取得済み');

  if (!page.url().includes('udemy.com')) {
    await page.goto('https://www.udemy.com/instructor/courses/', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
  }

  for (const course of fixes) {
    console.log(`[${course.code}] ${course.title} (ID: ${course.id}) ... PATCH中`);
    const payload = {
      headline: course.headline,
      description: course.description,
      welcome_message: course.welcome,
      completion_message: course.congrats
    };

    const result = await page.evaluate(async ({ courseId, payload, csrfToken }) => {
      const res = await fetch(`/api-2.0/courses/${courseId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(payload)
      });
      return { status: res.status, statusText: res.statusText, body: await res.text().catch(() => '') };
    }, { courseId: course.id, payload, csrfToken });

    console.log(`  -> ${result.status} ${result.statusText}`);
    if (result.status !== 200) {
      console.log(`  -> body: ${result.body.substring(0, 300)}`);
    }
    await sleep(500);
  }

  console.log('\n修正PATCH完了');
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
