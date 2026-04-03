/**
 * Udemy全16コースの設定一括投入スクリプト
 * - Part 1: API PATCHでheadline/description/welcome_message/completion_messageを設定
 * - Part 2: UI操作でgoals/prereqs/audienceを設定
 */
import { chromium } from 'playwright';

const CDP_PORT = 49332;

const courses = [
  {
    id: 7120797, code: 'C01', title: '生成AI完全入門',
    headline: '仕組み/トレンド/ツール比較/プロンプト/セキュリティを10時間で体系的に学ぶ',
    description: '<p>生成AIを業務で使う前に知っておくべきことを全て詰め込みました。</p><p>LLMの仕組みから2026年のトレンド、6つの主要ツール比較、プロンプトの3つの型、ビジネス活用6パターン、セキュリティ/ガバナンス基礎、資格ロードマップまでを10時間で体系的に学びます。</p><p>各セクションには「講師デモ」と「自走チャレンジ」の2段構成を採用。最後のプロジェクトでは業務改善提案書とカスタムAIアシスタントを作成します。</p>',
    welcome: '生成AI完全入門へようこそ!仕組みからセキュリティまで体系的に学びます。ハンズオンは必ず手を動かしてください。自走チャレンジでは動画を止めて自分で取り組んでからお進みください。',
    congrats: 'コース修了おめでとうございます!次のステップとしてClaude基礎やCopilot基礎などツール特化コースに進むことをお勧めします。',
    goals: ['LLMの仕組みを理解しハルシネーションのリスクを正しく認識できる','ChatGPT/Claude/Gemini/Copilotを目的に応じて選択できる','プロンプトの3つの型を使い分けて業務効率化ができる','セキュリティ4大リスクを理解し社内ルール設計の出発点を作れる'],
    prereqs: ['PCの基本操作ができること。プログラミング経験は不要'],
    audience: ['生成AIを業務で使い始めたいビジネスパーソン','体系的に学んだことがない方','AI導入を検討している管理職'],
    skipGoals: true
  },
  {
    id: 7120883, code: 'C02', title: 'Claude基礎',
    headline: 'Projects/Artifacts/APIまで。Claudeを業務で使い倒すための8時間',
    description: '<p>Anthropic社のClaudeの全機能を体系的に学ぶコースです。基本操作からProjects、Artifacts、API入門まで8時間で習得します。</p><p>Opus/Sonnet/Haikuモデルの使い分け、Extended Thinking、データポリシー比較も扱います。</p>',
    welcome: 'Claude基礎へようこそ!Claudeの全機能を体系的に学びます。API演習にはAnthropic Consoleのアカウントが必要です。',
    congrats: 'Claudeの基本操作からProjects、Artifacts、APIまで習得しました。次はClaude Code基礎やCowork基礎をお勧めします。',
    goals: ['Claudeの特徴を理解し他LLMと使い分けられる','Claude Projectsで業務特化AIを構築できる','Artifactsでインタラクティブな成果物を生成できる','Claude APIで自動化スクリプトを書ける'],
    prereqs: ['ChatGPT等の基本的なAI利用経験'],
    audience: ['Claudeを業務で本格的に使いこなしたい方','Claude APIで自動化に取り組みたいエンジニア']
  },
  {
    id: 7120817, code: 'C03', title: 'Cowork基礎',
    headline: 'AIとの協働術。タスク分解/品質管理/チーム活用の型を8時間で習得',
    description: '<p>特定ツールに依存しないAIとの協働の原則を学ぶコースです。タスク分解の技術、出力品質の5Cチェック、チーム利用のナレッジ管理、心理的障壁の克服法まで。</p><p>6つの職種別AI協働パターンと、自部門のAI活用計画書を作成する総合ハンズオン付き。</p>',
    welcome: 'AI協働術へようこそ!ツール操作ではなく「協働の設計」を学びます。特定のAIツールは問いません。普段使っているものでOKです。',
    congrats: 'AIとの協働の原則を習得しました。明日から業務プロセス分解シートと5Cチェックを実践してください。',
    goals: ['業務をAI向きと人間向きに分解し最適な役割分担を設計できる','AIの出力を5Cチェックで検証し品質管理できる','チーム共有プロンプトライブラリを設計できる','AI活用の心理的障壁を特定し対処法を実行できる'],
    prereqs: ['C01修了またはAIツールの基本利用経験'],
    audience: ['チームでのAI活用を推進したい方','AI導入に抵抗感があるメンバーを支援したい方']
  },
  {
    id: 7120885, code: 'C04', title: 'Claude Code基礎',
    headline: 'ターミナルAI開発入門。CLAUDE.md/コマンド/MCPを8時間で習得',
    description: '<p>Claude Codeの基本操作からCLAUDE.md設計、カスタムコマンド、MCP連携まで。ターミナルベースのAI開発を体系的に学ぶ日本語唯一のコースです。</p>',
    welcome: 'Claude Code基礎へようこそ!Node.js 18以上のインストールとAnthropicアカウントが必要です。Max planまたはAPI従量課金でご利用ください。',
    congrats: 'Claude Codeの基本操作からMCP連携まで習得しました。次はClaude Code応用でスキル/フック/エージェント開発に進みましょう。',
    goals: ['Claude Codeをインストールし基本操作(Read/Edit/Write/Bash/Grep)を使いこなせる','CLAUDE.mdを設計しプロジェクトルールでAIの行動を制御できる','カスタムスラッシュコマンドを作成し開発を効率化できる','MCPサーバーを接続し外部ツールとClaude Codeを統合できる'],
    prereqs: ['ターミナル/コマンドラインの基本操作','Node.js環境のセットアップ経験'],
    audience: ['Claude Codeでターミナル開発を始めたいエンジニア','AI開発ツールの生産性を最大化したい方']
  },
  {
    id: 7120819, code: 'C05', title: 'Copilot基礎',
    headline: 'AI駆動開発の入口。補完/Chat/コメントドリブン開発を8時間で習得',
    description: '<p>GitHub Copilotの基本操作を因果関係体験型で学ぶコースです。インラインサジェスト、Copilot Chat、コメントドリブン開発、テスト自動生成まで。</p><p>心理的ハードルを下げる設計で、AI開発の第一歩を確実に踏み出せます。</p>',
    welcome: 'Copilot基礎へようこそ!VS CodeとGitHubアカウントをご準備ください。Free版でも基本演習は可能ですがPro推奨です。',
    congrats: 'Copilotの基本操作からコメントドリブン開発まで習得しました。次はCopilotとClaude Code/Codexの使い分けを学びましょう。',
    goals: ['Copilotのインラインサジェストを的確に受入れ/拒否できる','Copilot Chatでコード説明/リファクタ/エラー解析ができる','コメントドリブン開発でコメントから実装を生成できる','AIが生成したテストの品質を評価し改善できる'],
    prereqs: ['VS Codeの基本操作','何らかのプログラミング言語の基礎知識'],
    audience: ['GitHub Copilotを使い始めたいエンジニア','AI補完を日常開発に組み込みたい方']
  },
  {
    id: 7120821, code: 'C06', title: 'Codex基礎',
    headline: 'CLIエージェント入門。自律実行/サンドボックスを8時間で習得',
    description: '<p>OpenAI Codex CLIの基本操作と自律実行モード(suggest/auto-edit/full-auto)を学ぶコースです。サンドボックスによる安全な実行環境が特徴。</p><p>AGENTS.md設計、Copilot/Claude Codeとの使い分けも扱います。</p>',
    welcome: 'Codex基礎へようこそ!Node.js 22以上とOpenAI APIキーが必要です。',
    congrats: 'Codex CLIの基本からfull-autoモードまで習得しました。次はCodex応用で大規模リファクタリングに進みましょう。',
    goals: ['Codex CLIの3つの実行モードを理解し使い分けられる','AGENTS.mdを設計しCodexの動作をルールで制御できる','サンドボックスの仕組みを理解し安全に自律実行できる','Copilot/Claude Codeとの得意領域の違いを判断できる'],
    prereqs: ['ターミナルの基本操作','Node.js環境'],
    audience: ['OpenAI Codexでターミナル開発を始めたいエンジニア','自律実行型AI開発に興味がある方']
  },
  {
    id: 7120887, code: 'C07', title: 'Claude Code応用',
    headline: 'スキル/フック/エージェント開発。プロダクション運用を12時間で習得',
    description: '<p>Claude Codeの応用的な使い方を学ぶコースです。カスタムスキル開発、フック(イベント駆動自動化)、サブエージェント、仕様駆動開発、CI/CD統合まで。</p><p>日本語でスキル/フック/エージェント開発を教えるコースは他にありません。</p>',
    welcome: 'Claude Code応用へようこそ!C04 Claude Code基礎の修了が前提です。実際のプロジェクトをお持ちだと演習が効果的です。',
    congrats: 'スキル/フック/エージェント開発からCI/CD統合まで習得しました。次はMCP/A2Aでエージェント間連携に進みましょう。',
    goals: ['カスタムスキルを設計し再利用可能な指示セットを作成できる','フック(PreToolUse/PostToolUse/Stop)でイベント駆動自動化ができる','サブエージェントを起動し並列タスク実行を設計できる','仕様駆動開発の型(メモ→仕様書→実装→テスト)を実践できる'],
    prereqs: ['C04 Claude Code基礎の修了','Git/GitHub基礎知識'],
    audience: ['Claude Codeをプロダクション開発で使いたいエンジニア','チーム開発にClaude Codeを導入したい方']
  },
  {
    id: 7120823, code: 'C08', title: 'Codex応用',
    headline: 'full-auto運用/リファクタリング/テスト自動化を10時間で習得',
    description: '<p>Codexの自律実行機能を本格活用するコースです。full-autoの安全運用、大規模リファクタリング、テスト自動生成、ツール横断ワークフロー、CI/CD統合まで。</p>',
    welcome: 'Codex応用へようこそ!C06 Codex基礎の修了が前提です。リファクタリング対象のプロジェクトをご準備ください。',
    congrats: 'full-autoの安全運用からCI/CD統合まで習得しました。AI駆動開発マスターで全技術を統合したプロジェクトに挑戦しましょう。',
    goals: ['full-autoモードの安全運用(承認フロー/ロールバック)を設計できる','既存コードの大規模リファクタリングをCodexで安全に実行できる','テスト自動生成でカバレッジを向上させられる','Copilot/Claude Codeとの3ツール横断ワークフローを設計できる'],
    prereqs: ['C06 Codex基礎の修了','テスト駆動開発の基礎知識'],
    audience: ['Codexをプロダクション開発で使いたいエンジニア','レガシーコードのリファクタリングに取り組む方']
  },
  {
    id: 7120827, code: 'C09', title: 'Dify実践',
    headline: 'AIワークフロー構築。チャットボット/RAG/エージェントを12時間で習得',
    description: '<p>ノーコードでAIワークフローを構築するDifyの実践コースです。チャットボット構築、RAG(検索拡張生成)、外部連携(Webhook/Slack/LINE)、エージェントモードまで。</p><p>法人向け3日間研修の深さをそのまま凝縮した内容です。</p>',
    welcome: 'Dify実践へようこそ!Difyクラウド版(dify.ai)のアカウント作成とOpenAI APIキーをご準備ください。Docker環境があるとセルフホスト演習も可能です。',
    congrats: 'Difyでのチャットボット構築からエージェントモードまで習得しました。次はMCP/A2Aでコードベースのエージェント開発に進みましょう。',
    goals: ['Difyでチャットボット(基本応答/ペルソナ/RAG付き)を構築できる','ワークフロー(ノード設計/条件分岐/外部連携)を設計できる','RAGナレッジベースのチャンク戦略と検索精度をチューニングできる','エージェントモードでツール呼出しと自律実行を実装できる'],
    prereqs: ['AIの基本的な利用経験','APIキーの取得方法がわかること'],
    audience: ['コードを書かずにAIアプリを作りたい方','業務自動化ワークフローを構築したい方']
  },
  {
    id: 7120829, code: 'C10', title: 'Vibe Coding',
    headline: '非エンジニアのためのアプリ開発。プロトタイプからデプロイまで10時間',
    description: '<p>AIに自然言語で指示してアプリを作るVibe Codingの入門コースです。要件言語化、HTMLプロトタイプ生成、デザイン改善、DB連携、デプロイ、ベンダーコントロールまで。</p><p>コードが書けなくても、業務改善Webアプリを完成させて公開できます。</p>',
    welcome: 'Vibe Coding入門へようこそ!CursorまたはBolt.newのアカウントをご準備ください。コーディング経験は一切不要です。',
    congrats: '自然言語でアプリを作り、デプロイし、ベンダー向け資料まで作成する力を習得しました。アイデアを形にし続けてください。',
    goals: ['AIに自然言語で指示してWebアプリのプロトタイプを作成できる','要件を言語化しAIに伝わる指示文に変換できる','作ったアプリをVercel/Netlifyにデプロイして公開できる','プロトタイプを武器にベンダーと対等に仕様を詰められる'],
    prereqs: ['PCの基本操作。プログラミング経験は一切不要'],
    audience: ['コードが書けないがアプリを作りたい企画/事業開発職','業務改善ツールを自分で作りたいビジネスパーソン']
  },
  {
    id: 7120831, code: 'C11', title: 'プロンプトエンジニアリング',
    headline: '高度テクニック/マルチモーダル/評価サイクルまで。10時間の実践コース',
    description: '<p>プロンプトの基本を超えた実践コースです。Tree of Thought、ReAct、メタプロンプト等の高度テクニック、画像/PDF/音声のマルチモーダル、パーソナルAI構築(Gem/GPTs/Claude Projects)、業務別テンプレート10種、A/Bテストによる評価改善サイクルまで。</p>',
    welcome: 'プロンプトエンジニアリング実践へようこそ!ChatGPT、Claude、Geminiのいずれか(できれば複数)のアカウントをご準備ください。',
    congrats: '高度テクニックから評価サイクルまで習得しました。学んだテンプレートとスコアリングシートを明日から業務で使ってください。',
    goals: ['高度テクニック(ToT/ReAct/メタプロンプト)を実務で使いこなせる','マルチモーダルプロンプト(画像/PDF/音声)を設計できる','Gem/GPTs/Claude Projectsで業務特化AIを構築できる','プロンプトのA/Bテストと5軸スコアリングで継続改善できる'],
    prereqs: ['C01修了相当のプロンプト基礎知識'],
    audience: ['プロンプト技法を体系的に深めたい方','業務別のプロンプトテンプレートが欲しい方']
  },
  {
    id: 7120833, code: 'C12', title: 'RAG実践',
    headline: 'LangChain/LangGraph完全ガイド。ベクトルDB/検索精度チューニング12時間',
    description: '<p>社内ドキュメントをAIが検索して回答するRAGシステムを構築するコースです。LangChain基礎からベクトルDB(Chroma/FAISS/Pinecone)、チャンク戦略、検索精度チューニング、LangGraphによるマルチステップRAG、LangSmithでの監視まで。</p>',
    welcome: 'RAG実践へようこそ!Python 3.10以上とpip環境が必要です。OpenAI APIキーも準備してください。',
    congrats: 'RAGの基礎からLangGraph/LangSmithまで習得しました。社内ドキュメント検索システムを実際に運用してみてください。',
    goals: ['RAGアーキテクチャを理解し適切な設計パターンを選択できる','LangChain(LCEL)でRAGパイプラインを構築できる','チャンク戦略と検索精度(Hybrid Search/Re-ranking)をチューニングできる','LangGraphでマルチステップRAG(Self-RAG/Adaptive)を実装できる'],
    prereqs: ['Python基礎(関数/クラス/pip)','APIの基本概念'],
    audience: ['RAGシステムを構築したいエンジニア','社内ドキュメント検索をAIで改善したい方']
  },
  {
    id: 7120889, code: 'C13', title: 'MCP/A2A',
    headline: 'AIエージェント開発。MCPサーバー構築/マルチエージェントを10時間で習得',
    description: '<p>AIエージェントがツールを使い、他のエージェントと協調して自律的にタスクを遂行する仕組みを構築するコースです。MCP(Model Context Protocol)によるツール連携、A2A(Agent-to-Agent)によるエージェント間通信、Claude Agent SDKによる本格開発まで。</p>',
    welcome: 'MCP/A2Aへようこそ!Node.js/TypeScriptまたはPython環境が必要です。Claude DesktopまたはClaude Codeをご準備ください。',
    congrats: 'MCPサーバー構築からマルチエージェントシステムまで習得しました。AI駆動開発マスターで全技術を統合しましょう。',
    goals: ['MCPサーバーをTypeScript SDKで自作しツールを定義できる','MCPクライアント(Claude Desktop/Claude Code)と接続できる','A2AプロトコルでAgent Cardを設計しエージェント間連携を構築できる','マルチエージェントシステム(オーケストレーター型)を設計/実装できる'],
    prereqs: ['TypeScriptまたはPythonの基礎','C04またはC06の修了推奨'],
    audience: ['AIエージェント開発に取り組みたいエンジニア','MCP/A2Aプロトコルを実装したい方']
  },
  {
    id: 7120837, code: 'C14', title: 'セキュリティ',
    headline: '多層防御/ガイドライン策定/リスクアセスメントを8時間で実践',
    description: '<p>C01で学んだ4大リスクの基礎を組織運用レベルに引き上げるコースです。自動ファクトチェック、プロンプトインジェクション多層防御、DLP設計、ガイドライン策定フレームワーク、リスクアセスメント、インシデント対応まで。</p>',
    welcome: 'セキュリティ/ガバナンス実践へようこそ!自社のAI利用状況を思い浮かべながら受講すると効果的です。',
    congrats: 'AI利用ガイドラインとリスクアセスメントシートを完成させました。自社で実際に運用を開始してください。',
    goals: ['プロンプトインジェクションの攻撃分類と多層防御パターンを実装できる','データ分類(公開/社内限定/機密/極秘)に基づくAI利用ルールを策定できる','AI利用ガイドラインを策定フレームワークに沿って作成できる','AIインシデントの対応フロー(検知/初動/調査/報告/再発防止)を設計できる'],
    prereqs: ['C01修了相当のセキュリティ基礎知識','情報セキュリティの基本概念'],
    audience: ['社内AI利用ガイドラインを策定する担当者','情報セキュリティ部門の方','AI導入のリスク管理を担う管理職']
  },
  {
    id: 7120839, code: 'C15', title: 'Gemini/365',
    headline: 'NotebookLM/Sheets/Deep Researchまで。Google Workspace AI活用8時間',
    description: '<p>Google WorkspaceにGeminiを統合し日常業務を加速するコースです。NotebookLM、Docs/Sheets/SlidesのAI機能、Gem/Canvas/Deep Research、Imagen 3まで。</p><p>データ分析レポートを一気通貫で作成する総合ハンズオン付き。</p>',
    welcome: 'Gemini/365マスターへようこそ!Googleアカウントが必要です。Gemini Advanced推奨ですが無料版でも基本演習は可能です。',
    congrats: 'Google WorkspaceのAI機能を横断的に習得しました。明日からDocs/Sheets/Slidesの作業時間を削減してください。',
    goals: ['NotebookLMで複数ソースを横断分析しFAQやAudio Overviewを生成できる','Sheets x Geminiで自然言語からデータ分析/関数生成/グラフ作成ができる','Deep Researchで構造化された市場調査レポートを自動生成できる','Gemで業務特化のパーソナルAIを構築し運用できる'],
    prereqs: ['Google Workspace(Gmail/Docs/Sheets)の基本操作'],
    audience: ['Google Workspaceを日常的に使うビジネスパーソン','NotebookLMやDeep Researchを活用したい方']
  },
  {
    id: 7120841, code: 'C16', title: 'AI駆動開発マスター',
    headline: '全技術を統合し3つのプロダクションプロジェクトを構築する15時間',
    description: '<p>シリーズ全16コースの集大成です。Copilot、Claude Code、Codex、LangGraph、Dify、MCP/A2Aを横断的に活用し、SaaS型Webアプリ、RAG搭載チャットボット、マルチエージェントシステムの3つのプロジェクトを構築します。</p><p>コンテキストエンジニアリング、チーム開発設計、コスト最適化、ポートフォリオ作成まで。</p>',
    welcome: 'AI駆動開発マスターへようこそ!Layer 1-2の複数コース修了が前提です。3つのプロジェクトに全力で取り組んでください。',
    congrats: '全16コースの旅、お疲れさまでした。3つのプロダクションプロジェクトとポートフォリオが完成しています。AI駆動開発のスキルを実務で発揮してください。',
    goals: ['コンテキストエンジニアリング(4層コンテキストモデル)を設計できる','SaaS型Webアプリを仕様駆動開発で完成させられる','RAG搭載チャットボット(LangGraph+Dify+Slack)を構築できる','マルチエージェントシステム(MCP+A2A)をプロダクション運用できる'],
    prereqs: ['Layer 1-2の複数コース修了','Web開発の基礎知識(HTML/CSS/JavaScript)','Python基礎'],
    audience: ['全技術を統合した実践力を身につけたいエンジニア','AI開発のポートフォリオを作りたい方']
  }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getCSRFToken(page) {
  const cookies = await page.context().cookies('https://www.udemy.com');
  const csrf = cookies.find(c => c.name === 'csrftoken');
  if (!csrf) throw new Error('CSRFトークンが見つかりません');
  return csrf.value;
}

async function patchCourse(page, course, csrfToken) {
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

  return result;
}

async function setGoalsUI(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/goals/`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);

  // goals欄（学習目標）- 最大4つ
  // placeholder で特定: 「例: プロジェクトマネージャー...」系
  const goalInputs = await page.locator('[data-purpose="what-you-will-learn"] input[type="text"], [data-purpose="what-you-will-learn"] textarea').all();

  // 別のアプローチ: ページ上のフォームセクションを探す
  // Udemyのgoalsページは3セクションに分かれている
  // まずページの構造を確認
  const pageContent = await page.content();

  // goalsの入力: 「コースで受講生は何を学びますか？」セクション
  for (let i = 0; i < course.goals.length; i++) {
    // 各goalの入力欄を探す（0-indexed）
    const goalInput = page.locator(`[name="what_you_will_learn[${i}]"], [data-purpose="what-you-will-learn-input-${i}"]`).first();
    if (await goalInput.count() > 0) {
      await goalInput.fill('');
      await goalInput.fill(course.goals[i]);
      await sleep(300);
    } else {
      // placeholderベースで試す
      const inputs = await page.locator('input[placeholder*="例:"], input[placeholder*="Example"]').all();
      if (inputs[i]) {
        await inputs[i].fill('');
        await inputs[i].fill(course.goals[i]);
        await sleep(300);
      }
    }
  }

  // prereqsの入力
  for (let i = 0; i < course.prereqs.length; i++) {
    const prereqInput = page.locator(`[name="prerequisites[${i}]"], [data-purpose="prerequisites-input-${i}"]`).first();
    if (await prereqInput.count() > 0) {
      await prereqInput.fill('');
      await prereqInput.fill(course.prereqs[i]);
      await sleep(300);
    }
  }

  // audienceの入力
  for (let i = 0; i < course.audience.length; i++) {
    const audInput = page.locator(`[name="who_is_this_course_for[${i}]"], [data-purpose="who-is-this-course-for-input-${i}"]`).first();
    if (await audInput.count() > 0) {
      await audInput.fill('');
      await audInput.fill(course.audience[i]);
      await sleep(300);
    }
  }

  // 保存ボタンをクリック
  const saveBtn = page.locator('button:has-text("保存"), button:has-text("Save")').first();
  if (await saveBtn.count() > 0) {
    await saveBtn.click();
    await sleep(2000);
  }
}

async function main() {
  console.log(`CDP接続: localhost:${CDP_PORT}`);
  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];

  console.log('現在のURL:', page.url());

  // Udemy にいることを確認
  if (!page.url().includes('udemy.com')) {
    await page.goto('https://www.udemy.com/instructor/courses/', { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(2000);
  }

  // CSRFトークン取得
  const csrfToken = await getCSRFToken(page);
  console.log('CSRFトークン取得済み:', csrfToken.substring(0, 10) + '...');

  // ===== Part 1: API PATCHで基本情報を設定 =====
  console.log('\n===== Part 1: API PATCHで基本情報を設定 =====\n');

  const patchResults = [];
  for (const course of courses) {
    console.log(`[${course.code}] ${course.title} (ID: ${course.id}) ... PATCH中`);
    try {
      const result = await patchCourse(page, course, csrfToken);
      console.log(`  -> ${result.status} ${result.statusText}`);
      patchResults.push({ code: course.code, status: result.status, ok: result.status === 200 });
      if (result.status !== 200) {
        console.log(`  -> body: ${result.body.substring(0, 200)}`);
      }
      await sleep(500); // レート制限回避
    } catch (e) {
      console.log(`  -> ERROR: ${e.message}`);
      patchResults.push({ code: course.code, status: 'ERROR', ok: false });
    }
  }

  // Part 1 結果まとめ
  console.log('\n--- Part 1 結果 ---');
  const okCount = patchResults.filter(r => r.ok).length;
  console.log(`成功: ${okCount}/16`);
  for (const r of patchResults) {
    console.log(`  ${r.code}: ${r.ok ? 'OK' : 'NG'} (${r.status})`);
  }

  // ===== Part 2: UI操作でgoals/prereqs/audienceを設定 =====
  console.log('\n===== Part 2: UI操作でgoals/prereqs/audienceを設定 =====\n');

  // まず1つのコースでページ構造を確認する
  const testCourse = courses[1]; // C02
  const testUrl = `https://www.udemy.com/instructor/course/${testCourse.id}/manage/goals/`;
  console.log(`ページ構造確認: ${testUrl}`);
  await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(3000);

  // ページのinput要素を調査
  const inputInfo = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="text"], textarea');
    return Array.from(inputs).map((el, i) => ({
      index: i,
      tag: el.tagName,
      type: el.type,
      name: el.name,
      placeholder: el.placeholder,
      value: el.value,
      dataPurpose: el.getAttribute('data-purpose'),
      parentText: el.closest('[class]')?.className?.substring(0, 80)
    }));
  });
  console.log('入力欄情報:', JSON.stringify(inputInfo, null, 2));

  // セクション情報も取得
  const sectionInfo = await page.evaluate(() => {
    const sections = document.querySelectorAll('h2, h3, [class*="section"], [class*="heading"]');
    return Array.from(sections).slice(0, 20).map(el => ({
      tag: el.tagName,
      text: el.textContent?.trim().substring(0, 80),
      class: el.className?.substring(0, 60)
    }));
  });
  console.log('セクション情報:', JSON.stringify(sectionInfo, null, 2));

  // ボタン情報
  const buttonInfo = await page.evaluate(() => {
    const buttons = document.querySelectorAll('button');
    return Array.from(buttons).map(b => ({
      text: b.textContent?.trim().substring(0, 40),
      type: b.type,
      disabled: b.disabled
    }));
  });
  console.log('ボタン情報:', JSON.stringify(buttonInfo, null, 2));

  console.log('\n--- ページ構造確認完了、goals入力を開始 ---\n');

  // ここでinputInfoの結果を元に適切なセレクタを決定
  // 実行時にページ構造を確認して動的に対応する
  const goalsResults = [];

  for (const course of courses) {
    if (course.skipGoals) {
      console.log(`[${course.code}] ${course.title} -> スキップ(入力済み)`);
      goalsResults.push({ code: course.code, status: 'SKIPPED' });
      continue;
    }

    console.log(`[${course.code}] ${course.title} (ID: ${course.id}) ... goals設定中`);
    try {
      const goalsUrl = `https://www.udemy.com/instructor/course/${course.id}/manage/goals/`;
      await page.goto(goalsUrl, { waitUntil: 'networkidle', timeout: 30000 });
      await sleep(3000);

      // 全input[type="text"]を取得
      const allInputs = await page.locator('input[type="text"]').all();
      console.log(`  入力欄数: ${allInputs.length}`);

      // Udemyのgoalsページ構造:
      // - 最初の4つ: goals (学習目標)
      // - 次の1つ以上: prereqs (前提条件)
      // - 最後の1つ以上: audience (対象者)
      // 各セクション内に「回答を追加」ボタンがある

      // 方法: placeholderやdata属性で区別する
      const inputDetails = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"]');
        return Array.from(inputs).map((el, i) => ({
          index: i,
          placeholder: el.placeholder,
          value: el.value,
          dataPurpose: el.getAttribute('data-purpose')
        }));
      });

      // セクション分けのためにplaceholderを解析
      let goalInputIndices = [];
      let prereqInputIndices = [];
      let audienceInputIndices = [];

      for (let i = 0; i < inputDetails.length; i++) {
        const ph = inputDetails[i].placeholder || '';
        const dp = inputDetails[i].dataPurpose || '';
        if (ph.includes('プロジェクトマネージャー') || ph.includes('定義') || ph.includes('学び') ||
            dp.includes('what-you-will-learn') || dp.includes('objective') ||
            ph.includes('Example:') || ph.includes('Define')) {
          goalInputIndices.push(i);
        } else if (ph.includes('プログラミング') || ph.includes('経験') || ph.includes('要件') ||
                   dp.includes('prerequisite') || ph.includes('No programming')) {
          prereqInputIndices.push(i);
        } else if (ph.includes('データサイエンス') || ph.includes('初級') || ph.includes('対象') ||
                   dp.includes('target') || dp.includes('who') || ph.includes('beginner')) {
          audienceInputIndices.push(i);
        }
      }

      // placeholderで分類できなかった場合、位置ベースで推定
      if (goalInputIndices.length === 0 && inputDetails.length >= 4) {
        // Udemyのデフォルト: 最初の4つがgoals
        goalInputIndices = [0, 1, 2, 3];
        // prereqsとaudienceはgoalsの後
        if (inputDetails.length >= 6) {
          prereqInputIndices = [4];
          audienceInputIndices = [5];
          // 追加の入力欄があれば
          for (let i = 6; i < inputDetails.length; i++) {
            audienceInputIndices.push(i);
          }
        }
      }

      console.log(`  goals欄: ${goalInputIndices}, prereqs欄: ${prereqInputIndices}, audience欄: ${audienceInputIndices}`);
      console.log(`  inputDetails: ${JSON.stringify(inputDetails.map(d => d.placeholder?.substring(0, 30)))}`);

      // goals入力
      for (let i = 0; i < course.goals.length && i < goalInputIndices.length; i++) {
        const input = allInputs[goalInputIndices[i]];
        await input.click();
        await input.fill('');
        await input.fill(course.goals[i]);
        await sleep(300);
      }

      // prereqs入力 - 入力欄が足りない場合は「回答を追加」を押す
      for (let i = 0; i < course.prereqs.length; i++) {
        if (i < prereqInputIndices.length) {
          const input = allInputs[prereqInputIndices[i]];
          await input.click();
          await input.fill('');
          await input.fill(course.prereqs[i]);
          await sleep(300);
        }
      }

      // audience入力
      for (let i = 0; i < course.audience.length; i++) {
        if (i < audienceInputIndices.length) {
          const input = allInputs[audienceInputIndices[i]];
          await input.click();
          await input.fill('');
          await input.fill(course.audience[i]);
          await sleep(300);
        }
      }

      // 保存
      await sleep(500);
      const saveBtn = page.locator('button:has-text("保存"), button:has-text("Save")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await sleep(2000);
        console.log(`  -> 保存完了`);
        goalsResults.push({ code: course.code, status: 'OK' });
      } else {
        console.log(`  -> 保存ボタンが見つかりません`);
        goalsResults.push({ code: course.code, status: 'NO_SAVE_BUTTON' });
      }
    } catch (e) {
      console.log(`  -> ERROR: ${e.message}`);
      goalsResults.push({ code: course.code, status: `ERROR: ${e.message.substring(0, 80)}` });
    }
  }

  // Part 2 結果まとめ
  console.log('\n--- Part 2 結果 ---');
  for (const r of goalsResults) {
    console.log(`  ${r.code}: ${r.status}`);
  }

  console.log('\n===== 全処理完了 =====');
  await browser.close();
}

main().catch(e => {
  console.error('致命的エラー:', e);
  process.exit(1);
});
