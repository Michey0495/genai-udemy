# ハンズオン構造改善計画

## 改善方針

### 1. 「模倣→自走」の2段構成を全ハンズオンに導入

各ハンズオンを以下の2パートで構成する:

#### Part A: 講師デモ（模倣）
- テーマを説明
- 講師が解説しながらプロンプト/コードを見せる
- 受講者はコピー&実行して同じ結果を確認する
- 既存のhandsonブロックの構造を活かす

#### Part B: 自走チャレンジ
- 別のテーマを提示（Part Aと同じスキルだが題材が違う）
- 受講者に自分でプロンプト/コードを書かせる
- 「ここで動画を一度止めて、5分間取り組んでください」の明示
- 取り組み後、講師の解答例をdetails/summaryで折りたたみ表示
- 受講者は自分の結果と講師の解答例を比較して改善点を理解

### 2. 新しいUIコンポーネント

```css
/* 自走チャレンジブロック */
.challenge {
  background: rgba(230,160,40,0.06);
  border: 1px dashed var(--warn-border);
  border-radius: var(--radius);
  padding: 24px; margin: 20px 0;
}
.challenge .ch-title {
  font-size: 15px; font-weight: 700;
  color: var(--warn-border); margin-bottom: 8px;
  display: flex; align-items: center; gap: 8px;
}
.challenge .ch-pause {
  display: inline-block;
  background: var(--warn-border); color: #fff;
  padding: 4px 14px; border-radius: 4px;
  font-size: 12px; font-weight: 700;
  margin: 12px 0;
}
.challenge .ch-theme {
  font-size: 14px; color: var(--text);
  margin-bottom: 12px; padding: 12px;
  background: rgba(0,0,0,0.2); border-radius: 4px;
}
```

使い方:
```html
<div class="challenge">
  <div class="ch-title">自走チャレンジ</div>
  <div class="ch-theme">
    テーマ: 〇〇について、△△を作成してください。<br>
    条件: □□、制約: ◇◇
  </div>
  <div class="ch-pause">ここで動画を一度止めて、5分間取り組んでください</div>
  <p>ヒント: ...</p>
  <details>
    <summary>講師の解答例を見る</summary>
    <div class="inner">
      <div class="prompt" id="...">解答プロンプト...<button class="cb" onclick="copyP('...')">コピー</button></div>
      <p>ポイント: ...</p>
    </div>
  </details>
</div>
```

### 3. ダミーデータの確認と追加

全ハンズオンについて:
- 受講者がそのまま実行できるダミーデータがDL可能か確認
- 不足しているものはdownload関数を追加
- テキスト、CSV、JSON、PDF(テキストとして生成)等

## コース別の改善ポイント

### C01 (自走系10 → 十分だが2段構成に改善)
- Sec01ハンズオン: Part A(トークナイザー体験)は既存。Part B追加「別の日本語テキストでトークン数を予測してから実際に確認」
- Sec04ハンズオン: Part A(3つの型)は既存。Part B追加「自分の業務メールを題材に3つの型で書き分け」

### C02 (自走系3 → 大幅に不足)
- Sec02: Part B追加「講師と異なるファイル(DL提供)を使って同じ分析」
- Sec03: Part B追加「自分の業務用Projectを自力で設計」
- Sec04: Part B追加「講師と異なるダッシュボードをArtifactsで作成」

### C04 (自走系0 → 全セクションに追加)
- Sec02: Part B「講師が見せたのと異なるファイルに対して同じ操作を自分で指示」
- Sec03: Part B「異なるプロジェクトのCLAUDE.mdを自力で設計」
- Sec04: Part B「講師が作ったのと異なるカスタムコマンドを自分で作成」

### C06 (自走系0 → 全セクションに追加)
- Sec02: Part B「講師と異なるタスクを自力でCodexに指示」
- Sec03: Part B「3モードの選択を自分で判断」
- Sec04: Part B「自プロジェクト用のAGENTS.mdを自力で設計」

### C07 (DL関数0 → ダミーデータ追加)
- スキルテンプレ、フック設定サンプル、エージェント定義サンプルのDLを追加

### C09 (自走系0 → ワークフロー設計の自走チャレンジ追加)
- Sec03: Part B「講師と異なるチャットボットを自分で設計」
- Sec04: Part B「別のワークフローを自力で構築」
- Sec05: Part B「異なるPDFでRAGを自力構築」

### C12 (自走系0 → RAG構築の自走チャレンジ追加)
- Sec02: Part B「異なるChainを自力で構築」
- Sec04: Part B「異なるチャンク戦略を自力で選択・設定」
- Sec06: Part B「異なるLangGraphグラフを自力で設計」

### C16 (自走系0, DL関数0 → 総合プロジェクトの自走追加+ダミーデータ)
- 各PJのPart B: PJの一部機能を自力で追加
- DLテンプレート6種を追加
