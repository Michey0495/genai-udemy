/**
 * prereqs/audienceの追加入力欄を「応答に追加します」ボタンで展開して入力する修正スクリプト
 *
 * Udemyのgoalsページ構造:
 * - goals: 4入力欄（固定）
 * - prereqs: 1入力欄（デフォルト）+ 「応答に追加します」ボタンで追加
 * - audience: 1入力欄（デフォルト）+ 「応答に追加します」ボタンで追加
 *
 * data-purpose属性:
 * - learn-goal-input-answer-list--{N}: goals
 * - requirements-input-answer-list--{N}: prereqs
 * - target-student-input-answer-list--{N}: audience
 */
import { chromium } from 'playwright';

const CDP_PORT = 49332;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const courses = [
  {
    id: 7120883, code: 'C02', title: 'Claude基礎',
    goals: ['Claudeの特徴を理解し他LLMと使い分けられる','Claude Projectsで業務特化AIを構築できる','Artifactsでインタラクティブな成果物を生成できる','Claude APIで自動化スクリプトを書ける'],
    prereqs: ['ChatGPT等の基本的なAI利用経験'],
    audience: ['Claudeを業務で本格的に使いこなしたい方','Claude APIで自動化に取り組みたいエンジニア']
  },
  {
    id: 7120817, code: 'C03', title: 'Cowork基礎',
    goals: ['業務をAI向きと人間向きに分解し最適な役割分担を設計できる','AIの出力を5Cチェックで検証し品質管理できる','チーム共有プロンプトライブラリを設計できる','AI活用の心理的障壁を特定し対処法を実行できる'],
    prereqs: ['C01修了またはAIツールの基本利用経験'],
    audience: ['チームでのAI活用を推進したい方','AI導入に抵抗感があるメンバーを支援したい方']
  },
  {
    id: 7120885, code: 'C04', title: 'Claude Code基礎',
    goals: ['Claude Codeをインストールし基本操作(Read/Edit/Write/Bash/Grep)を使いこなせる','プロジェクトルールファイルを設計しAIの行動を制御できる','カスタムスラッシュコマンドを作成し開発を効率化できる','MCPサーバーを接続し外部ツールとClaude Codeを統合できる'],
    prereqs: ['ターミナル/コマンドラインの基本操作','Node.js環境のセットアップ経験'],
    audience: ['Claude Codeでターミナル開発を始めたいエンジニア','AI開発ツールの生産性を最大化したい方']
  },
  {
    id: 7120819, code: 'C05', title: 'Copilot基礎',
    goals: ['Copilotのインラインサジェストを的確に受入れ/拒否できる','Copilot Chatでコード説明/リファクタ/エラー解析ができる','コメントドリブン開発でコメントから実装を生成できる','AIが生成したテストの品質を評価し改善できる'],
    prereqs: ['VS Codeの基本操作','何らかのプログラミング言語の基礎知識'],
    audience: ['GitHub Copilotを使い始めたいエンジニア','AI補完を日常開発に組み込みたい方']
  },
  {
    id: 7120821, code: 'C06', title: 'Codex基礎',
    goals: ['Codex CLIの3つの実行モードを理解し使い分けられる','エージェント設定ファイルを設計しCodexの動作をルールで制御できる','サンドボックスの仕組みを理解し安全に自律実行できる','Copilot/Claude Codeとの得意領域の違いを判断できる'],
    prereqs: ['ターミナルの基本操作','Node.js環境'],
    audience: ['OpenAI Codexでターミナル開発を始めたいエンジニア','自律実行型AI開発に興味がある方']
  },
  {
    id: 7120887, code: 'C07', title: 'Claude Code応用',
    goals: ['カスタムスキルを設計し再利用可能な指示セットを作成できる','フック(PreToolUse/PostToolUse/Stop)でイベント駆動自動化ができる','サブエージェントを起動し並列タスク実行を設計できる','仕様駆動開発の型(メモから仕様書から実装からテスト)を実践できる'],
    prereqs: ['C04 Claude Code基礎の修了','Git/GitHub基礎知識'],
    audience: ['Claude Codeをプロダクション開発で使いたいエンジニア','チーム開発にClaude Codeを導入したい方']
  },
  {
    id: 7120823, code: 'C08', title: 'Codex応用',
    goals: ['full-autoモードの安全運用(承認フロー/ロールバック)を設計できる','既存コードの大規模リファクタリングをCodexで安全に実行できる','テスト自動生成でカバレッジを向上させられる','Copilot/Claude Codeとの3ツール横断ワークフローを設計できる'],
    prereqs: ['C06 Codex基礎の修了','テスト駆動開発の基礎知識'],
    audience: ['Codexをプロダクション開発で使いたいエンジニア','レガシーコードのリファクタリングに取り組む方']
  },
  {
    id: 7120827, code: 'C09', title: 'Dify実践',
    goals: ['Difyでチャットボット(基本応答/ペルソナ/RAG付き)を構築できる','ワークフロー(ノード設計/条件分岐/外部連携)を設計できる','RAGナレッジベースのチャンク戦略と検索精度をチューニングできる','エージェントモードでツール呼出しと自律実行を実装できる'],
    prereqs: ['AIの基本的な利用経験','APIキーの取得方法がわかること'],
    audience: ['コードを書かずにAIアプリを作りたい方','業務自動化ワークフローを構築したい方']
  },
  {
    id: 7120829, code: 'C10', title: 'Vibe Coding',
    goals: ['AIに自然言語で指示してWebアプリのプロトタイプを作成できる','要件を言語化しAIに伝わる指示文に変換できる','作ったアプリをVercel/Netlifyにデプロイして公開できる','プロトタイプを武器にベンダーと対等に仕様を詰められる'],
    prereqs: ['PCの基本操作。プログラミング経験は一切不要'],
    audience: ['コードが書けないがアプリを作りたい企画/事業開発職','業務改善ツールを自分で作りたいビジネスパーソン']
  },
  {
    id: 7120831, code: 'C11', title: 'プロンプトエンジニアリング',
    goals: ['高度テクニック(ToT/ReAct/メタプロンプト)を実務で使いこなせる','マルチモーダルプロンプト(画像/PDF/音声)を設計できる','Gem/GPTs/Claude Projectsで業務特化AIを構築できる','プロンプトのA/Bテストと5軸スコアリングで継続改善できる'],
    prereqs: ['C01修了相当のプロンプト基礎知識'],
    audience: ['プロンプト技法を体系的に深めたい方','業務別のプロンプトテンプレートが欲しい方']
  },
  {
    id: 7120833, code: 'C12', title: 'RAG実践',
    goals: ['RAGアーキテクチャを理解し適切な設計パターンを選択できる','LangChain(LCEL)でRAGパイプラインを構築できる','チャンク戦略と検索精度(Hybrid Search/Re-ranking)をチューニングできる','LangGraphでマルチステップRAG(Self-RAG/Adaptive)を実装できる'],
    prereqs: ['Python基礎(関数/クラス/pip)','APIの基本概念'],
    audience: ['RAGシステムを構築したいエンジニア','社内ドキュメント検索をAIで改善したい方']
  },
  {
    id: 7120889, code: 'C13', title: 'MCP/A2A',
    goals: ['MCPサーバーをTypeScript SDKで自作しツールを定義できる','MCPクライアント(Claude Desktop/Claude Code)と接続できる','A2AプロトコルでAgent Cardを設計しエージェント間連携を構築できる','マルチエージェントシステム(オーケストレーター型)を設計/実装できる'],
    prereqs: ['TypeScriptまたはPythonの基礎','C04またはC06の修了推奨'],
    audience: ['AIエージェント開発に取り組みたいエンジニア','MCP/A2Aプロトコルを実装したい方']
  },
  {
    id: 7120837, code: 'C14', title: 'セキュリティ',
    goals: ['プロンプトインジェクションの攻撃分類と多層防御パターンを実装できる','データ分類(公開/社内限定/機密/極秘)に基づくAI利用ルールを策定できる','AI利用ガイドラインを策定フレームワークに沿って作成できる','AIインシデントの対応フロー(検知/初動/調査/報告/再発防止)を設計できる'],
    prereqs: ['C01修了相当のセキュリティ基礎知識','情報セキュリティの基本概念'],
    audience: ['社内AI利用ガイドラインを策定する担当者','情報セキュリティ部門の方','AI導入のリスク管理を担う管理職']
  },
  {
    id: 7120839, code: 'C15', title: 'Gemini/365',
    goals: ['NotebookLMで複数ソースを横断分析しFAQやAudio Overviewを生成できる','Sheets x Geminiで自然言語からデータ分析/関数生成/グラフ作成ができる','Deep Researchで構造化された市場調査レポートを自動生成できる','Gemで業務特化のパーソナルAIを構築し運用できる'],
    prereqs: ['Google Workspace(Gmail/Docs/Sheets)の基本操作'],
    audience: ['Google Workspaceを日常的に使うビジネスパーソン','NotebookLMやDeep Researchを活用したい方']
  },
  {
    id: 7120841, code: 'C16', title: 'AI駆動開発マスター',
    goals: ['コンテキストエンジニアリング(4層コンテキストモデル)を設計できる','SaaS型Webアプリを仕様駆動開発で完成させられる','RAG搭載チャットボット(LangGraph+Dify+Slack)を構築できる','マルチエージェントシステム(MCP+A2A)をプロダクション運用できる'],
    prereqs: ['Layer 1-2の複数コース修了','Web開発の基礎知識(HTML/CSS/JavaScript)','Python基礎'],
    audience: ['全技術を統合した実践力を身につけたいエンジニア','AI開発のポートフォリオを作りたい方']
  }
];

