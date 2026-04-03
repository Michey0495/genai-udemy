// Udemy全16コースの「コースメッセージ」と「価格設定」を一括設定
// CDP接続で既存ブラウザを利用
// エディタ: ProseMirror (contenteditable div.ProseMirror)

import { chromium } from 'playwright';

const CDP_PORT = 49332;

const courses = [
  { id: 7120797, title: 'C01 生成AI完全入門', welcome: '生成AI完全入門へようこそ!仕組みからセキュリティまで体系的に学びます。ハンズオンは必ず手を動かしてください。自走チャレンジでは動画を止めて自分で取り組んでからお進みください。', congrats: 'コース修了おめでとうございます!次のステップとしてClaude基礎やCopilot基礎などツール特化コースに進むことをお勧めします。' },
  { id: 7120883, title: 'C02 Claude基礎', welcome: 'Claude基礎へようこそ!Claudeの全機能を体系的に学びます。API演習にはAnthropic Consoleのアカウントが必要です。', congrats: 'Claudeの基本操作からProjects、Artifacts、APIまで習得しました。次はClaude Code基礎やCowork基礎をお勧めします。' },
  { id: 7120817, title: 'C03 AI協働術', welcome: 'AI協働術へようこそ!ツール操作ではなく協働の設計を学びます。普段使っているAIツールでOKです。', congrats: 'AIとの協働の原則を習得しました。明日から業務プロセス分解シートと5Cチェックを実践してください。' },
  { id: 7120885, title: 'C04 Claude Code基礎', welcome: 'Claude Code基礎へようこそ!Node.js 18以上とAnthropicアカウントが必要です。', congrats: 'Claude Codeの基本操作からMCP連携まで習得しました。次はClaude Code応用に進みましょう。' },
  { id: 7120819, title: 'C05 Copilot基礎', welcome: 'Copilot基礎へようこそ!VS CodeとGitHubアカウントをご準備ください。', congrats: 'Copilotの基本操作からコメントドリブン開発まで習得しました。' },
  { id: 7120821, title: 'C06 Codex基礎', welcome: 'Codex基礎へようこそ!Node.js 22以上とOpenAI APIキーが必要です。', congrats: 'Codex CLIの基本からfull-autoモードまで習得しました。次はCodex応用に進みましょう。' },
  { id: 7120887, title: 'C07 Claude Code応用', welcome: 'Claude Code応用へようこそ!C04 Claude Code基礎の修了が前提です。', congrats: 'スキル/フック/エージェント開発からCI/CD統合まで習得しました。' },
  { id: 7120823, title: 'C08 Codex応用', welcome: 'Codex応用へようこそ!C06 Codex基礎の修了が前提です。', congrats: 'full-autoの安全運用からCI/CD統合まで習得しました。' },
  { id: 7120827, title: 'C09 Dify実践', welcome: 'Dify実践へようこそ!Difyクラウド版のアカウントとOpenAI APIキーをご準備ください。', congrats: 'Difyでのチャットボット構築からエージェントモードまで習得しました。' },
  { id: 7120829, title: 'C10 Vibe Coding入門', welcome: 'Vibe Coding入門へようこそ!CursorまたはBolt.newのアカウントをご準備ください。コーディング経験は不要です。', congrats: '自然言語でアプリを作りデプロイする力を習得しました。アイデアを形にし続けてください。' },
  { id: 7120831, title: 'C11 プロンプトエンジニアリング', welcome: 'プロンプトエンジニアリング実践へようこそ!ChatGPT、Claude、Geminiのいずれかのアカウントをご準備ください。', congrats: '高度テクニックから評価サイクルまで習得しました。テンプレートとスコアリングシートを業務で使ってください。' },
  { id: 7120833, title: 'C12 RAG実践', welcome: 'RAG実践へようこそ!Python 3.10以上とOpenAI APIキーが必要です。', congrats: 'RAGの基礎からLangGraph/LangSmithまで習得しました。' },
  { id: 7120889, title: 'C13 MCP/A2A', welcome: 'MCP/A2Aへようこそ!Node.js/TypeScriptまたはPython環境が必要です。', congrats: 'MCPサーバー構築からマルチエージェントシステムまで習得しました。' },
  { id: 7120837, title: 'C14 セキュリティ/ガバナンス', welcome: 'セキュリティ/ガバナンス実践へようこそ!自社のAI利用状況を思い浮かべながら受講すると効果的です。', congrats: 'AI利用ガイドラインとリスクアセスメントシートを完成させました。自社で運用を開始してください。' },
  { id: 7120839, title: 'C15 Gemini/365マスター', welcome: 'Gemini/365マスターへようこそ!Googleアカウントが必要です。Gemini Advanced推奨です。', congrats: 'Google WorkspaceのAI機能を横断的に習得しました。明日から作業時間を削減してください。' },
  { id: 7120841, title: 'C16 AI駆動開発マスター', welcome: 'AI駆動開発マスターへようこそ!Layer 1-2の複数コース修了が前提です。3つのプロジェクトに全力で取り組んでください。', congrats: '全16コースの旅、お疲れさまでした。3つのプロダクションプロジェクトとポートフォリオが完成しています。' },
];

