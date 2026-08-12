# 人生クエスト (Life Quest)

日々の行動・学習・運動などを記録すると経験値を獲得し、キャラクターがRPGのように成長していく、
レトロ8bit/16bit風デザインのライフログPWAです。

「努力を管理するアプリ」ではなく「努力がそのままRPGになるアプリ」をコンセプトに、

```
行動の記録 → EXP獲得 → レベルアップ → ステータス上昇 → スキル/称号解放 → 新しいクエスト
```

というゲームループを実装しています。

## 画面構成

下部ナビゲーション5+1タブ:

- **ホーム** — キャラクターのドット絵、レベル/EXP、HP/MP、ステータス
- **冒険** — 今日の行動記録、記録フォーム、冒険のけっか演出
- **のうりょく** — 全ステータスと3ヶ月前との比較
- **スキル** — スキル一覧/スキルツリー(カテゴリ別熟練度)、NEXTスキルのプレビュー
- **クエスト** — デイリー/ウィークリーのチェックリストとコンプリートボーナス
- **メニュー** — 冒険日誌・称号・職業・設定へのリンク

## 技術スタック

- Next.js 16 (App Router) / React 19 / TypeScript
- Tailwind CSS v4
- Zustand (`persist` middleware, localStorage)
- PWA: `app/manifest.ts` + `public/sw.js` + 自動生成アイコン

データ層はSupabaseのテーブル設計 (`users` / `characters` / `stats` / `activities` /
`activity_categories` / `experience_logs` / `levels` / `skills` / `user_skills` /
`quests` / `user_quests` / `titles` / `user_titles` / `adventure_logs`) を想定した
型 (`src/lib/data/types.ts`) を土台にしており、現状はローカル(zustand + localStorage)実装ですが、
`recordActivity` などのゲームロジックは純粋関数として `src/lib/game/` に分離してあるため、
永続化層をSupabaseクライアントに差し替えるだけで移行できる構成にしています。

## セットアップ

```bash
npm install
npm run dev
```

http://localhost:3000 を開くと `/home` にリダイレクトされます。iPhone想定 (375×812) の
モバイルファーストUIですが、PC幅でも中央寄せで表示されます。

デモ用キャラクター「TAKUYA」(Lv.27) のデータが初期状態から入っています。
設定画面からいつでもデモデータにリセットできます。

## アイコンの再生成

```bash
node scripts/generate-icons.mjs
```

外部素材を使わず、座標計算だけで生成した「経験値クリスタル」のドット絵アイコンを
`public/icons/` と `src/app/icon.svg` に書き出します。
