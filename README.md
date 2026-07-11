# Lucky Juggler - オリジナルスロットシミュレーターPWA

ブラウザで遊べる、ジャグラー風のシンプルな遊びやすさを参考にしたオリジナルスロットゲームです。
図柄・ランプ・サウンド・名称はすべて本プロジェクト独自にデザインしたオリジナル要素で構成しています。

## 技術構成

- TypeScript
- Phaser 3（描画・アニメーション）
- Vite（ビルド）
- vite-plugin-pwa（PWA対応：manifest / Service Worker）
- LocalStorage（セーブデータ）

認証・データベースは使用していません。

## セットアップ

```bash
npm install
npm run dev       # 開発サーバー起動
npm run build     # 本番ビルド（dist/に出力）
npm run typecheck # 型チェックのみ
```

## ディレクトリ構成

```
src/
  scenes/     Phaserシーン（Boot / Preload / Game / Settings / Stats）
  components/ リール・ランプ・ボタンなどの描画コンポーネント
  systems/    ゲームロジック（抽選・払い出し・リール制御・設定確率）
  models/     型定義・リール配列・セーブデータ形式
  services/   LocalStorage保存・サウンド合成・Service Worker登録
  ui/         レイアウト定数
  utils/      図柄テクスチャの生成など
scripts/
  generate-icons.mjs  PWAアイコン(PNG/SVG)をコードから生成するスクリプト
```

## ゲーム仕様概要

- 3枚BET固定、初期クレジット50枚
- 図柄：FRUIT / STAR / BELL / CLOVER / REPLAY / LUCKY（すべてオリジナル図柄）
- 目押し猶予4コマ（5コマ範囲）でリールを制御し、内部抽選結果に応じて図柄を引き込む
- BIG（約280枚）/ REG（約100枚）ボーナス。内部フラグは次ゲーム以降へ持ち越し
- 告知ランプ（通常点灯・点滅・虹色点灯）をレバーON時・第3停止後に抽選
- 設定1〜6を切り替え可能（設定変更画面）。各設定でBIG/REG/合算/小役確率を管理
- 統計画面で総ゲーム数・BIG/REG回数・小役確率・差枚・最大獲得枚数を確認可能
- 効果音はすべてWeb Audio APIでその場合成したオリジナル音源（外部音源ファイル不使用）

## PWA

- ホーム画面への追加、オフライン起動に対応（manifest.json / Service Worker）
- アイコン・Splash Screenはコード生成（`scripts/generate-icons.mjs`）

## Firebase Hostingへのデプロイ

```bash
npm run build
firebase login
firebase init hosting   # publicディレクトリに dist を指定（firebase.jsonは設定済み）
firebase deploy
```