async function fillSection(page, sectionPrefix, items) {
  // 現在のセクションの入力欄を取得
  let inputs = await page.locator(`input[data-purpose^="${sectionPrefix}"]`).all();

  for (let i = 0; i < items.length; i++) {
    // 入力欄が足りない場合、「応答に追加します」ボタンを押す
    if (i >= inputs.length) {
      // セクション内の「応答に追加します」ボタンを探す
      // 該当セクションの最後の入力欄の近くにあるボタンを特定
      const lastInput = inputs[inputs.length - 1];
      const addButton = page.locator(`button:has-text("応答に追加します")`);
      const addButtons = await addButton.all();

      // セクション別に適切なボタンを押す
      // goals=0番目, prereqs=1番目, audience=2番目
      let btnIdx = 0;
      if (sectionPrefix === 'requirements-input') btnIdx = 1;
      if (sectionPrefix === 'target-student-input') btnIdx = 2;

      // ボタン数が足りない場合は残っているボタンで
      if (btnIdx < addButtons.length) {
        await addButtons[btnIdx].click();
        await sleep(500);
      }

      // 入力欄を再取得
      inputs = await page.locator(`input[data-purpose^="${sectionPrefix}"]`).all();
    }

    if (i < inputs.length) {
      await inputs[i].click();
      await inputs[i].fill('');
      await inputs[i].fill(items[i]);
      await sleep(300);
    } else {
      console.log(`    警告: ${sectionPrefix} の${i+1}番目の入力欄が見つかりません`);
    }
  }
}

