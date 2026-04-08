# CHANGELOG - katsudo-log-workspace

## 2026-04-07

### 追加・変更
- **LogNote紹介ページ（LP）の追加**：アプリの魅力や使い方を伝えるランディングページを新規作成。実際のアプリ画面を用いたブラウザ風UIモックアップ、機能紹介、導入メリットなどをレスポンシブで実装。
  - 追加ディレクトリ/ファイル: `lp/index.html`, `lp/images/`
- **LP向けデモモードの追加**：LPの「今すぐ試してみる」ボタンからのアクセス（URLパラメータに `?demo=1` がある場合）時、既存ユーザーのローカルデータを削除することなく必ず初回オンボーディングを強制表示するよう仕様を追加。アプリの初期設定をテスト可能に。
  - 変更ファイル: `lp/index.html`, `src/App.jsx`
- **デプロイ設定の改善**：Viteのビルド時に `lp/` フォルダが自動で `dist/lp/` にコピーされるよう `vite.config.js` に `closeBundle` 用カスタムプラグインを追加。これによりLPもGitHub Pagesで同時に自動公開されるよう設定。
  - 変更ファイル: `vite.config.js`
- **設定画面からの導線追加**：アプリ内の「⚙️ 設定」画面の最下部に、LP（紹介ページ）へのリンクを追加。
  - 変更ファイル: `src/components/SettingsModal.jsx`

### 修正
- **独立したページ（LP・ヘルプ）のPWAルーティング回避**：Service Worker（PWA）の仕様により、本来独立したパス（`/lp/` や `help.html`）へアクセスしてもアプリ本体へリダイレクトされてしまう問題を修正。`VitePWA` 内の `workbox.navigateFallbackDenylist` で該当パスをフォールバック対象外に指定。
  - 変更ファイル: `vite.config.js`

> ✅ **デプロイ済み（2026-04-08）**
> `npm run deploy` を実行し、GitHub Pagesへ反映。
> ※ PWA（スマホインストール版）で最新版やLPリンクが表示されない場合は、アプリのタスクキル（完全終了）による再起動が必要。

---

## v2.2.1 (2026-04-04)

### 修正
- **Google連携設定ガイドのコピーボタン**：コピーが動作しなかった問題を修正。
  - `<details>` にデフォルト `open` 属性を追加、コピー時にも強制展開することで `textContent` が確実に取得できるよう改善
  - `innerText`（非表示要素で空文字）→ `textContent.trim()` に変更
  - `navigator.clipboard.writeText()` がHTTPS以外（`file://` 等）で失敗する問題に対し、`<textarea>` + `execCommand('copy')` のフォールバック処理を追加。`position:absolute` + `opacity:0` で表示状態を保ちつつ不可視化し `select()` を確実に動作させるよう改善
  - 変更ファイル: `public/help.html`

- **コピーボタンUX改善**：コピー成功後の `alert()` を廃止し、よりスムーズな誘導フローに変更。
  - コピー成功時にボタンを `✅ コピー完了！エディタに貼り付けてください`（緑色）に変化させる
  - 1.5秒後にソースコード欄（`<details>`）を自動で折りたたむ
  - 1.8秒後に「手順 3」へスムーズスクロールで誘導
  - 3.5秒後にボタンを元の表示に戻す（再コピー可能）
  - コピー失敗時は `❌ コピー失敗` と赤表示し4秒後にリセット
  - 変更ファイル: `public/help.html`

- **設定ガイド 手順3 に画像を追加**：テキストのみで分かりにくかった「setup選択」「実行ボタン」の操作を、スクリーンショット画像で補足。
  - 追加ファイル: `public/images/step3-select-setup.png`, `public/images/step3-click-run.png`
  - 変更ファイル: `public/help.html`

- **設定ガイド 手順4 に画像を追加**：デプロイ設定画面（「自分」「全員」の選択箇所）に実際のスクリーンショットを追加。
  - 追加ファイル: `public/images/step4-deploy-settings.png`
  - 変更ファイル: `public/help.html`

> ✅ **デプロイ済み（2026-04-04）**
> https://haru5512.github.io/katsudo-log/help.html でコピーボタンの動作を確認可能。

---


## v2.2.0 (2026-03-17)

### 追加
- **オンボーディングウィザード**：初回起動時に5ステップのセットアップガイドを表示。カテゴリプリセット選択・テーマ選択・GAS連携設定などを案内。
  - 変更ファイル: `src/components/OnboardingModal.jsx`, `src/App.jsx`

### 修正
- **一覧タブ「本日」ボタン**：当月の記録が30件を超える場合、本日の記録がページネーション範囲外となりスクロールできなかった問題を修正。見つからない場合に表示件数を全件に拡大して再探索するよう変更。
  - 変更ファイル: `src/components/ListTab.jsx`

- **リセット時のオンボーディング再表示**：設定リセット時に `onboarding_complete` フラグも削除し、オンボーディングが再表示されるよう修正。
  - 変更ファイル: `src/App.jsx`

---

## v2.1.0 (2026-03-11)

### 追加
- **月報タブ / Discordコピー**：`⚙️ 表示項目` ボタンを追加し、メモ（note）のON/OFFを選択できるようにした（報告書モードと同様の操作感）。設定は `discord_output_options` キーでlocalStorageに保存。
  - 変更ファイル: `src/components/MonthlyTab.jsx`

- **起動時アップデート情報モーダル**：アプリ起動時に新バージョンの更新内容を表示するモーダルを追加。`seen_version` をlocalStorageで管理し、新バージョンのときだけ表示。
  - 変更ファイル: `src/App.jsx`, `src/utils/index.js`（`APP_VERSION`, `CHANGELOG` 定数を追加）

### 修正
- **Googleカレンダー連携**：`generateCalendarUrl` でローカル時刻をそのまま渡していたため、カレンダーの下書きが空になっていた問題を修正。`getUTCHours/Minutes` を使いUTC変換 + 末尾 `Z` を付けるよう変更。
  - 変更ファイル: `src/utils/index.js`

### その他
- `.gitignore` に作業用一時ファイル（`app_base.txt`, `diff.txt`, `dist/` 等）を追加

---

## v2.0.0 (2026-02-28)

- カラーテーマ切り替え機能を追加（設定から5種類選択可能）
- アプリ名を「活動記録」から「LogNote」に変更
- カテゴリのカスタマイズ機能を追加（設定画面から編集可能）

---

## 構成メモ

| フォルダ | 役割 |
|---|---|
| `katsudo-log-workspace` | **作業フォルダ**（こちらを編集・デプロイ） |
| `katsudo-log-original` | 参照用の旧バージョンのコピー |

- GitHub: https://github.com/haru5512/katsudo-log
- 本番URL: https://haru5512.github.io/katsudo-log/index.html
- デプロイ: `npm run deploy`（ビルド → gh-pages ブランチに自動プッシュ）
- `main` へのpushだけでは本番反映されない。必ず `npm run deploy` も実行すること。