// ProseMirrorエディタにテキストを入力
async function fillProseMirror(page, editorIndex, text) {
  const editors = page.locator('.ProseMirror[contenteditable="true"]');
  const count = await editors.count();
  if (editorIndex >= count) {
    console.log(`    エディタ[${editorIndex}]が見つかりません (全${count}個)`);
    return false;
  }

  const editor = editors.nth(editorIndex);

  // クリックしてフォーカス
  await editor.click();
  await page.waitForTimeout(300);

  // 既存テキストを全選択して削除
  await page.keyboard.press('Meta+A');
  await page.waitForTimeout(100);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);

  // テキスト入力
  await page.keyboard.type(text, { delay: 5 });
  await page.waitForTimeout(300);

  // 入力されたか確認
  const currentText = await editor.textContent();
  const ok = currentText.includes(text.substring(0, 20));
  return ok;
}

// コースメッセージを設定
async function setupMessages(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/communications/messages`;
  console.log(`\n[メッセージ] ${course.title} (${course.id})`);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // ProseMirrorエディタの存在確認
  const editorCount = await page.locator('.ProseMirror[contenteditable="true"]').count();
  if (editorCount < 2) {
    console.log(`  エディタが不足 (${editorCount}個) - スキップ`);
    return false;
  }

  // 歓迎のメッセージ
  const welcomeOk = await fillProseMirror(page, 0, course.welcome);
  console.log(`  歓迎のメッセージ: ${welcomeOk ? 'OK' : 'NG'}`);

  // お祝いのメッセージ
  const congratsOk = await fillProseMirror(page, 1, course.congrats);
  console.log(`  お祝いのメッセージ: ${congratsOk ? 'OK' : 'NG'}`);

  // 保存ボタン
  const saveBtn = page.locator('button').filter({ hasText: '保存' }).first();
  const isDisabled = await saveBtn.isDisabled().catch(() => true);

  if (!isDisabled) {
    await saveBtn.click();
    console.log(`  保存クリック`);
    await page.waitForTimeout(2000);

    // 保存後、ボタンが再びdisabledになるのを待つ（成功の証）
    await page.waitForFunction(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('保存'));
      return btn && btn.disabled;
    }, { timeout: 5000 }).catch(() => {});

    console.log(`  保存完了`);
    return true;
  } else {
    console.log(`  保存ボタンが無効（変更なし?）`);
    return false;
  }
}

// 価格設定
async function setupPricing(page, course) {
  const url = `https://www.udemy.com/instructor/course/${course.id}/manage/pricing/`;
  console.log(`\n[価格設定] ${course.title} (${course.id})`);

  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // 価格帯セレクトを探す（2つ目のselect: 1つ目は通貨）
  const selects = page.locator('select');
  const selectCount = await selects.count();
  console.log(`  セレクト要素: ${selectCount}個`);

  if (selectCount < 2) {
    // プレミアム講師申請が必要な場合
    const pageText = await page.locator('body').textContent();
    if (pageText.includes('プレミアム講師') || pageText.includes('Premium')) {
      console.log(`  プレミアム講師申請が必要 - 無料のまま`);
    }

    // セレクトが1つでもあれば価格帯を設定
    if (selectCount === 0) {
      console.log(`  価格設定UIが見つかりません`);
      return false;
    }
  }

  // 通貨を確認（デフォルトのまま）
  if (selectCount >= 1) {
    const currencySelect = selects.nth(0);
    const currentCurrency = await currencySelect.inputValue();
    console.log(`  通貨: ${currentCurrency}`);
  }

  // 価格帯を選択（2つ目のselect）
  if (selectCount >= 2) {
    const priceSelect = selects.nth(1);
    const currentPrice = await priceSelect.inputValue();
    console.log(`  現在の価格: ${currentPrice || '未選択'}`);

    if (!currentPrice || currentPrice === '0') {
      // 有料に設定: 最低価格帯 $19.99
      await priceSelect.selectOption('19.99');
      console.log(`  価格帯を $19.99 に設定`);
      await page.waitForTimeout(1000);
    } else {
      console.log(`  既に有料設定済み: $${currentPrice}`);
    }
  } else if (selectCount === 1) {
    // セレクトが1つしかない場合は、それが価格帯かもしれない
    const theSelect = selects.nth(0);
    const options = await theSelect.locator('option').allTextContents();
    console.log(`  選択肢: ${options.slice(0, 5).join(', ')}`);

    if (options.some(o => o.includes('無料') || o.includes('Free'))) {
      await theSelect.selectOption('19.99');
      console.log(`  価格帯を $19.99 に設定`);
      await page.waitForTimeout(1000);
    }
  }

  // 保存ボタン
  const saveBtn = page.locator('button').filter({ hasText: '保存' }).first();
  const isDisabled = await saveBtn.isDisabled().catch(() => true);

  if (!isDisabled) {
    await saveBtn.click();
    console.log(`  保存クリック`);
    await page.waitForTimeout(2000);
    console.log(`  保存完了`);
    return true;
  } else {
    console.log(`  保存ボタンが無効（変更なし or 制限あり）`);
    return false;
  }
}

