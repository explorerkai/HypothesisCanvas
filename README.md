# 仮説キャンバス Webアプリケーション

仮説キャンバスをWebアプリケーション化し、チーム全体で同時に戦略を議論しながら作り上げるツールです。

## 機能

- **キャンバス編集**: 仮説キャンバスの各項目を自由に編集
- **ドラッグ&ドロップ**: 項目をマウスで自由に移動
- **リアルタイム同期**: 5秒ごとに自動同期で複数ユーザー同時編集
- **データ保存**: JSON形式での保存・読み込み
- **PDF出力**: 作成したキャンバスのPDF出力
- **視覚的フィードバック**: 未記入領域の色分け表示

## 仮説キャンバス項目

1. 目的
2. ビジョン
3. 顕在課題／潜在課題
4. 代替手段
5. 状況／傾向
6. 提案価値
7. 実現手段
8. 優位性
9. チャネル
10. 評価指標
11. 収益モデル
12. 市場規模

## 技術スタック

- **フロントエンド**: React.js
- **バックエンド**: Node.js + Express
- **データベース**: SQLite
- **同期方式**: 定期自動更新（5秒間隔）

## ディレクトリ構造

```
hypothesis-canvas/
├── frontend/           # Reactフロントエンド
│   ├── src/
│   │   ├── components/ # Reactコンポーネント
│   │   ├── pages/      # ページコンポーネント
│   │   ├── services/   # API通信サービス
│   │   └── utils/      # ユーティリティ関数
│   ├── public/         # 静的ファイル
│   └── package.json
├── backend/            # Node.jsバックエンド
│   ├── routes/         # APIルート
│   ├── models/         # データモデル
│   ├── controllers/    # コントローラー
│   └── utils/          # ユーティリティ
├── database/           # SQLiteデータベースファイル
├── docs/               # ドキュメント
├── public/             # 公開用静的ファイル
├── requirements.md     # 要件定義
└── README.md
```

## インストール・実行方法

### バックエンド
```bash
cd backend
npm install
npm start
```

### フロントエンド
```bash
cd frontend
npm install
npm start
```

## 開発プロセス

1. 要件定義（requirements.md）
2. ディレクトリ構造整理 ✓
3. フロントエンド実装（React）
4. バックエンド実装（Node.js/Express）
5. データベース実装（SQLite）
6. 同期機能実装
7. PDF出力機能実装
8. テスト・デプロイ

## デプロイ

GitHub Pagesでの動作テストを想定しています。

## 貢献

1. このリポジトリをフォーク
2. 機能ブランチを作成
3. 変更をコミット
4. プッシュしてプルリクエストを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。</content>
<parameter name="filePath">c:\Users\tksna\OneDrive\ドキュメント\04_Codex\06_HypothesisCanvas\README.md