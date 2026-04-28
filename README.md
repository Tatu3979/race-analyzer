# Race Analyzer

市民マラソンランナー向けのランニング解析 Web アプリ。レースの FIT ファイルを取り込んで区間ごとに分析し、AI（ChatGPT / Claude / Gemini 等）に次のレース戦略を相談するためのプロンプトを生成します。

## 公開 URL

（Phase 1 デプロイ後にここに記載）

## 特徴

- **データは外部送信しません**。FIT のパースもプロンプト生成もブラウザ内で完結します。
- アップロードした FIT ファイルやフォーム入力は永続化されません（ブラウザを閉じると消えます）。

## 使い方

（Phase 5 で詳細記載）

## 動作確認済み機種

（Phase 5 で記載）

## 技術スタック

- Vite + React + TypeScript
- fit-file-parser（FIT パース）
- Recharts（グラフ描画）
- Firebase Hosting（公開）

## 開発

```bash
npm install
npm run dev      # ローカル起動 (http://localhost:5173/)
npm run build    # 本番ビルド (dist/ を生成)
npm run preview  # ビルド成果物のローカル確認
```

## プライバシーポリシー

このアプリはユーザーがアップロードした FIT ファイル、フォーム入力値などのいかなる情報もサーバーに送信・保存しません。すべての処理はブラウザ内（クライアントサイド）でのみ実行されます。

## ライセンス

MIT