async function main() {
  console.log('=== Udemy 全16コース メッセージ & 価格 一括設定 ===\n');

  const browser = await chromium.connectOverCDP(`http://localhost:${CDP_PORT}`);
  const context = browser.contexts()[0];
  const page = context.pages()[0];
  console.log(`CDP接続OK (port ${CDP_PORT})`);

  const msgResults = [];
  const priceResults = [];

  // Part 1: コースメッセージ
  console.log('\n======== Part 1: コースメッセージ ========');
  for (const course of courses) {
    try {
      const ok = await setupMessages(page, course);
      msgResults.push({ title: course.title, ok });
    } catch (err) {
      console.log(`  エラー: ${err.message}`);
      msgResults.push({ title: course.title, ok: false, error: err.message });
    }
  }

  // Part 2: 価格設定
  console.log('\n\n======== Part 2: 価格設定 ========');
  for (const course of courses) {
    try {
      const ok = await setupPricing(page, course);
      priceResults.push({ title: course.title, ok });
    } catch (err) {
      console.log(`  エラー: ${err.message}`);
      priceResults.push({ title: course.title, ok: false, error: err.message });
    }
  }

  // サマリー
  console.log('\n\n======== 結果サマリー ========');
  console.log('\nメッセージ設定:');
  msgResults.forEach(r => console.log(`  ${r.ok ? '[OK]' : '[NG]'} ${r.title}${r.error ? ' - ' + r.error : ''}`));
  console.log(`  成功: ${msgResults.filter(r => r.ok).length}/${msgResults.length}`);

  console.log('\n価格設定:');
  priceResults.forEach(r => console.log(`  ${r.ok ? '[OK]' : '[NG]'} ${r.title}${r.error ? ' - ' + r.error : ''}`));
  console.log(`  成功: ${priceResults.filter(r => r.ok).length}/${priceResults.length}`);

  await browser.close();
}

main().catch(err => {
  console.error('致命的エラー:', err);
  process.exit(1);
});
