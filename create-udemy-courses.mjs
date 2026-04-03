import { chromium } from 'playwright';

const courses = [
  { title: '【2026年版】Claude基礎 claude.ai完全ガイド Projects・Artifacts・API入門', category: '開発' },
  { title: '【2026年版】AI協働術 Cowork基礎 タスク分解・品質管理・チーム活用の型', category: '開発' },
  { title: '【2026年版】Claude Code基礎 ターミナルAI開発入門 CLAUDE.md・コマンド・MCP', category: '開発' },
  { title: '【2026年版】GitHub Copilot基礎 AI駆動開発の入口 補完・Chat・コメントドリブン', category: '開発' },
  { title: '【2026年版】OpenAI Codex基礎 CLIエージェント入門 自律実行・サンドボックス', category: '開発' },
  { title: '【2026年版】Claude Code応用 スキル・フック・エージェント開発', category: '開発' },
  { title: '【2026年版】OpenAI Codex応用 full-auto運用・リファクタリング・テスト自動化', category: '開発' },
  { title: '【2026年版】Dify実践 AIワークフロー構築 チャットボット・RAG・エージェント', category: '開発' },
  { title: '【2026年版】Vibe Coding入門 非エンジニアのためのアプリ開発', category: '開発' },
  { title: '【2026年版】プロンプトエンジニアリング実践 高度テクニック・評価サイクル', category: '開発' },
  { title: '【2026年版】RAG実践 LangChain/LangGraph完全ガイド ベクトルDB・検索精度', category: '開発' },
  { title: '【2026年版】MCP/A2A AIエージェント開発 MCPサーバー構築・マルチエージェント', category: '開発' },
  { title: '【2026年版】生成AIセキュリティ/ガバナンス実践 多層防御・ガイドライン策定', category: 'ITとソフトウェア' },
  { title: '【2026年版】Gemini & Google Workspace AI活用マスター NotebookLM・Deep Research', category: '仕事の生産性' },
  { title: '【2026年版】AI駆動開発マスター 3つのプロダクションプロジェクト構築', category: '開発' },
];

const browser = await chromium.connectOverCDP('http://localhost:49332');
const context = browser.contexts()[0];
const page = context.pages()[0];

for (let i = 0; i < courses.length; i++) {
  const c = courses[i];
  console.log(`Creating ${i+2}/16: ${c.title.slice(0,40)}...`);
  
  try {
    // Step 1: Navigate to create
    await page.goto('https://www.udemy.com/course/create/1', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    // Select "コース" radio
    await page.locator('label').filter({ hasText: 'コースビデオレクチャー' }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: '続ける' }).click();
    await page.waitForTimeout(1000);
    
    // Step 2: Title
    await page.getByRole('textbox', { name: 'コースタイトル' }).fill(c.title);
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '続ける' }).click();
    await page.waitForTimeout(1000);
    
    // Step 3: Category
    await page.getByLabel('コースのカテゴリー').selectOption([c.category]);
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: '続ける' }).click();
    await page.waitForTimeout(1000);
    
    // Step 4: Time
    await page.locator('label').filter({ hasText: 'かなり時間の融通が利く' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'コースを作成' }).click();
    await page.waitForTimeout(2000);
    
    console.log(`  OK: ${page.url()}`);
  } catch(e) {
    console.log(`  FAIL: ${e.message.slice(0,100)}`);
  }
}

console.log('All done');
