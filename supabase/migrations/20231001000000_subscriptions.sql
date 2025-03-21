
-- 1. サブスクリプションテーブルの作成
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL,
  billing_period TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  
  CONSTRAINT plan_type_check CHECK (plan_type IN ('free', 'standard', 'feedback')),
  CONSTRAINT billing_period_check CHECK (billing_period IN ('monthly', 'quarterly')),
  CONSTRAINT status_check CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing'))
);

-- 2. RLSの設定
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分のサブスクリプションのみ参照可能
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- 管理者のみサブスクリプションを追加・更新可能
CREATE POLICY "Only admins can insert subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND auth.jwt() ->> 'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update subscriptions" ON subscriptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND auth.jwt() ->> 'role' = 'admin'
    )
  );

-- 3. 顧客情報テーブルの作成
CREATE TABLE IF NOT EXISTS customer_info (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE customer_info ENABLE ROW LEVEL SECURITY;

-- ユーザーが自分の顧客情報のみ参照可能
CREATE POLICY "Users can view own customer info" ON customer_info
  FOR SELECT USING (auth.uid() = id);

-- 管理者のみ顧客情報を追加・更新可能
CREATE POLICY "Only admins can insert customer info" ON customer_info
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND auth.jwt() ->> 'role' = 'admin'
    )
  );

CREATE POLICY "Only admins can update customer info" ON customer_info
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id AND auth.jwt() ->> 'role' = 'admin'
    )
  );

-- 4. インデックスの作成
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_idx ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS customer_info_stripe_customer_id_idx ON customer_info(stripe_customer_id);
