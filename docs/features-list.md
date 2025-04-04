【要件詳細】

### **1. ユーザー管理・認証**
- Supabase で「無料ユーザー」「有料ユーザー」ロールを区別し、認証を行う。
- ログインしていない場合、閲覧可能なページは制限される。

### **2. 動画コンテンツ管理**
- 動画は一部が無料、残りが有料コンテンツとして設定されている。
- 動画データ（タイトル、説明、URLなど）を Supabase のテーブルで管理。
- 「無料/有料」のフラグに応じて動画プレーヤーの表示・非表示を制御。

### **3. コース構造**
- 1つのコースに動画が10本前後存在する。
- コース自体にも「無料/有料」設定があり、個々の動画設定との整合性を確保する。

### **4. 料金プラン**
- 「スタンダードプラン」と「フィードバックプラン」の2種類。
- それぞれ「1か月更新」「3か月ごと更新」のサブスクリプションがある（計4種類のサブスク）。
- Stripe の product/price を使って実装し、決済後に Supabase 側のユーザーロールを更新。

### **5. UI/UX：無料と有料ユーザーの出し分け**
- 無料ユーザーには「新規登録/ログイン」などの導線を表示。
- 有料サブスクユーザーには「アカウント管理」「コース一覧」などを表示。
- Tailwind CSS を用いたレスポンシブ対応・コンポーネント設計をお願いしたい。

### **6. 動画閲覧コントロール**
- 無料ユーザーが有料動画へアクセスした場合、再生できない状態にしつつサブスク誘導のメッセージを表示。
- 認証トークンチェック等の仕組みでセキュリティを担保。

### **7. サブスク管理フロー**
- Stripe Checkout から決済 → 成功後にユーザーを有料ロールへ変更。
- キャンセル・期限切れのときにロールを無料ユーザーに戻す仕組みを検討。
- Stripe ポータル画面へのリンク（アカウント管理ページなど）を用意。

### **8. 学習進捗や受講情報**
- 可能であれば、各動画の視聴完了状態をデータベースに保存し、ユーザーがどこまで学習したかを確認できるように。
- （初期実装段階では必須でなくてもよい）