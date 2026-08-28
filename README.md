# 🌱 Katsudo Log (活動記録アプリ)

日々の活動を簡単に記録・管理するためのWebアプリケーションです。
Google Apps Script (GAS) と連携して、スプレッドシートにデータを保存・同期します。

## ✨ 特徴
- 📱 スマホ対応のレスポンシブデザイン
- 🗣️ 音声入力対応 (Gemini AI連携)
- 📊 月報の自動集計
- ☁️ Googleスプレッドシート同期

## 🚀 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

## 🛠️ 技術スタック
- React
- Vite
- Google Apps Script (Backend/Database)

## 🎵 おまけ: ループでおんがく (`music/`)

タブレットのブラウザで動く、子供向けのループ音楽アプリ（GarageBand の Live Loops 風）。
`music/index.html` の1ファイル完結・ビルド不要で、音は Tone.js (CDN) の内蔵シンセだけで鳴らします。

- 5トラック（ドラム / ハイハット / ベース / コード / メロディ）× 4ループのグリッド
- セルをタップすると **次の小節の頭から** 鳴りはじめる（`Tone.Transport.scheduleOnce` + `"@1m"`）ので、いつ連打してもリズムが崩れない
- 全パートが C メジャーペンタトニックのみ。どれを重ねても不協和にならない
- PWA 対応（`manifest.json` + `sw.js`）でホーム画面に追加可能
- `npm run build` すると `dist/music/` にそのままコピーされ、GitHub Pages の `/katsudo-log/music/` で公開されます

ローカルで単体確認する場合:

```bash
npx serve music     # または python3 -m http.server -d music
```