async function main() {
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  for (const course of courses) {
    console.log(`[${course.code}] ${course.title} (ID: ${course.id})`);

    const url = `https://www.udemy.com/instructor/course/${course.id}/manage/goals/`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);

    // goals（学習目標）入力
    console.log('  goals入力中...');
    await fillSection(page, 'learn-goal-input', course.goals);

    // prereqs（前提条件）入力
    console.log('  prereqs入力中...');
    await fillSection(page, 'requirements-input', course.prereqs);

    // audience（対象者）入力
    console.log('  audience入力中...');
    await fillSection(page, 'target-student-input', course.audience);

    // 保存
    await sleep(500);
    const saveBtn = page.locator('button:has-text("保存")').first();
    if (await saveBtn.isEnabled()) {
      await saveBtn.click();
      await sleep(2000);
      console.log('  -> 保存完了');
    } else {
      // 変更がない場合はdisabled
      console.log('  -> 保存ボタンdisabled（変更なしの可能性）');
      // input にフォーカスして値を再入力して変更をトリガー
      const firstGoal = page.locator('input[data-purpose^="learn-goal-input"]').first();
      if (await firstGoal.count() > 0) {
        const val = await firstGoal.inputValue();
        await firstGoal.fill('');
        await firstGoal.fill(val);
        await sleep(500);
        if (await saveBtn.isEnabled()) {
          await saveBtn.click();
          await sleep(2000);
          console.log('  -> 再トリガー後に保存完了');
        } else {
          console.log('  -> それでもdisabled');
        }
      }
    }
  }

  console.log('\n全コースのgoals修正完了');
  await browser.close();
}

main().catch(e => { console.error(e); process.exit(1); });
